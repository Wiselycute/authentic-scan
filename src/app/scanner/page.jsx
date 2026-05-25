"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeft, Send, Camera, Upload, QrCode, Barcode,
  Shield, ScanLine, CheckCircle2, AlertTriangle, Loader2, X, RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrowserMultiFormatReader, BarcodeFormat, DecodeHintType, NotFoundException,
} from "@zxing/library";

// ─── constants ────────────────────────────────────────────────────────────────

const AI_STEPS = [
  "Reading packaging text...",
  "Checking barcode database...",
  "Analyzing logo consistency...",
  "Scanning QR metadata...",
];

let _msgId = 1;
const mkId = () => _msgId++;

// ─── component ────────────────────────────────────────────────────────────────

export default function Scanner({ onScan, onBack }) {
  // ── state ──────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([{
    id: mkId(),
    type: "assistant",
    content: "Hello 👋 Upload, snap, or scan a product to verify if it's authentic.",
  }]);
  const [preview, setPreview]           = useState(null);
  const [scanMode, setScanMode]         = useState(null);   // "image" | "qr" | "barcode"
  const [cameraActive, setCameraActive] = useState(false);
  const [codeDetected, setCodeDetected] = useState(false);
  const [scannedCode, setScannedCode]   = useState("");
  const [loading, setLoading]           = useState(false);
  const [aiStep, setAiStep]             = useState(0);
  const [error, setError]               = useState("");
  const [showHelp, setShowHelp]         = useState(false);

  // ── refs ───────────────────────────────────────────────────────────────────
  const videoRef       = useRef(null);
  const canvasRef      = useRef(null);
  const fileInputRef   = useRef(null);
  const chatRef        = useRef(null);
  const chatEndRef     = useRef(null);
  const streamRef      = useRef(null);
  const readerRef      = useRef(null);
  const startingRef    = useRef(false);
  const scannedCodeRef = useRef("");   // mirror of scannedCode for callbacks

  // ── helpers ────────────────────────────────────────────────────────────────
  const addMsg   = (payload) => setMessages(prev => [...prev, { id: mkId(), ...payload }]);
  const showErr  = (msg) => setError(msg);
  const clearErr = () => setError("");

  const scrollBottom = (behavior = "smooth") => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior, block: "end" });
          return;
        }
        if (chatRef.current) {
          chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior });
        }
      });
    });
  };

  // ── effects ────────────────────────────────────────────────────────────────
  useEffect(() => { return () => stopCamera(); }, []);
  useEffect(() => { scrollBottom(messages.length > 1 ? "smooth" : "auto"); }, [messages]);
  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setAiStep(p => (p + 1) % AI_STEPS.length), 900);
    return () => clearInterval(t);
  }, [loading]);

  // ── STOP CAMERA ────────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (readerRef.current) {
      try { readerRef.current.reset(); } catch (_) {}
      readerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    startingRef.current = false;
    setCameraActive(false);
    setCodeDetected(false);
  }, []);

  // ── START CAMERA ───────────────────────────────────────────────────────────
  const startCamera = async (mode = "image") => {
    if (startingRef.current) return;

    // HTTPS guard (required on mobile, except localhost)
    if (!window.isSecureContext) {
      const local = ["localhost", "127.0.0.1"].includes(window.location.hostname);
      if (!local) {
        showErr("Camera requires a secure connection (HTTPS). Please open the app over HTTPS.");
        return;
      }
    }

    stopCamera();
    startingRef.current = true;
    clearErr();
    setScanMode(mode);
    setScannedCode("");
    scannedCodeRef.current = "";
    setCodeDetected(false);

    if (mode === "qr" || mode === "barcode") {
      // FIX 4: Show overlay FIRST so video element is visible before ZXing touches it.
      // On Android, ZXing calling play() on a hidden video yields a black frame.
      setCameraActive(true);
      // Wait one frame for React to render the visible overlay before starting ZXing.
      await new Promise(r => setTimeout(r, 50));
      requestAnimationFrame(() => startCodeScanner(mode));
      return;
    }

    // ── photo mode ──
    // FIX 4: Show the overlay BEFORE getting the stream so video.play() is
    // called on a visible element. Android Chrome yields a black frame otherwise.
    setCameraActive(true);
    await new Promise(r => setTimeout(r, 50)); // one frame for React to flush

    try {
      let stream;
      try {
        // Primary: environment-facing camera with preferred resolution
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width:  { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch {
        // FIX 2: Android fallback — some devices reject environment constraints.
        // Fall back to any available camera.
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;

        // Wait for the video to have enough data before playing.
        if (video.readyState < 3) {
          await new Promise((resolve) => {
            video.addEventListener("canplay", resolve, { once: true });
          });
        }

        await video.play().catch(console.error);
      }
    } catch (err) {
      handleCameraError(err);
    } finally {
      startingRef.current = false;
    }
  };

  const handleCameraError = (err) => {
    startingRef.current = false;
    setCameraActive(false);
    console.error("Camera error:", err);

    if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
      showErr("Camera permission denied. Allow camera access in your browser settings, then try again.");
    } else if (err?.name === "NotFoundError") {
      showErr("No camera found on this device.");
    } else if (err?.name === "NotReadableError") {
      showErr("Camera is in use by another app. Close it and try again.");
    } else {
      showErr("Could not access camera. Check permissions and try again.");
    }
  };

  // ── QR / BARCODE SCANNER ───────────────────────────────────────────────────
  const startCodeScanner = (mode) => {
    if (!videoRef.current) { startingRef.current = false; return; }

    const hints = new Map();
    hints.set(
      DecodeHintType.POSSIBLE_FORMATS,
      mode === "qr"
        ? [BarcodeFormat.QR_CODE]
        : [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.CODE_128,
           BarcodeFormat.CODE_39, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E]
    );
    hints.set(DecodeHintType.TRY_HARDER, true);

    readerRef.current = new BrowserMultiFormatReader(hints, 300);

    readerRef.current
      .decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
        if (result) {
          const text = result.getText();
          scannedCodeRef.current = text;
          setScannedCode(text);
          setCodeDetected(true);
          if (readerRef.current) {
            try { readerRef.current.reset(); } catch (_) {}
            readerRef.current = null;
          }
          return;
        }
        if (err && !(err instanceof NotFoundException)) {
          console.warn("Scan error:", err);
        }
      })
      .catch(handleCameraError)
      .finally(() => { startingRef.current = false; });
  };

  // ── CAPTURE PHOTO ──────────────────────────────────────────────────────────
  const capturePhoto = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width  = video.videoWidth  || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setPreview(dataUrl);
    stopCamera();
  };

  // ── FILE UPLOAD ────────────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    clearErr();
    if (!file.type.startsWith("image/")) { showErr("Please upload an image file."); return; }
    if (file.size > 10 * 1024 * 1024)   { showErr("Image must be under 10 MB."); return; }
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── MOCK ANALYSIS ──────────────────────────────────────────────────────────
  const buildMockAnalysis = (source) => {
    const sample = String(source || "").slice(0, 1800);
    let hash = 0;
    for (let i = 0; i < sample.length; i++) hash = (hash * 31 + sample.charCodeAt(i)) % 100000;

    const confidence = 62 + (hash % 35);
    const pool = [
      "Minor typography mismatch between brand name and side panel",
      "Inconsistent spacing around regulatory text",
      "Printing sharpness is uneven near batch information",
      "Color tone differs slightly from expected brand palette",
      "Barcode margin looks narrower than standard packaging guides",
    ];
    const count = confidence >= 84 ? 1 : confidence >= 72 ? 2 : 3;

    let status = "suspicious";
    if (confidence >= 88) status = "authentic";
    else if (confidence >= 72) status = "review";

    return {
      status,
      confidence,
      suspiciousIndicators: pool.slice(0, count),
      detailedReasoning: [
        "Packaging structure appears mostly consistent, but micro-text and kerning are not fully uniform across panels.",
        "Brand identity markers are present, though logo finishing and print density suggest possible non-official print reproduction.",
        "No single element confirms counterfeit status; confidence is based on combined visual risk indicators.",
      ],
    };
  };

  // ── ANALYZE ────────────────────────────────────────────────────────────────
  const analyzeProduct = ({ image = preview, code = scannedCode } = {}) => {
    if (!image && !code) return;

    const img  = image;
    const cd   = code;
    const ldId = mkId();

    if (img) setPreview(null);
    clearErr();
    setAiStep(0);
    setLoading(true);

    setMessages(prev => [
      ...prev,
      ...(img ? [{ id: mkId(), type: "user", image: img, content: "Product image submitted for analysis." }] : []),
      ...(cd  ? [{ id: mkId(), type: "user", content: `Scanned code: ${cd}` }] : []),
      { id: ldId, type: "assistant", loading: true },
    ]);
    scrollBottom();

    setTimeout(() => {
      const result = buildMockAnalysis(cd || img);
      setMessages(prev => [
        ...prev.filter(m => m.id !== ldId),
        { id: mkId(), type: "assistant", result },
      ]);
      setLoading(false);
      scrollBottom();
      if (onScan) onScan(result);
    }, 3200);
  };

  // ── VERIFY SCANNED CODE ────────────────────────────────────────────────────
  const verifyCode = () => {
    const code = scannedCodeRef.current || scannedCode;
    if (!code) return;
    stopCamera();
    analyzeProduct({ code });
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  const canSend = (!!preview || !!scannedCode) && !loading;
  const isInitialState = messages.length === 1 && !preview && !scannedCode && !loading;

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#050816] text-white flex flex-col">

      {/* ── background glows ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-3xl" />
      </div>

      {/* ── header ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-2xl">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                AuthentiScan
              </h1>
              <p className="text-[11px] text-white/35 leading-none">AI Product Verification</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs text-cyan-200">Live</span>
          </div>
        </div>
      </header>

      {/* ── main ── */}
      <div className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 py-4 flex flex-col">

        {/* ── chat scroll area ── */}
        <div
          ref={chatRef}
          className={`flex-1 overflow-y-auto space-y-4 ${isInitialState ? "flex flex-col justify-center pb-6" : "pb-52"}`}
        >

          {/* error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 flex items-start justify-between gap-3"
              >
                <div>
                  <p className="text-sm text-rose-100">{error}</p>
                  <button
                    onClick={() => setShowHelp(true)}
                    className="text-xs text-rose-300 underline mt-1.5 hover:text-white transition"
                  >
                    How to fix camera permissions →
                  </button>
                </div>
                <button onClick={clearErr} className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
                  <X className="w-3.5 h-3.5 text-rose-200" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* messages */}
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.type === "user" ? (
                  <div className="max-w-[88%] md:max-w-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/20 rounded-2xl p-3.5 backdrop-blur-xl">
                    {msg.image && (
                      <img src={msg.image} alt="Product" className="rounded-xl mb-2.5 max-h-72 w-full object-cover" />
                    )}
                    <p className="text-white/85 text-sm">{msg.content}</p>
                  </div>
                ) : (
                  <div className="max-w-[92%] md:max-w-2xl">
                    {msg.loading ? (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-cyan-400 shrink-0" />
                        <div>
                          <p className="text-white/70 text-sm">Analyzing your product…</p>
                          <p className="text-xs text-cyan-300/70 mt-0.5">{AI_STEPS[aiStep]}</p>
                        </div>
                      </div>
                    ) : msg.result ? (
                      <ResultCard result={msg.result} />
                    ) : (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <p className="text-white/80 text-sm">{msg.content}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />

        </div>{/* end chat scroll */}

        {/* ── fixed input bar ── */}
        <div
          className={isInitialState
            ? "mt-6 w-full max-w-3xl mx-auto"
            : "fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#050816]/85 backdrop-blur-3xl"
          }
        >
          <div className="max-w-5xl mx-auto px-3 sm:px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">

            {/* image preview thumbnail */}
            <AnimatePresence>
              {preview && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-3 relative w-24 h-24"
                >
                  <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-xl border border-cyan-400/25" />
                  <button
                    onClick={() => setPreview(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center shadow"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* action bar */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-2 flex items-center gap-2">

              <ActionBtn onClick={() => fileInputRef.current?.click()} label="Upload image">
                <Upload className="w-5 h-5 text-cyan-300" />
              </ActionBtn>

              <ActionBtn onClick={() => startCamera("image")} label="Take photo">
                <Camera className="w-5 h-5 text-cyan-300" />
              </ActionBtn>

              <ActionBtn onClick={() => startCamera("qr")} label="Scan QR">
                <QrCode className="w-5 h-5 text-cyan-300" />
              </ActionBtn>

              <ActionBtn onClick={() => startCamera("barcode")} label="Scan barcode">
                <Barcode className="w-5 h-5 text-cyan-300" />
              </ActionBtn>

              <div className="hidden sm:flex flex-1 h-10 rounded-xl bg-black/20 border border-white/5 px-3 items-center">
                <span className="text-white/35 text-xs truncate">Upload or scan to verify…</span>
              </div>

              <button
                onClick={() => analyzeProduct()}
                disabled={!canSend}
                aria-label="Analyze product"
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition shrink-0 ${
                  canSend
                    ? "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/30 active:scale-95"
                    : "bg-white/8 text-white/30 cursor-not-allowed"
                }`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-center text-[10px] text-white/25 mt-2">
              AI-powered verification · QR & barcode support · Secure scanning
            </p>
          </div>
        </div>

      </div>{/* end main */}

      {/*
        ── CAMERA OVERLAY (FIX 3) ──────────────────────────────────────────────
        Moved OUT of the scroll area and into a fixed full-screen overlay.
        z-index: 60 ensures it renders above the header (z-50) and input bar (z-40).
        This eliminates the stacking-context and scroll-area clipping issues that
        caused the camera view to be invisible on Android and iOS.
      */}
      <canvas ref={canvasRef} className="hidden" />

      <div
        style={{
          display: cameraActive ? "flex" : "none",
          position: "fixed",
          inset: 0,
          zIndex: 60,
          background: "#000",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-start",
        }}
      >
        {/* FIX 1: Added webkit-playsinline for iOS Safari.
            FIX 4: Video is always rendered inside the now-visible fixed overlay,
            so play() is never called on a hidden element. */}
        <video
          ref={videoRef}
          playsInline
          // eslint-disable-next-line react/no-unknown-property
          webkit-playsinline="true"
          muted
          autoPlay
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "translateZ(0)",
            WebkitTransform: "translateZ(0)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        />

        {/* scan overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`border-2 border-cyan-400 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.5)] relative ${
              scanMode === "barcode" ? "w-4/5 h-32" : "w-64 h-64"
            }`}
          >
            {["tl","tr","bl","br"].map(c => (
              <span key={c} className={`absolute w-4 h-4 border-cyan-400 border-2 ${
                c === "tl" ? "top-0 left-0 border-r-0 border-b-0 rounded-tl-lg" :
                c === "tr" ? "top-0 right-0 border-l-0 border-b-0 rounded-tr-lg" :
                c === "bl" ? "bottom-0 left-0 border-r-0 border-t-0 rounded-bl-lg" :
                             "bottom-0 right-0 border-l-0 border-t-0 rounded-br-lg"
              }`} />
            ))}
            <motion.div
              className="absolute left-2 right-2 h-0.5 bg-cyan-400/80 blur-[1px]"
              animate={{ top: ["10%", "90%", "10%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* top label */}
        <div className="absolute top-[calc(1rem+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-cyan-400/20 px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap">
          <ScanLine className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs text-white/90">
            {scanMode === "image" ? "Frame the product" : scanMode === "qr" ? "Align QR code" : "Align barcode"}
          </span>
        </div>

        {/* code detected badge */}
        <AnimatePresence>
          {codeDetected && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="absolute top-[calc(3.5rem+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 bg-emerald-500/20 border border-emerald-400/40 px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-200">Code detected!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* bottom controls — safe-area aware */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3"
          style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
        >
          <button
            onClick={stopCamera}
            className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-sm hover:bg-white/20 transition text-white"
          >
            Cancel
          </button>

          {scanMode === "image" ? (
            <button
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border-4 border-white/30 shadow-xl shadow-cyan-500/30 active:scale-95 transition"
            />
          ) : (
            <button
              onClick={verifyCode}
              disabled={!codeDetected}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition ${
                codeDetected
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 active:scale-95 text-white"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              Verify Code
            </button>
          )}
        </div>
      </div>
      {/* ── end camera overlay ── */}

      {/* ── camera help modal ── */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md rounded-3xl border border-cyan-400/25 bg-[#0b1326]/95 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-cyan-100">Camera Permission Help</h3>
                <button onClick={() => setShowHelp(false)} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4 text-sm text-white/80">
                <p className="text-cyan-100/90">
                  Camera requires HTTPS. Open the app at <span className="font-semibold">https://your-local-ip:3000</span> (not http://).
                </p>
                <div>
                  <p className="font-semibold text-white mb-1">Android · Chrome</p>
                  <ol className="space-y-0.5 list-decimal list-inside text-white/70">
                    <li>Tap the lock icon in the address bar</li>
                    <li>Open Site settings</li>
                    <li>Set Camera → Allow</li>
                    <li>Reload the page</li>
                  </ol>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">iPhone · Safari</p>
                  <ol className="space-y-0.5 list-decimal list-inside text-white/70">
                    <li>Tap AA in the address bar</li>
                    <li>Tap Website Settings</li>
                    <li>Set Camera → Allow</li>
                    <li>Reload the page</li>
                  </ol>
                </div>
              </div>
              <div className="mt-5 flex gap-2 justify-end">
                <button
                  onClick={() => { setShowHelp(false); startCamera(scanMode || "image"); }}
                  className="px-4 py-2 rounded-xl border border-white/15 text-sm hover:bg-white/10 transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
                <button
                  onClick={() => setShowHelp(false)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-semibold"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
    </div>
  );
}

// ─── sub-components ───────────────────────────────────────────────────────────

function ActionBtn({ onClick, label, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-11 h-11 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 flex items-center justify-center transition shrink-0 active:scale-95"
    >
      {children}
    </button>
  );
}

function ResultCard({ result }) {
  const isAuth   = result.status === "authentic";
  const isReview = result.status === "review";
  const color    = isAuth ? "emerald" : isReview ? "cyan" : "amber";
  const colorMap = {
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-400/30", icon: "bg-emerald-500/20", text: "text-emerald-400" },
    cyan:    { bg: "bg-cyan-500/10",    border: "border-cyan-400/30",    icon: "bg-cyan-500/20",    text: "text-cyan-400"    },
    amber:   { bg: "bg-amber-500/10",   border: "border-amber-400/30",   icon: "bg-amber-500/20",   text: "text-amber-400"   },
  };
  const c = colorMap[color];

  return (
    <div className={`rounded-2xl border p-5 backdrop-blur-xl ${c.bg} ${c.border}`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${c.icon}`}>
          {isAuth
            ? <CheckCircle2 className={`w-6 h-6 ${c.text}`} />
            : isReview
            ? <ScanLine className={`w-6 h-6 ${c.text}`} />
            : <AlertTriangle className={`w-6 h-6 ${c.text}`} />}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-lg mb-0.5">
            {isAuth ? "Likely Authentic" : isReview ? "Needs Manual Review" : "Authenticity Concerns"}
          </h2>
          <p className="text-white/55 text-sm mb-4">
            Confidence: <span className="text-white font-semibold">{result.confidence}%</span>
          </p>

          <ConfidenceBar value={result.confidence} color={color} />

          <div className="mt-4 space-y-3">
            <Section title="Suspicious indicators" items={result.suspiciousIndicators} />
            <Section title="Detailed reasoning"    items={result.detailedReasoning} />
          </div>

          <button className="mt-4 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-semibold hover:opacity-90 transition">
            Save Report
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfidenceBar({ value, color }) {
  const colorClass = { emerald: "bg-emerald-400", cyan: "bg-cyan-400", amber: "bg-amber-400" }[color];
  return (
    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${colorClass}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

function Section({ title, items }) {
  return (
    <div>
      <p className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">{title}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-white/75 flex gap-2">
            <span className="text-white/30 shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
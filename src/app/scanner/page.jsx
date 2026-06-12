"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Send, Camera, Upload, QrCode, Barcode, Menu,
  Shield, ScanLine, CheckCircle2, AlertTriangle, Loader2, X, RefreshCw, Trash2, Search, Copy, Check, LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrowserMultiFormatReader, BarcodeFormat, DecodeHintType, NotFoundException,
} from "@zxing/library";
import { request, requestForm } from "@/app/api/services/base.service";
import { useAuth } from "@/utils/contexts/AuthContext";

// ─── constants ────────────────────────────────────────────────────────────────

const AI_STEPS = [
  "Reading packaging text...",
  "Checking barcode database...",
  "Analyzing logo consistency...",
  "Scanning QR metadata...",
];

const HISTORY_LIMIT = 20;

const statusMap = {
  likely_authentic: "authentic",
  review_required: "review",
  suspicious: "suspicious",
  unverified: "review",
};

let _msgId = 1;
const mkId = () => _msgId++;

const dataUrlToFile = async (dataUrl, fileName = "scan.jpg") => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: blob.type || "image/jpeg" });
};

const firstNonEmpty = (...values) => values.find((value) => typeof value === "string" && value.trim())?.trim() || "";
const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 50);
};

const buildScanTitle = (...values) => {
  const value = firstNonEmpty(...values);
  if (!value) return "Product scan";
  return /^scan\s*:/i.test(value) ? value : `Scan: ${value}`;
};

const normalizeScanResult = (payload) => {
  const analysis = payload?.analysis || {};
  const rawStatus = String(analysis.status || "").toLowerCase();
  const normalizedStatus = statusMap[rawStatus] || "review";
  const confidence = Math.max(0, Math.min(100, Number(analysis.confidence) || 0));
  const scanId = payload?.scan?._id || null;
  const productName = firstNonEmpty(
    payload?.scan?.productName,
    payload?.scan?.product?.name,
    analysis?.productName,
    payload?.productName,
    payload?.product?.name,
    "Unknown Product",
  );
  const brandName = firstNonEmpty(
    payload?.scan?.brandName,
    payload?.scan?.brand?.name,
    analysis?.brandName,
    payload?.brandName,
  );
  const category = firstNonEmpty(
    payload?.scan?.category,
    analysis?.category,
    payload?.product?.category,
  );
  const imageThumbnail = firstNonEmpty(
    payload?.scan?.uploadedImage?.url,
    payload?.scan?.imageThumbnail,
    payload?.scan?.image,
  );
  const manufacturer = firstNonEmpty(
    payload?.scan?.metadata?.manufacturer,
    payload?.scan?.product?.manufacturer,
    analysis?.manufacturer,
    payload?.manufacturer,
  );
  const countryOfOrigin = firstNonEmpty(
    payload?.scan?.metadata?.countryOfOrigin,
    payload?.scan?.brand?.country,
    payload?.scan?.product?.countryOfOrigin,
    analysis?.countryOfOrigin,
    payload?.countryOfOrigin,
  );
  const ingredients = normalizeStringArray(
    payload?.scan?.metadata?.ingredients
      || payload?.scan?.product?.ingredients
      || analysis?.ingredients
      || payload?.ingredients
  );
  const productImage = firstNonEmpty(
    payload?.scan?.metadata?.productImage,
    analysis?.productImage,
    payload?.scan?.uploadedImage?.url,
    payload?.scan?.product?.referenceImages?.[0],
  );

  const suspiciousIndicators = Array.isArray(analysis.suspiciousIndicators)
    ? analysis.suspiciousIndicators
    : [];

  const reasoning = Array.isArray(analysis.reasoning) ? analysis.reasoning : [];
  const recommendation = analysis.recommendation ? [analysis.recommendation] : [];

  return {
    scanId,
    title: buildScanTitle(payload?.scan?.title, productName),
    source: payload?.scan?.source || payload?.source || null,
    createdAt: payload?.scan?.createdAt || null,
    updatedAt: payload?.scan?.updatedAt || null,
    productName,
    brandName,
    category,
    imageThumbnail,
    manufacturer,
    countryOfOrigin,
    ingredients,
    productImage,
    status: normalizedStatus,
    confidence,
    suspiciousIndicators: suspiciousIndicators.length > 0
      ? suspiciousIndicators
      : ["No major risk indicators were returned by the analysis."],
    detailedReasoning: [...reasoning, ...recommendation].slice(0, 5),
  };
};

const normalizeHistoryItem = (item) => {
  if (!item || typeof item !== "object") return null;

  const scanId = item.scanId || item._id || item.id || item?.scan?._id;
  if (!scanId) return null;

  const rawStatus = String(item.verificationStatus || item.status || item?.aiAnalysis?.status || "review").toLowerCase();
  const status = statusMap[rawStatus] || rawStatus || "review";

  const productName = firstNonEmpty(
    item.productName,
    item.product?.name,
    item.title,
    item.scanTitle,
    "Unknown Product",
  );

  const brandName = firstNonEmpty(item.brandName, item.brand?.name);
  const imageThumbnail = firstNonEmpty(item.imageThumbnail, item.image, item.uploadedImage?.url);
  const category = firstNonEmpty(item.category, item.product?.category);
  const manufacturer = firstNonEmpty(item.manufacturer, item.product?.manufacturer);
  const countryOfOrigin = firstNonEmpty(item.countryOfOrigin, item.brand?.country, item.product?.countryOfOrigin);
  const ingredients = normalizeStringArray(item.ingredients || item.product?.ingredients);
  const productImage = firstNonEmpty(item.productImage, imageThumbnail, item.product?.referenceImages?.[0]);

  return {
    scanId: String(scanId),
    title: buildScanTitle(item.title, item.scanTitle, productName),
    source: item.source || null,
    productName,
    brandName,
    category,
    imageThumbnail,
    manufacturer,
    countryOfOrigin,
    ingredients,
    productImage,
    status,
    confidence: Math.max(0, Math.min(100, Number(item.confidence || item?.aiAnalysis?.confidence) || 0)),
    createdAt: item.createdAt || item.updatedAt || null,
  };
};

const normalizeScanDetail = (detail) => {
  const analysis = detail?.aiAnalysis || detail?.analysis || {};
  const rawStatus = String(detail?.verificationStatus || analysis?.status || "review").toLowerCase();
  const productName = firstNonEmpty(
    detail?.productName,
    detail?.scan?.productName,
    detail?.product?.name,
    analysis?.productName,
    "Unknown Product",
  );
  const brandName = firstNonEmpty(
    detail?.brandName,
    detail?.scan?.brandName,
    detail?.brand?.name,
    analysis?.brandName,
  );
  const category = firstNonEmpty(
    detail?.category,
    detail?.scan?.category,
    detail?.product?.category,
    analysis?.category,
  );
  const imageThumbnail = firstNonEmpty(
    detail?.imageThumbnail,
    detail?.uploadedImage?.url,
    detail?.scan?.uploadedImage?.url,
  );
  const manufacturer = firstNonEmpty(
    detail?.manufacturer,
    detail?.metadata?.manufacturer,
    detail?.product?.manufacturer,
    analysis?.manufacturer,
  );
  const countryOfOrigin = firstNonEmpty(
    detail?.countryOfOrigin,
    detail?.metadata?.countryOfOrigin,
    detail?.brand?.country,
    detail?.product?.countryOfOrigin,
    analysis?.countryOfOrigin,
  );
  const ingredients = normalizeStringArray(
    detail?.ingredients
      || detail?.metadata?.ingredients
      || detail?.product?.ingredients
      || analysis?.ingredients
  );
  const productImage = firstNonEmpty(
    detail?.productImage,
    detail?.metadata?.productImage,
    detail?.uploadedImage?.url,
    detail?.product?.referenceImages?.[0],
  );

  return {
    scanId: detail?.scanId || detail?._id || detail?.scan?._id || null,
    title: buildScanTitle(detail?.title, detail?.scan?.title, productName),
    source: detail?.source || detail?.scan?.source || null,
    createdAt: detail?.createdAt || detail?.scan?.createdAt || null,
    updatedAt: detail?.updatedAt || detail?.scan?.updatedAt || null,
    productName,
    brandName,
    category,
    imageThumbnail,
    manufacturer,
    countryOfOrigin,
    ingredients,
    productImage,
    status: statusMap[rawStatus] || rawStatus || "review",
    confidence: Math.max(0, Math.min(100, Number(detail?.confidence || analysis?.confidence) || 0)),
    suspiciousIndicators: Array.isArray(detail?.suspiciousIndicators)
      ? detail.suspiciousIndicators
      : Array.isArray(analysis?.suspiciousIndicators)
        ? analysis.suspiciousIndicators
        : ["No major risk indicators were returned by the analysis."],
    detailedReasoning: [
      ...(Array.isArray(detail?.reasoning) ? detail.reasoning : []),
      ...(Array.isArray(analysis?.reasoning) ? analysis.reasoning : []),
      ...(detail?.recommendation ? [detail.recommendation] : []),
      ...(analysis?.recommendation ? [analysis.recommendation] : []),
    ].filter(Boolean).slice(0, 5),
  };
};

const formatHistoryDate = (value) => {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString();
};

// ─── component ────────────────────────────────────────────────────────────────

export default function Scanner({ onScan, onBack }) {
  const router = useRouter();
  const { user, isLogin, isAuthLoading, logout } = useAuth();

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isLogin) {
      router.replace("/login");
    }
  }, [isAuthLoading, isLogin, router]);

  // ── state ──────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([{
    id: mkId(),
    type: "assistant",
    content: "Hello 👋 Upload, snap, or scan a product to verify if it's authentic.",
  }]);
  const [preview, setPreview]           = useState(null);
  const [scanMode, setScanMode]         = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [codeDetected, setCodeDetected] = useState(false);
  const [scannedCode, setScannedCode]   = useState("");
  const [loading, setLoading]           = useState(false);
  const [savingReportId, setSavingReportId] = useState(null);
  const [aiStep, setAiStep]             = useState(0);
  const [error, setError]               = useState("");
  const [showHelp, setShowHelp]         = useState(false);
  const [historyOpen, setHistoryOpen]   = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [historyItems, setHistoryItems] = useState([]);
  const [historySearch, setHistorySearch] = useState("");
  const [activeHistoryScanId, setActiveHistoryScanId] = useState(null);
  const [deletingHistoryId, setDeletingHistoryId] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // ── refs ───────────────────────────────────────────────────────────────────
  const videoRef       = useRef(null);
  const canvasRef      = useRef(null);
  const fileInputRef   = useRef(null);
  const chatRef        = useRef(null);
  const chatEndRef     = useRef(null);
  const streamRef      = useRef(null);
  const readerRef      = useRef(null);
  const startingRef    = useRef(false);
  const scannedCodeRef = useRef("");
  // FIX — Bug 3: mountedRef prevents post-unmount state updates in loadHistory
  // and guards the camera start race when the component unmounts mid-startup.
  const mountedRef     = useRef(true);

  // ── helpers ────────────────────────────────────────────────────────────────
  const addMsg   = (payload) => setMessages(prev => [...prev, { id: mkId(), ...payload }]);
  const showErr  = (msg) => setError(msg);
  const clearErr = () => setError("");
  
  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    router.push("/login");
  };

  const loadHistory = useCallback(async (searchValue = "") => {
    setHistoryLoading(true);
    setHistoryError("");

    const query = new URLSearchParams({ page: "1", limit: String(HISTORY_LIMIT) });
    const normalizedSearch = String(searchValue || "").trim();
    if (normalizedSearch) {
      query.set("search", normalizedSearch);
    }
    const response = await request(`/scans/history?${query.toString()}`);

    // FIX — Bug 3 / W4: guard all state updates against post-unmount calls.
    if (!mountedRef.current) return;

    if (response.error) {
      setHistoryError(response.message || "Unable to load scan history.");
      setHistoryLoading(false);
      return;
    }

    const rawItems = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.items)
        ? response.data.items
        : [];

    const normalized = rawItems.map(normalizeHistoryItem).filter(Boolean);
    setHistoryItems(normalized);
    setHistoryLoaded(true);
    setHistoryLoading(false);
  }, []);

  const loadHistoryScan = useCallback(async (scanId) => {
    if (!scanId) return;

    setHistoryError("");
    setActiveHistoryScanId(String(scanId));
    const response = await request(`/scans/${scanId}`);

    if (!mountedRef.current) return;

    if (response.error) {
      setHistoryError(response.message || "Unable to load selected scan.");
      return;
    }

    const result = normalizeScanDetail(response.data);
    if (!result.scanId) {
      setHistoryError("Selected scan is missing required details.");
      return;
    }

    setMessages([
      { id: mkId(), type: "assistant", content: "Loaded scan from history." },
      { id: mkId(), type: "assistant", result },
    ]);
    setHistoryOpen(false);
    clearErr();
    scrollBottom("auto");
  }, []);

  const deleteHistoryScan = useCallback(async (scanId) => {
    if (!scanId || deletingHistoryId) return;

    setHistoryError("");
    setDeletingHistoryId(String(scanId));

    const response = await request(`/scans/${scanId}`, null, "DELETE");

    if (!mountedRef.current) return;

    if (response.error) {
      setHistoryError(response.message || "Unable to delete selected scan.");
      setDeletingHistoryId(null);
      return;
    }

    setHistoryItems((prev) => prev.filter((item) => String(item.scanId) !== String(scanId)));
    if (String(activeHistoryScanId) === String(scanId)) {
      setActiveHistoryScanId(null);
    }
    setDeletingHistoryId(null);
  }, [activeHistoryScanId, deletingHistoryId]);

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
      const activeStream = videoRef.current.srcObject;
      if (activeStream && typeof activeStream.getTracks === "function") {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    startingRef.current = false;
    setCameraActive(false);
    setCodeDetected(false);
  }, []);

  // ── effects ────────────────────────────────────────────────────────────────

  // FIX — Bug 3: set mountedRef=false on unmount so all in-flight async calls
  // bail before touching state. Also correctly stops the camera on unmount.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => { scrollBottom(messages.length > 1 ? "smooth" : "auto"); }, [messages]);
  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setAiStep(p => (p + 1) % AI_STEPS.length), 900);
    return () => clearInterval(t);
  }, [loading]);

  useEffect(() => {
    if (isAuthLoading || !isLogin || historyLoaded || historyLoading) return;
    void loadHistory(historySearch);
  }, [isAuthLoading, isLogin, historyLoaded, historyLoading, historySearch, loadHistory]);

  // FIX — W4: clearTimeout cleanup was already present and is correct;
  // the additional mountedRef guard inside loadHistory now covers the async tail.
  useEffect(() => {
    if (isAuthLoading || !isLogin || !historyLoaded) return;
    const timer = setTimeout(() => { void loadHistory(historySearch); }, 250);
    return () => clearTimeout(timer);
  }, [historySearch, historyLoaded, isAuthLoading, isLogin, loadHistory]);

  // ── START CAMERA ───────────────────────────────────────────────────────────
  const startCamera = async (mode = "image") => {
    if (startingRef.current) return;

    if (!navigator?.mediaDevices?.getUserMedia) {
      showErr("Camera is not supported in this browser. Upload an image instead.");
      return;
    }

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
      // Show overlay first so the video element is visible before ZXing touches it.
      setCameraActive(true);
      await new Promise(r => setTimeout(r, 50));
      await startCodeScanner(mode);
      return;
    }

    // ── photo mode ──
    setCameraActive(true);
    await new Promise(r => setTimeout(r, 50));

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width:  { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
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
    if (mountedRef.current) setCameraActive(false);
    console.error("Camera error:", err);

    if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
      showErr("Camera permission denied. Allow camera access in your browser settings, then try again.");
    } else if (err?.name === "NotFoundError") {
      showErr("No camera found on this device.");
    } else if (err?.name === "NotReadableError") {
      showErr("Camera is in use by another app. Close it and try again.");
    } else if (err?.name === "NotSupportedError") {
      showErr("This browser does not support live camera scanning. Upload an image instead.");
    } else {
      showErr("Could not access camera. Check permissions and try again.");
    }
  };

  // ── QR / BARCODE SCANNER ───────────────────────────────────────────────────
  const startCodeScanner = async (mode) => {
    if (!videoRef.current) { startingRef.current = false; return; }
    if (!navigator?.mediaDevices?.getUserMedia) {
      handleCameraError({ name: "NotSupportedError" });
      return;
    }

    const hints = new Map();
    hints.set(
      DecodeHintType.POSSIBLE_FORMATS,
      mode === "qr"
        ? [BarcodeFormat.QR_CODE]
        : [
            BarcodeFormat.EAN_13,
            BarcodeFormat.EAN_8,
            BarcodeFormat.CODE_128,
            BarcodeFormat.CODE_39,
            BarcodeFormat.UPC_A,
            BarcodeFormat.UPC_E,
            BarcodeFormat.ITF,
            BarcodeFormat.CODABAR,
          ]
    );
    if (mode === "barcode") {
      hints.set(DecodeHintType.TRY_HARDER, true);
    }

    // FIX — W3: raised interval to 350 ms for barcode mode. TRY_HARDER runs an
    // exhaustive multi-angle decode on every frame; at 150 ms this saturates the
    // JS thread on mid-range Android (Snapdragon 4xx), causing the preview to
    // stutter and decode latency to actually increase.
    readerRef.current = new BrowserMultiFormatReader(hints, mode === "barcode" ? 350 : 150);

    const onDecode = (result, err) => {
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
    };

    const preferredConstraints = {
      audio: false,
      video: {
        facingMode: { ideal: "environment" },
        width:  { ideal: mode === "barcode" ? 1280 : 640 },
        height: { ideal: mode === "barcode" ? 720  : 480 },
      },
    };

    const fallbackConstraints = {
      audio: false,
      video: { facingMode: { ideal: "environment" } },
    };

    const runDecode = async () => {
      try {
        await readerRef.current.decodeFromConstraints(preferredConstraints, videoRef.current, onDecode);
      } catch (preferredError) {
        // FIX — W2: removed NotFoundError from canFallback. NotFoundError means
        // no camera exists on the device — retrying with looser constraints will
        // never succeed and causes three unnecessary camera-acquisition attempts
        // before the error finally surfaces to the user.
        const canFallback =
          preferredError?.name === "OverconstrainedError" ||
          preferredError?.name === "NotReadableError";

        if (!canFallback) {
          throw preferredError;
        }

        if (!readerRef.current) {
          readerRef.current = new BrowserMultiFormatReader(hints, mode === "barcode" ? 350 : 150);
        }

        try {
          await readerRef.current.decodeFromConstraints(fallbackConstraints, videoRef.current, onDecode);
        } catch (fallbackError) {
          // Keep NotFoundError out of the last-resort fallback for the same reason.
          const canUseAnyCamera =
            fallbackError?.name === "OverconstrainedError";

          if (!canUseAnyCamera) {
            throw fallbackError;
          }

          if (!readerRef.current) {
            readerRef.current = new BrowserMultiFormatReader(hints, mode === "barcode" ? 350 : 150);
          }

          await readerRef.current.decodeFromConstraints({ video: true, audio: false }, videoRef.current, onDecode);
        }
      }
    };

    runDecode()
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

  // ── ANALYZE ────────────────────────────────────────────────────────────────
  // FIX — Bug 2: default for `code` now reads from scannedCodeRef.current first
  // so it always gets the freshly scanned value regardless of React's render cycle.
  // Previously `code = scannedCode` captured the state value at closure-creation
  // time, which could be stale when analyzeProduct is called in the same render
  // cycle that setScannedCode fired.
  const analyzeProduct = async ({ image = preview, code = scannedCodeRef.current || scannedCode } = {}) => {
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

    try {
      const formData = new FormData();
      let endpoint = "/scans/analyze";

      if (img) {
        const imageFile = await dataUrlToFile(img);
        formData.append("image", imageFile);
      }

      if (cd) {
        const mode = scanMode === "barcode" ? "barcode" : "qr";
        endpoint = mode === "barcode" ? "/scans/barcode" : "/scans/qr";
        if (mode === "barcode") {
          formData.append("barcodeInput", cd);
        } else {
          formData.append("qrInput", cd);
        }
        if (img) {
          endpoint = "/scans/analyze";
        }
      }

      const response = await requestForm(endpoint, formData, "POST");
      if (response.error) {
        throw new Error(response.message || "Unable to analyze product");
      }

      if (!mountedRef.current) return;

      const result = normalizeScanResult(response.data);
      setMessages(prev => [
        ...prev.filter(m => m.id !== ldId),
        { id: mkId(), type: "assistant", result },
      ]);
      setActiveHistoryScanId(String(result.scanId || ""));
      if (result.scanId) {
        setHistoryItems((prev) => {
          const withoutCurrent = prev.filter((item) => String(item.scanId) !== String(result.scanId));
          return [{
            scanId: String(result.scanId),
            title: result.title,
            source: result.source || scanMode || null,
            productName: result.productName || "Unknown Product",
            brandName: result.brandName || "",
            category: result.category || "",
            imageThumbnail: result.imageThumbnail || "",
            manufacturer: result.manufacturer || "",
            countryOfOrigin: result.countryOfOrigin || "",
            ingredients: Array.isArray(result.ingredients) ? result.ingredients : [],
            productImage: result.productImage || result.imageThumbnail || "",
            status: result.status,
            confidence: result.confidence,
            createdAt: new Date().toISOString(),
          }, ...withoutCurrent].slice(0, HISTORY_LIMIT);
        });
      }
      if (onScan) onScan(result);
    } catch (analysisError) {
      if (!mountedRef.current) return;
      setMessages(prev => [
        ...prev.filter(m => m.id !== ldId),
        {
          id: mkId(),
          type: "assistant",
          content: analysisError.message || "Unable to analyze this scan right now.",
        },
      ]);
      showErr(analysisError.message || "Unable to analyze this scan right now.");
    } finally {
      if (mountedRef.current) setLoading(false);
      scrollBottom();
    }
  };

  // ── VERIFY SCANNED CODE ────────────────────────────────────────────────────
  const verifyCode = () => {
    const code = scannedCodeRef.current || scannedCode;
    if (!code) return;
    stopCamera();
    analyzeProduct({ code });
  };

  const saveReport = async (result) => {
    if (!result?.scanId) {
      showErr("No scan reference found. Run a new analysis before saving a report.");
      return;
    }

    setSavingReportId(result.scanId);
    clearErr();

    const category = result.status === "suspicious"
      ? "counterfeit"
      : result.status === "review"
        ? "suspicious_listing"
        : "other";

    const reason = result.suspiciousIndicators?.[0] || "Scanner UI report submission";
    const reportContext = [
      result.productName ? `Product: ${result.productName}` : "",
      result.brandName ? `Brand: ${result.brandName}` : "",
      result.category ? `Category: ${result.category}` : "",
      result.manufacturer ? `Manufacturer: ${result.manufacturer}` : "",
      result.countryOfOrigin ? `Country of origin: ${result.countryOfOrigin}` : "",
      Array.isArray(result.ingredients) && result.ingredients.length > 0
        ? `Ingredients: ${result.ingredients.join(", ")}`
        : "",
    ].filter(Boolean);
    const description = [...reportContext, ...(result.detailedReasoning || [])].join(" ").slice(0, 1900);
    const evidence = [
      result.productImage || result.imageThumbnail || "",
      result.productName ? `product:${result.productName}` : "",
      result.brandName ? `brand:${result.brandName}` : "",
      result.category ? `category:${result.category}` : "",
      result.manufacturer ? `manufacturer:${result.manufacturer}` : "",
      result.countryOfOrigin ? `country:${result.countryOfOrigin}` : "",
    ].filter(Boolean);

    const response = await request(
      "/reports",
      { scanId: result.scanId, category, reason, description, evidence },
      "POST"
    );

    if (!mountedRef.current) return;

    if (response.error) {
      showErr(response.message || "Unable to save report right now.");
      setSavingReportId(null);
      return;
    }

    addMsg({ type: "assistant", content: "Report submitted successfully. Our team can now review this scan." });
    setSavingReportId(null);
    scrollBottom();
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  if (isAuthLoading || !isLogin) {
    return (
      <div className="min-h-dvh bg-[#050816] text-white flex items-center justify-center px-4">
        <p className="text-sm text-white/70">Checking access...</p>
      </div>
    );
  }

  const userName = user?.fullName || user?.name || user?.username || user?.email || "User";
  const userInitial = userName.trim().charAt(0).toUpperCase() || "U";
  const userRole = String(user?.role || "User").toLowerCase();
  const canSend = (!!preview || !!scannedCode) && !loading;
  const isInitialState = messages.length === 1 && !preview && !scannedCode && !loading;

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#050816] text-white flex flex-col">

      {/* ── background glows ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-150 h-150 bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-125 h-125 bg-blue-600/8 rounded-full blur-3xl" />
      </div>

      {/* ── header ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-2xl">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setHistoryOpen(true);
                if (!historyLoaded && !historyLoading) void loadHistory();
              }}
              className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
              aria-label="Open scan history"
            >
              <Menu className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (typeof onBack === "function") return onBack();
                router.push('/');
              }}
              className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight bg-linear-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                AuthentiScan
              </h1>
              <p className="text-[11px] text-white/35 leading-none">AI Product Verification</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs text-cyan-200">Live</span>
            </div>
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(prev => !prev)}
                className="h-10 w-10 rounded-full bg-linear-to-br from-cyan-500 to-blue-600 text-white font-semibold flex items-center justify-center shadow-lg shadow-cyan-500/25 hover:scale-105 transition"
                aria-label="Open profile menu"
                title={userName}
              >
                {userInitial}
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-3 w-52 rounded-2xl border border-white/10 bg-[#0b1229]/95 backdrop-blur-xl p-2 shadow-2xl z-50">
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="text-sm text-white font-medium truncate">{userName}</p>
                    <p className="text-xs text-white/50 capitalize">{userRole}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl text-left text-sm text-rose-200 hover:bg-rose-500/15 transition flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
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
                  <div className="max-w-[88%] md:max-w-lg bg-linear-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/20 rounded-2xl p-3.5 backdrop-blur-xl">
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
                      <ResultCard
                        result={msg.result}
                        onSaveReport={() => saveReport(msg.result)}
                        isSaving={savingReportId === msg.result.scanId}
                      />
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
        </div>

        {/* ── fixed input bar ── */}
        <div
          className={isInitialState
            ? "mt-6 w-full max-w-3xl mx-auto"
            : "fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#050816]/85 backdrop-blur-3xl"
          }
        >
          <div className="max-w-5xl mx-auto px-3 sm:px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
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
                    ? "bg-linear-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/30 active:scale-95"
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
      </div>

      {/* ── history drawer ── */}
      <AnimatePresence>
        {historyOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHistoryOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -420 }}
              animate={{ x: 0 }}
              exit={{ x: -420 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="fixed left-0 top-0 bottom-0 z-60 w-97.5 max-w-[92vw] overflow-hidden border-r border-white/10 bg-[#050816]/95 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.45)]"
            >
              <div className="flex h-full flex-col">
                <div className="border-b border-white/10 bg-white/3 px-5 py-5 backdrop-blur-3xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                        <h2 className="text-lg font-semibold text-white">Scan History</h2>
                      </div>
                      <p className="mt-1 text-xs text-white/45">Access previous authenticity scans</p>
                    </div>
                    <button
                      onClick={() => setHistoryOpen(false)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition hover:bg-white/8"
                    >
                      <X className="h-4 w-4 text-white/70" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/4 px-3 py-3 backdrop-blur-xl">
                      <Search className="h-4 w-4 text-white/40" />
                      <input
                        type="text"
                        value={historySearch}
                        onChange={(event) => setHistorySearch(event.target.value)}
                        placeholder="Search product, brand, barcode..."
                        className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => void loadHistory(historySearch)}
                    className="mt-3 w-full rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-100 backdrop-blur-xl transition-all duration-300 hover:bg-cyan-500/15"
                  >
                    Refresh History
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 px-4 py-4 scrollbar-none">
                  {historyLoading && (
                    <div className="rounded-2xl border border-white/10 bg-white/4 p-4 backdrop-blur-2xl">
                      <div className="flex items-center gap-3 text-white/70">
                        <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                        <span className="text-sm">Loading scan history...</span>
                      </div>
                    </div>
                  )}

                  {!historyLoading && historyError && (
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 backdrop-blur-2xl">
                      <p className="text-sm text-rose-100">{historyError}</p>
                    </div>
                  )}

                  {!historyLoading && !historyError && historyItems.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-white/10 bg-white/3 p-6 text-center backdrop-blur-2xl">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/4">
                        <Shield className="h-6 w-6 text-cyan-300" />
                      </div>
                      <p className="text-sm text-white/70">No scan history yet</p>
                      <p className="mt-1 text-xs text-white/40">Your previous scans will appear here.</p>
                    </div>
                  )}

                  {!historyLoading && !historyError && historyItems.map((item) => {
                    const isActive = String(activeHistoryScanId) === String(item.scanId);
                    return (
                      <motion.div
                        key={item.scanId}
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                        className={`relative overflow-hidden rounded-3xl border backdrop-blur-2xl transition-all duration-300 ${
                          isActive
                            ? "border-cyan-400/30 bg-cyan-500/10"
                            : "border-white/10 bg-white/4 hover:bg-white/6"
                        }`}
                      >
                        {isActive && <div className="absolute inset-0 bg-cyan-400/5" />}

                        <button
                          type="button"
                          onClick={() => void loadHistoryScan(item.scanId)}
                          className="relative w-full p-4 pr-14 text-left"
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                              {item.imageThumbnail ? (
                                <img
                                  src={item.imageThumbnail}
                                  alt={item.productName || "Scanned product"}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-cyan-200/70">
                                  <Shield className="h-5 w-5" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="line-clamp-2 text-base font-semibold leading-5 text-white">
                                  {item.productName || "Unknown Product"}
                                </h3>
                                <span
                                  className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                                    item.status === "authentic"
                                      ? "border border-emerald-300/40 bg-emerald-500/15 text-emerald-200"
                                      : item.status === "suspicious"
                                        ? "border border-rose-300/40 bg-rose-500/15 text-rose-200"
                                        : "border border-amber-300/40 bg-amber-500/15 text-amber-200"
                                  }`}
                                >
                                  {String(item.status || "review").replaceAll("_", " ")}
                                </span>
                              </div>

                              {/* FIX — UI: removed the duplicate brandName line that appeared
                                  directly below the product name. Brand is now shown only
                                  once inside the detail rows block below. */}
                              <div className="mt-2 space-y-1 text-xs text-white/55">
                                {item.brandName ? (
                                  <p className="truncate">Brand: {item.brandName}</p>
                                ) : null}
                                {item.category ? (
                                  <p className="truncate">Category: {item.category}</p>
                                ) : null}
                                {item.manufacturer ? (
                                  <p className="truncate">Manufacturer: {item.manufacturer}</p>
                                ) : null}
                                {item.countryOfOrigin ? (
                                  <p className="truncate">Origin: {item.countryOfOrigin}</p>
                                ) : null}
                                {Array.isArray(item.ingredients) && item.ingredients.length > 0 ? (
                                  <p className="line-clamp-2">Ingredients: {item.ingredients.join(", ")}</p>
                                ) : null}
                              </div>

                              <div className="mt-3 flex items-center justify-between text-xs text-white/50">
                                <span>{item.confidence}% confidence</span>
                                <span>{formatHistoryDate(item.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            void deleteHistoryScan(item.scanId);
                          }}
                          disabled={Boolean(deletingHistoryId)}
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-white/50 backdrop-blur-xl transition-all duration-300 hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-200"
                        >
                          {String(deletingHistoryId) === String(item.scanId) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── camera overlay ── */}
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
        {/*
          FIX — W1: removed the dead `webkit-playsinline="true"` prop. JSX does
          not forward hyphenated unknown attributes to the DOM so it never reached
          the video element. `playsInline` (camelCase) already handles iOS Safari.
        */}
        <video
          ref={videoRef}
          playsInline
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

        <div className="absolute top-[calc(1rem+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-cyan-400/20 px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap">
          <ScanLine className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs text-white/90">
            {scanMode === "image" ? "Frame the product" : scanMode === "qr" ? "Align QR code" : "Align barcode"}
          </span>
        </div>

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
              className="w-16 h-16 rounded-full bg-cyan-400  border-4 border-white/30 shadow-xl shadow-cyan-500/30 active:scale-95 transition"
            />
          ) : (
            <button
              onClick={verifyCode}
              disabled={!codeDetected}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition ${
                codeDetected
                  ? "bg-linear-cyan-500 shadow-lg shadow-cyan-500/30 active:scale-95 text-white"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              Verify Code
            </button>
          )}
        </div>
      </div>

      {/* ── camera help modal ── */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-70 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
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
                  className="px-4 py-2 rounded-xl bg-cyan-500  text-sm font-semibold"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

function formatScanSource(value) {
  if (!value || typeof value !== "string") return "";
  const normalized = value.trim().toLowerCase();
  if (normalized === "qr") return "QR scan";
  if (normalized === "barcode") return "Barcode scan";
  if (normalized === "analyze") return "Image + code analysis";
  if (normalized === "upload") return "Image upload";
  return value;
}

function buildResultCopyText(result) {
  const lines = [
    result.title ? `Title: ${result.title}` : "",
    result.productName ? `Product name: ${result.productName}` : "",
    result.brandName ? `Brand: ${result.brandName}` : "",
    result.category ? `Category: ${result.category}` : "",
    result.manufacturer ? `Manufacturer: ${result.manufacturer}` : "",
    result.countryOfOrigin ? `Country of origin: ${result.countryOfOrigin}` : "",
    Array.isArray(result.ingredients) && result.ingredients.length > 0
      ? `Ingredients: ${result.ingredients.join(", ")}`
      : "",
    result.source ? `Source: ${formatScanSource(result.source)}` : "",
    result.createdAt ? `Saved: ${formatHistoryDate(result.createdAt)}` : "",
    typeof result.confidence === "number" ? `Confidence: ${result.confidence}%` : "",
    Array.isArray(result.suspiciousIndicators) && result.suspiciousIndicators.length > 0
      ? `Suspicious indicators: ${result.suspiciousIndicators.join(" | ")}`
      : "",
    Array.isArray(result.detailedReasoning) && result.detailedReasoning.length > 0
      ? `Detailed reasoning: ${result.detailedReasoning.join(" | ")}`
      : "",
  ].filter(Boolean);

  return lines.join("\n");
}

async function copyResultDetails(result) {
  const text = buildResultCopyText(result);
  if (!text) {
    throw new Error("No product details available to copy.");
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === "undefined") {
    throw new Error("Clipboard is not available in this environment.");
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function ResultCard({ result, onSaveReport, isSaving }) {
  const isAuth   = result.status === "authentic";
  const isReview = result.status === "review";
  const color    = isAuth ? "emerald" : isReview ? "cyan" : "amber";
  const [copyState, setCopyState] = useState("idle");
  const colorMap = {
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-400/30", icon: "bg-emerald-500/20", text: "text-emerald-400" },
    cyan:    { bg: "bg-cyan-500/10",    border: "border-cyan-400/30",    icon: "bg-cyan-500/20",    text: "text-cyan-400"    },
    amber:   { bg: "bg-amber-500/10",   border: "border-amber-400/30",   icon: "bg-amber-500/20",   text: "text-amber-400"   },
  };
  const c = colorMap[color];
  const scanMetaRows = [
    { label: "Scan title", value: result.title },
    { label: "Source", value: formatScanSource(result.source) },
    { label: "Saved", value: result.createdAt ? formatHistoryDate(result.createdAt) : "" },
  ].filter((entry) => entry.value && String(entry.value).trim());

  const handleCopy = async () => {
    try {
      await copyResultDetails(result);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 1800);
    }
  };

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
            {scanMetaRows.length > 0 ? <ScanMeta rows={scanMetaRows} /> : null}
            <ProductProfile result={result} />
            <Section title="Suspicious indicators" items={result.suspiciousIndicators} />
            <Section title="Detailed reasoning"    items={result.detailedReasoning} />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleCopy}
              type="button"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/12 bg-white/6 text-sm font-semibold hover:bg-white/10 transition flex items-center justify-center gap-2"
            >
              {copyState === "copied" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copyState === "copied" ? "Copied" : copyState === "error" ? "Copy failed" : "Copy Details"}
            </button>
            <button
              onClick={onSaveReport}
              disabled={isSaving || !result.scanId}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500  text-sm font-semibold hover:opacity-90 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Reporting..." : "Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScanMeta({ rows }) {
  return (
    <div>
      <p className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">Scan details</p>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="text-sm text-white/80 flex items-start gap-2">
            <span className="text-white/50 min-w-28">{row.label}:</span>
            <span>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductProfile({ result }) {
  const infoRows = [
    { label: "Product name", value: result.productName },
    { label: "Brand", value: result.brandName },
    { label: "Category", value: result.category },
    { label: "Manufacturer", value: result.manufacturer },
    { label: "Country of origin", value: result.countryOfOrigin },
  ].filter((entry) => entry.value && String(entry.value).trim());

  const ingredients = Array.isArray(result.ingredients) ? result.ingredients.filter(Boolean) : [];
  const productImage = typeof result.productImage === "string" && result.productImage.trim()
    ? result.productImage.trim()
    : typeof result.imageThumbnail === "string" && result.imageThumbnail.trim()
      ? result.imageThumbnail.trim()
      : "";

  if (infoRows.length === 0 && ingredients.length === 0 && !productImage) return null;

  return (
    <div>
      <p className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">Product profile</p>
      <div className="space-y-2">
        {productImage ? (
          <div className="w-full sm:w-40 h-24 rounded-lg border border-white/10 overflow-hidden bg-black/20">
            <img src={productImage} alt={result.productName || "Scanned product"} className="w-full h-full object-cover" />
          </div>
        ) : null}
        {infoRows.map((row) => (
          <div key={row.label} className="text-sm text-white/80 flex items-start gap-2">
            <span className="text-white/50 min-w-28">{row.label}:</span>
            <span>{row.value}</span>
          </div>
        ))}
        {ingredients.length > 0 ? (
          <div className="text-sm text-white/80 flex items-start gap-2">
            <span className="text-white/50 min-w-28">Ingredients:</span>
            <span>{ingredients.join(", ")}</span>
          </div>
        ) : null}
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
  const safeItems = Array.isArray(items) && items.length > 0
    ? items
    : ["No additional details were provided."];

  return (
    <div>
      <p className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">{title}</p>
      <ul className="space-y-1">
        {safeItems.map((item, i) => (
          <li key={i} className="text-sm text-white/75 flex gap-2">
            <span className="text-white/30 shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
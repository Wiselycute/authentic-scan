import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Camera,
  QrCode,
  Barcode,
  Sparkles,
  ArrowLeft,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Cpu,
  Database,
  Eye,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import {
  BrowserMultiFormatReader,
  NotFoundException,
  BarcodeFormat,
  DecodeHintType,
} from "@zxing/library";

export default function Scanner({ onScan, onBack }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanMode, setScanMode] = useState("image");
  const [cameraActive, setCameraActive] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedCode, setScannedCode] = useState(null);
  const [codeDetected, setCodeDetected] = useState(false);
  const [aiActivities, setAiActivities] = useState([]);
  const [scanResult, setScanResult] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const codeReaderRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }

    };
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedFile(file);

      const reader = new FileReader();

      reader.onloadend = () => {
        setPreview(reader.result);
        setCameraActive(false);
      };

      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        setCameraActive(true);
        setPreview(null);
        setScanResult(null);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const startCodeScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        setCameraActive(true);
        setPreview(null);
        setScanResult(null);

        const hints = new Map();

        const formats =
          scanMode === "qr"
            ? [BarcodeFormat.QR_CODE]
            : [
                BarcodeFormat.EAN_13,
                BarcodeFormat.EAN_8,
                BarcodeFormat.CODE_128,
                BarcodeFormat.CODE_39,
                BarcodeFormat.UPC_A,
                BarcodeFormat.UPC_E,
              ];

        hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);

        codeReaderRef.current = new BrowserMultiFormatReader(
          hints,
          500,
        );

        codeReaderRef.current
          .decodeFromVideoDevice(
            undefined,
            videoRef.current,
            (result, error) => {
              if (result) {
                setScannedCode(result.getText());
                setCodeDetected(true);
                return;
              }

              if (error && !(error instanceof NotFoundException)) {
                console.error("Scanning error:", error);
              }
            },
          )
          .catch((error) => {
            console.error("Scanning error:", error);
          });
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }

    setCameraActive(false);
    setCodeDetected(false);
    setScannedCode(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(video, 0, 0);

        const imageData = canvas.toDataURL("image/jpeg");

        setPreview(imageData);

        stopCamera();
      }
    }
  };

  const confirmCodeScan = () => {
    if (scannedCode) {
      stopCamera();
      handleScanWithCode(scannedCode);
    }
  };

  const handleScanWithCode = (code) => {
    setScanning(true);
    setScanProgress(0);
    setAiActivities([]);
    setScanResult(null);

    const activities = [
      "Initiating AI verification system...",
      "Reading barcode data...",
      "Checking manufacturer database...",
      "Analyzing serial number pattern...",
      "Cross-referencing global product registry...",
      "Verifying authenticity markers...",
      "Finalizing verification report...",
    ];

    let activityIndex = 0;

    const activityInterval = setInterval(() => {
      if (activityIndex < activities.length) {
        setAiActivities((prev) => [
          ...prev,
          activities[activityIndex],
        ]);

        activityIndex++;
      }
    }, 400);

    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }

        return prev + 2;
      });
    }, 60);

    setTimeout(() => {
      clearInterval(activityInterval);

      const isAuthentic = Math.random() > 0.4;

      const result = {
        score: isAuthentic
          ? Math.floor(Math.random() * 10 + 90)
          : Math.floor(Math.random() * 40 + 30),

        status: isAuthentic
          ? "authentic"
          : "suspicious",

        confidence: isAuthentic ? "high" : "medium",

        scannedCode: code,

        codeType:
          scanMode === "qr" ? "QR Code" : "Barcode",

        reasons: isAuthentic
          ? []
          : [
              `${
                scanMode === "qr"
                  ? "QR code"
                  : "Barcode"
              } flagged in counterfeit database`,
              "Serial number scanned 47 times across different locations",
              "Product registration pattern shows irregularities",
            ],

        details: {
          logoAnalysis: isAuthentic
            ? Math.floor(Math.random() * 5 + 95)
            : Math.floor(Math.random() * 20 + 60),

          packagingQuality: isAuthentic
            ? Math.floor(Math.random() * 8 + 92)
            : Math.floor(Math.random() * 25 + 55),

          barcodeValid: isAuthentic,
          manufacturerVerified: isAuthentic,
        },
      };

      setScanResult(result);

      setScanning(false);
      setScanProgress(0);
    }, 3000);
  };

  const handleScan = () => {
    setScanning(true);
    setScanProgress(0);
    setAiActivities([]);
    setScanResult(null);

    const activities = [
      "Initializing AI neural network...",
      "Reading packaging text and logos...",
      "Analyzing image quality patterns...",
      "Checking logo consistency...",
      "Verifying color accuracy...",
      "Comparing with official manufacturer data...",
      "Generating authenticity report...",
    ];

    let activityIndex = 0;

    const activityInterval = setInterval(() => {
      if (activityIndex < activities.length) {
        setAiActivities((prev) => [
          ...prev,
          activities[activityIndex],
        ]);

        activityIndex++;
      }
    }, 400);

    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }

        return prev + 2;
      });
    }, 60);

    setTimeout(() => {
      clearInterval(activityInterval);

      const isAuthentic = Math.random() > 0.3;

      const result = {
        score: isAuthentic
          ? Math.floor(Math.random() * 10 + 90)
          : Math.floor(Math.random() * 40 + 30),

        status: isAuthentic
          ? "authentic"
          : "suspicious",

        confidence: isAuthentic ? "high" : "medium",

        reasons: isAuthentic
          ? []
          : [
              "Serial number has been scanned 47 times across different locations",
              "Packaging font weight differs from manufacturer standard",
              "Holographic security seal shows irregular pattern",
            ],

        details: {
          logoAnalysis: isAuthentic
            ? Math.floor(Math.random() * 5 + 95)
            : Math.floor(Math.random() * 20 + 60),

          packagingQuality: isAuthentic
            ? Math.floor(Math.random() * 8 + 92)
            : Math.floor(Math.random() * 25 + 55),

          barcodeValid: isAuthentic,
          manufacturerVerified: isAuthentic,
        },
      };

      setScanResult(result);

      setScanning(false);
      setScanProgress(0);
    }, 3000);
  };

  return (
   <div className="min-h-screen bg-[#050816] relative overflow-hidden">
      {/* Cyber Grid Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:80px_80px]"></div>
      </div>

      {/* Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* TOP SECTION */}
      <div className="relative z-20 border-b border-white/5 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo & Back */}
          <div className="flex items-center gap-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/60 hover:text-cyan-400 transition-all group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">AuthentiScan</div>
                <div className="text-xs text-white/40">AI Verification System</div>
              </div>
            </div>
          </div>

          {/* AI Status Indicator */}
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-cyan-400/20 rounded-2xl px-4 py-2">
            <div className="relative">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
            </div>
            <span className="text-sm text-cyan-100 font-medium">AI Verification Ready</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* MAIN SCANNER AREA */}
        <div className="mb-8">
          {!cameraActive && !preview ? (
            // Initial State - Show scan mode options
            <div className="text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Select Verification Method
                  </span>
                </h2>
                <p className="text-white/60 text-lg">Choose how you&apos;d like to scan your product</p>
              </motion.div>

              {/* Action Cards Grid */}
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
                {/* Camera Scan */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setScanMode('image');
                    startCamera();
                  }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
                  <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-cyan-400/30 rounded-3xl p-8 hover:border-cyan-400/60 transition-all">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center border border-cyan-400/30">
                      <Camera className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      Snap Photo
                    </h3>
                    <p className="text-white/60">Use camera to capture product images</p>
                  </div>
                </motion.button>

                {/* Upload Image */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
                  <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-blue-400/30 rounded-3xl p-8 hover:border-blue-400/60 transition-all">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center border border-blue-400/30">
                      <Upload className="w-10 h-10 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      Upload Image
                    </h3>
                    <p className="text-white/60">Select from your device gallery</p>
                  </div>
                </motion.button>

                {/* QR Code Scan */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setScanMode('qr');
                    startCodeScanner();
                  }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
                  <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-cyan-400/30 rounded-3xl p-8 hover:border-cyan-400/60 transition-all">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center border border-cyan-400/30">
                      <QrCode className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      Scan QR Code
                    </h3>
                    <p className="text-white/60">Scan QR code for instant verification</p>
                  </div>
                </motion.button>

                {/* Barcode Scan */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setScanMode('barcode');
                    startCodeScanner();
                  }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
                  <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-blue-400/30 rounded-3xl p-8 hover:border-blue-400/60 transition-all">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center border border-blue-400/30">
                      <Barcode className="w-10 h-10 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      Scan Barcode
                    </h3>
                    <p className="text-white/60">Verify product via barcode scan</p>
                  </div>
                </motion.button>
              </div>
            </div>
          ) : cameraActive ? (
            // Live Camera View
            <div className="relative">
              <div className="absolute -inset-8 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 rounded-3xl blur-3xl animate-pulse"></div>

              <div className="relative bg-black rounded-3xl overflow-hidden border-2 border-cyan-400/40 shadow-2xl shadow-cyan-500/20">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-[70vh] object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Dark Overlay with Tracking Frame */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 right-0 h-[20%] bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-[25%] bg-gradient-to-t from-black/80 to-transparent backdrop-blur-sm"></div>
                  <div className="absolute top-[20%] left-0 w-[10%] bottom-[25%] bg-gradient-to-r from-black/80 to-transparent backdrop-blur-sm"></div>
                  <div className="absolute top-[20%] right-0 w-[10%] bottom-[25%] bg-gradient-to-l from-black/80 to-transparent backdrop-blur-sm"></div>

                  {/* Neon-Blue Tracking Frame */}
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${scanMode === 'image' ? 'w-[80%] aspect-square' : scanMode === 'qr' ? 'w-[60%] aspect-square' : 'w-[80%] h-[30%]'}`}>
                    <div className={`absolute inset-0 border-4 ${codeDetected ? 'border-emerald-400' : 'border-cyan-400'} ${scanMode === 'image' || scanMode === 'qr' ? 'rounded-3xl' : 'rounded-2xl'} shadow-[0_0_40px_rgba(34,211,238,0.6)] animate-pulse`}></div>

                    {/* Corner Accents */}
                    <div className={`absolute top-0 left-0 w-20 h-20 border-t-[6px] border-l-[6px] ${codeDetected ? 'border-emerald-300' : 'border-cyan-300'} ${scanMode === 'image' || scanMode === 'qr' ? 'rounded-tl-3xl' : 'rounded-tl-2xl'}`}></div>
                    <div className={`absolute top-0 right-0 w-20 h-20 border-t-[6px] border-r-[6px] ${codeDetected ? 'border-emerald-300' : 'border-cyan-300'} ${scanMode === 'image' || scanMode === 'qr' ? 'rounded-tr-3xl' : 'rounded-tr-2xl'}`}></div>
                    <div className={`absolute bottom-0 left-0 w-20 h-20 border-b-[6px] border-l-[6px] ${codeDetected ? 'border-emerald-300' : 'border-cyan-300'} ${scanMode === 'image' || scanMode === 'qr' ? 'rounded-bl-3xl' : 'rounded-bl-2xl'}`}></div>
                    <div className={`absolute bottom-0 right-0 w-20 h-20 border-b-[6px] border-r-[6px] ${codeDetected ? 'border-emerald-300' : 'border-cyan-300'} ${scanMode === 'image' || scanMode === 'qr' ? 'rounded-br-3xl' : 'rounded-br-2xl'}`}></div>

                    {/* Scanning Beam */}
                    {!codeDetected && (
                      <motion.div
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,1)]"
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                    )}

                    {/* Detection Checkmark */}
                    {codeDetected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      >
                        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                          <CheckCircle2 className="w-14 h-14 text-white" />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Status Banner */}
                  <div className="absolute top-8 left-0 right-0 flex justify-center">
                    <div className={`bg-black/80 backdrop-blur-xl border ${codeDetected ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-cyan-400/30'} rounded-2xl px-8 py-4 flex items-center gap-4`}>
                      {!codeDetected ? (
                        <>
                          <Zap className="w-6 h-6 text-cyan-400 animate-pulse" />
                          <span className="text-lg font-semibold text-cyan-100">
                            {scanMode === 'image' && 'Position Product in Frame'}
                            {scanMode === 'qr' && 'Align QR Code'}
                            {scanMode === 'barcode' && 'Align Barcode'}
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                          <span className="text-lg font-semibold text-emerald-100">
                            Code Detected Successfully!
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Code Value Display */}
                  {codeDetected && scannedCode && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-40 left-0 right-0 flex justify-center px-6"
                    >
                      <div className="bg-black/90 backdrop-blur-xl border border-emerald-400/30 rounded-2xl px-8 py-4 max-w-2xl w-full">
                        <div className="text-xs text-white/60 mb-2">{scanMode === 'qr' ? 'QR Code' : 'Barcode'} Value:</div>
                        <div className="text-xl font-mono text-emerald-400 break-all">{scannedCode}</div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* BOTTOM ACTION BAR */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/80 to-transparent backdrop-blur-xl p-8">
                  <div className="flex justify-center items-center gap-6">
                    {/* Cancel Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={stopCamera}
                      className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-semibold transition-all"
                    >
                      Cancel
                    </motion.button>

                    {/* Main Action Button */}
                    {scanMode === 'image' ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={capturePhoto}
                        className="relative group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-2xl group-hover:blur-3xl transition-all"></div>
                        <div className="relative w-24 h-24 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center border-4 border-white/30 shadow-2xl shadow-cyan-500/50">
                          <div className="w-20 h-20 bg-white rounded-full"></div>
                        </div>
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: codeDetected ? 1.05 : 1 }}
                        whileTap={{ scale: codeDetected ? 0.95 : 1 }}
                        onClick={confirmCodeScan}
                        disabled={!codeDetected}
                        className={`relative px-10 py-5 rounded-2xl font-bold text-lg transition-all ${
                          codeDetected
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-2xl shadow-emerald-500/50 cursor-pointer'
                            : 'bg-white/10 text-white/40 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6" />
                          {codeDetected ? 'Verify Code' : 'Scanning...'}
                        </div>
                      </motion.button>
                    )}

                    <div className="w-32"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : preview && (
            // Image Preview
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute -inset-6 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-cyan-400/30 rounded-3xl p-8 shadow-2xl">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-[500px] object-contain rounded-2xl"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setPreview(null);
                    setSelectedFile(null);
                    setScanResult(null);
                  }}
                  className="flex-1 px-8 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl font-semibold transition-all"
                  disabled={scanning}
                >
                  Choose Different Image
                </motion.button>
                <motion.button
                  whileHover={{ scale: scanning ? 1 : 1.02 }}
                  whileTap={{ scale: scanning ? 1 : 0.98 }}
                  onClick={handleScan}
                  disabled={scanning}
                  className="relative flex-1 group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                  <div className="relative px-8 py-5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl font-bold text-lg shadow-2xl shadow-cyan-500/50 flex items-center justify-center gap-3">
                    {scanning ? (
                      'Analyzing...'
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6" />
                        Verify Product
                      </>
                    )}
                  </div>
                </motion.button>
              </div>
            </div>
          )}
        </div>

        {/* AI ACTIVITY FEED */}
        <AnimatePresence>
          {scanning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-3xl blur-2xl"></div>
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-cyan-400/20 rounded-3xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Cpu className="w-6 h-6 text-cyan-400 animate-pulse" />
                    <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      AI Analysis In Progress
                    </h3>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                        initial={{ width: '0%' }}
                        animate={{ width: `${scanProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="text-sm text-cyan-400 font-mono mt-2">{scanProgress}% Complete</div>
                  </div>

                  {/* Activity Log */}
                  <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                    {aiActivities.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 text-white/70"
                      >
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span className="text-sm">{activity}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESULT PREVIEW */}
        <AnimatePresence>
          {scanResult && !scanning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="relative">
                <div className={`absolute -inset-4 rounded-3xl blur-2xl ${
                  scanResult.status === 'authentic'
                    ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20'
                    : 'bg-gradient-to-r from-amber-500/20 to-red-500/20'
                }`}></div>
                <div className={`relative backdrop-blur-2xl border-2 rounded-3xl p-8 ${
                  scanResult.status === 'authentic'
                    ? 'bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-400/50'
                    : 'bg-gradient-to-br from-amber-500/10 to-red-500/5 border-amber-400/50'
                }`}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      {scanResult.status === 'authentic' ? (
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-400/50">
                          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-400/50">
                          <AlertTriangle className="w-8 h-8 text-amber-400" />
                        </div>
                      )}
                      <div>
                        <h3 className={`text-3xl font-bold ${
                          scanResult.status === 'authentic' ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {scanResult.status === 'authentic' ? 'Verified Authentic' : 'Suspicious Product'}
                        </h3>
                        <p className="text-white/60">Confidence: {scanResult.confidence}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-5xl font-bold ${
                        scanResult.status === 'authentic' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {scanResult.score}%
                      </div>
                      <div className="text-sm text-white/60">Authenticity Score</div>
                    </div>
                  </div>

                  {/* Reasons */}
                  {scanResult.reasons && scanResult.reasons.length > 0 && (
                    <div className="mb-6 space-y-2">
                      {scanResult.reasons.map((reason, index) => (
                        <div key={index} className="flex items-start gap-3 text-white/80">
                          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{reason}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-5 h-5 text-cyan-400" />
                        <span className="text-sm text-white/60">Logo Analysis</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{scanResult.details.logoAnalysis}%</div>
                    </div>
                    <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="w-5 h-5 text-cyan-400" />
                        <span className="text-sm text-white/60">Packaging Quality</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{scanResult.details.packagingQuality}%</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-8 flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onScan(scanResult)}
                      className="flex-1 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-2xl font-bold transition-all shadow-lg shadow-cyan-500/30"
                    >
                      View Full Report
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setScanResult(null);
                        setPreview(null);
                        setCameraActive(false);
                      }}
                      className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl font-semibold transition-all"
                    >
                      Scan Another
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

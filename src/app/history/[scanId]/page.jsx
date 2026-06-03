"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Tag,
  Barcode,
  Brain,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { getAdminScanById } from "@/app/api/services/admin.service";
import { useAuth } from "@/utils/contexts/AuthContext";

const STATUS_CONFIG = {
  likely_authentic: {
    label: "Authentic",
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-500/15 border-green-500/30",
    badge: "bg-green-500/20 text-green-400",
  },
  suspicious: {
    label: "Suspicious",
    icon: AlertTriangle,
    color: "text-orange-400",
    bg: "bg-orange-500/15 border-orange-500/30",
    badge: "bg-orange-500/20 text-orange-400",
  },
  review_required: {
    label: "Review Required",
    icon: AlertCircle,
    color: "text-yellow-400",
    bg: "bg-yellow-500/15 border-yellow-500/30",
    badge: "bg-yellow-500/20 text-yellow-400",
  },
  unverified: {
    label: "Unverified",
    icon: Shield,
    color: "text-white/50",
    bg: "bg-white/5 border-white/10",
    badge: "bg-white/10 text-white/50",
  },
};

const formatDate = (dateValue) => {
  if (!dateValue) return "Unknown date";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "Unknown date";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ScanDetailPage() {
  const { scanId } = useParams();
  const router = useRouter();
  const { isLogin, isAuthLoading } = useAuth();

  const [scan, setScan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadScan = async () => {
    if (!scanId) return;
    setIsLoading(true);
    setError("");

    const response = await getAdminScanById(scanId);

    if (response.error) {
      setError(response.message || "Unable to load scan details.");
      setIsLoading(false);
      return;
    }

    setScan(response.data || response);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isLogin) {
      router.replace("/login");
      return;
    }
    void loadScan();
  }, [isAuthLoading, isLogin, scanId]);

  if (isAuthLoading || (!scan && isLoading)) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/60">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading scan details…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex flex-col items-center justify-center gap-4">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-red-200 max-w-md text-center">
          {error}
        </div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>
      </div>
    );
  }

  if (!scan) return null;

  const status = scan.verificationStatus || scan.aiAnalysis?.status || "unverified";
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unverified;
  const StatusIcon = cfg.icon;
  const confidence = Math.round(Number(scan.aiAnalysis?.confidence || 0));
  const reasoning = Array.isArray(scan.aiAnalysis?.reasoning)
    ? scan.aiAnalysis.reasoning
    : Array.isArray(scan.reasoning)
    ? scan.reasoning
    : [];
  const suspiciousIndicators = Array.isArray(scan.aiAnalysis?.suspiciousIndicators)
    ? scan.aiAnalysis.suspiciousIndicators
    : Array.isArray(scan.suspiciousIndicators)
    ? scan.suspiciousIndicators
    : [];
  const barcodeValue = scan.barcode?.value || scan.codeValue || "—";
  const imageUrl = scan.uploadedImage?.url || null;

  return (
    <div className="min-h-screen bg-[#050816] text-white overflow-x-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-24">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Page title */}
        <h1 className="text-4xl font-bold mb-2">
          Product{" "}
          <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Details
          </span>
        </h1>
        <p className="text-white/50 mb-10 text-sm">Scan verification result</p>

        {/* Hero card */}
        <div className={`rounded-2xl border p-6 mb-6 ${cfg.bg}`}>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Product image */}
            <div className="w-32 h-32 rounded-xl overflow-hidden bg-white/10 border border-white/10 shrink-0 flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={scan.productName || "Product"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <Package className="w-10 h-10 text-white/30" />
              )}
            </div>

            {/* Core info */}
            <div className="flex-1 min-w-0">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${cfg.badge}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {cfg.label}
              </div>

              <h2 className="text-2xl font-bold truncate mb-1">
                {scan.productName || "Unknown Product"}
              </h2>
              <p className="text-white/60 text-sm mb-3">
                {scan.brandName || "—"}
              </p>

              {/* Confidence bar */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/50 w-24 shrink-0">Confidence</span>
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      status === "likely_authentic"
                        ? "bg-green-400"
                        : status === "suspicious" || status === "review_required"
                        ? "bg-orange-400"
                        : "bg-white/30"
                    }`}
                    style={{ width: `${confidence}%` }}
                  />
                </div>
                <span className={`text-sm font-bold w-10 text-right ${cfg.color}`}>
                  {confidence}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {/* Category */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white/45 uppercase tracking-wide mb-1">Category</p>
              <p className="text-sm font-medium capitalize truncate">
                {scan.category || "—"}
              </p>
            </div>
          </div>

          {/* Barcode */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
              <Barcode className="w-5 h-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white/45 uppercase tracking-wide mb-1">Barcode / Code</p>
              <p className="text-sm font-medium font-mono truncate">
                {barcodeValue}
              </p>
            </div>
          </div>

          {/* Scan date */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-start gap-4 sm:col-span-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white/45 uppercase tracking-wide mb-1">Scan Date</p>
              <p className="text-sm font-medium">{formatDate(scan.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* AI Reasoning */}
        {reasoning.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">AI Reasoning</h3>
                <p className="text-xs text-white/50">Analysis from AI engine</p>
              </div>
            </div>
            <ul className="space-y-2">
              {reasoning.map((line, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suspicious Indicators */}
        {suspiciousIndicators.length > 0 && (
          <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-300">Suspicious Indicators</h3>
                <p className="text-xs text-orange-400/60">Flags raised during analysis</p>
              </div>
            </div>
            <ul className="space-y-2">
              {suspiciousIndicators.map((indicator, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-orange-200">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                  {indicator}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

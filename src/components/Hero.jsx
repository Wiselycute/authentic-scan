import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Scan,
  Camera,
  QrCode,
  Shield,
} from "lucide-react";

export function Hero({ onScanClick }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 px-4 sm:px-6 mx-0 md:mx-8">
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      <div className="max-w-7xl mx-auto relative z-10 bg-black w-full ">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-left space-y-4">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2  mt-5 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-blue-400" />

              <span className="text-sm text-white/80">
                AI-Powered Authenticity Verification
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl md:text-3xl xl:text-4xl  font-bold leading-tight">
              <span className="block">Detect Fake</span>

              <span className="block bg-linear-to-r from-blue-400 via-cyan-400 to-cyan-400 bg-clip-text text-transparent">
                Products Instantly
              </span>

              <span className="block">with AI</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-xl text-white/60 max-w-2xl lg:max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              Upload images, scan barcodes and QR codes, and let
              advanced AI analyze authenticity risks in seconds.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 pt-0">
              <button
                onClick={onScanClick}
                className="group px-8 py-4 bg-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-2xl font-semibold transition-all hover:scale-105 shadow-2xl shadow-blue-500/25 flex items-center gap-3"
              >
                <Scan className="w-5 h-5" />

                Scan Product Now

                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onScanClick}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-semibold transition-all backdrop-blur-sm"
              >
                Try AI Verification
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-10 max-w-3xl mx-auto lg:mx-0">
              <div className="space-y-1">
                <div className="text-xl md:text-4xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  99.8%
                </div>

                <div className="text-sm text-white/50">
                  Accuracy Rate
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xl md:text-4xl font-bold bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  &lt;2s
                </div>

                <div className="text-sm text-white/50">
                  Scan Time
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xl md:text-4xl font-bold bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  5M+
                </div>

                <div className="text-sm text-white/50">
                  Products Verified
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full max-w-xl mx-auto lg:mx-0 lg:justify-self-end">
            <div className="absolute -inset-4 " />

            <div className="relative ">
              <Image
                src="/hero-image3.png"
                alt="Product authenticity AI scanner preview"
                width={800}
                height={800}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Floating Dashboard Preview */}
        <motion.div
          className="relative max-w-5xl mx-auto pt-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <div className="glass-card rounded-3xl p-8 scan-line">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Image Scan */}
              <div className="glass-card rounded-2xl p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-white font-semibold">
                  Image Scan
                </h3>

                <p className="text-sm text-slate-400">
                  AI visual analysis
                </p>
              </div>

              {/* QR Verification */}
              <div className="glass-card rounded-2xl p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-white font-semibold">
                  QR Verification
                </h3>

                <p className="text-sm text-slate-400">
                  Instant validation
                </p>
              </div>

              {/* Trust Score */}
              <div className="glass-card rounded-2xl p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-white font-semibold">
                  Trust Score
                </h3>

                <p className="text-sm text-slate-400">
                  Real-time results
                </p>
              </div>

            </div>
          </div>
        </motion.div>

        </div>
    </section>
  );
}
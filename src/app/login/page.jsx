"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#02071F] flex items-center justify-center px-6 py-16">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-30 -left-25 h-100 w-100 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-30 -right-25 h-100 w-100 rounded-full bg-blue-500/20 blur-3xl" />

        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-size-[64px_64px]" />
      </div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 grid w-full max-w-4xl max-h-150 overflow-hidden rounded-4xl border border-cyan-500/20 bg-white/5 backdrop-blur-2xl shadow-[0_0_80px_rgba(34,211,238,0.12)] lg:h-150 lg:grid-cols-2"
      >
        {/* Left Side */}
        <div className="no-scrollbar relative hidden h-full flex-col justify-between overflow-y-auto border-r border-white/10 px-10 py-6 lg:flex">
          <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400  shadow-[0_0_25px_rgba(34,211,238,0.45)]">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>

              <div>
                <h1 className="bg-linear-to-r from-cyan-300 via-blue-400 to-cyan-400 bg-clip-text text-2xl font-bold text-transparent">
                  AUTHENTIC SCAN
                </h1>
                <p className="text-sm tracking-[0.3em] text-slate-500">PRODUCT VERIFICATION</p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold leading-tight text-white">
                Detect Fake Products
                <span className="block bg-linear-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
                  Instantly with AI
                </span>
              </h2>

              <p className="max-w-md text-sm leading-relaxed text-slate-400">
                Scan QR codes, analyze packaging, and verify authenticity using advanced AI-powered product detection technology.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-1 grid gap-2">
            {[
              {
                title: "AI Product Scan",
                desc: "Advanced visual detection",
              },
              {
                title: "QR Verification",
                desc: "Instant authenticity checks",
              },
              {
                title: "Trust Score",
                desc: "Real-time AI confidence",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
              >
                <h3 className="mb-1 font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side */}
        <div className="no-scrollbar relative flex h-full items-start justify-center overflow-y-auto p-6 sm:p-8">
          <div className="w-full max-w-md py-2">
            <div className="mb-6">
              <h2 className="mb-2 text-4xl font-bold text-white">Welcome Back</h2>
              <p className="text-slate-400">Login to continue verifying products securely.</p>
            </div>

            <form className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Email Address</label>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xl transition-all focus-within:border-cyan-400/40 focus-within:shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <Mail className="h-5 w-5 text-cyan-300" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Password</label>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xl transition-all focus-within:border-cyan-400/40 focus-within:shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <Lock className="h-5 w-5 text-cyan-300" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 transition-colors hover:text-cyan-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-400">
                  <input type="checkbox" className="rounded border-white/20 bg-white/10" />
                  Remember me
                </label>
                <button type="button" className="text-cyan-300 hover:text-cyan-200">
                  Forgot Password?
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-cyan-400  px-6 py-4 font-semibold text-white shadow-[0_0_30px_rgba(34,211,238,0.35)] transition-all hover:shadow-[0_0_40px_rgba(34,211,238,0.5)]"
              >
                <span> Login </span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-sm text-slate-500">OR CONTINUE WITH</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="rounded-2xl border border-white/10 bg-white/5 py-4 text-sm font-medium text-white backdrop-blur-xl transition-all hover:border-cyan-400/30 hover:bg-cyan-500/10">
                Google
              </button>
              <button className="rounded-2xl border border-white/10 bg-white/5 py-4 text-sm font-medium text-white backdrop-blur-xl transition-all hover:border-cyan-400/30 hover:bg-cyan-500/10">
                GitHub
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?
              <Link href="/register" className="ml-2 text-cyan-300 hover:text-cyan-200">
                Register
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

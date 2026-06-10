"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Upload,
  QrCode,
  Package,
  Shield,
  CheckCircle,
  BarChart3,
  FileText,
  Users,
  TrendingUp,
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/footer";

const benefits = [
  {
    icon: Shield,
    title: "Protect Your Brand",
    description: "Register authentic products and combat counterfeits effectively.",
  },
  {
    icon: BarChart3,
    title: "Track Counterfeits",
    description: "Monitor fake product reports and take action instantly.",
  },
  {
    icon: Users,
    title: "Build Trust",
    description: "Show customers you're committed to authenticity.",
  },
  {
    icon: TrendingUp,
    title: "Increase Sales",
    description: "Verified products increase consumer confidence.",
  },
];

const steps = [
  {
    number: "01",
    title: "Register Your Brand",
    description: "Create your enterprise account with verification documents.",
  },
  {
    number: "02",
    title: "Upload Product Database",
    description: "Add official packaging, codes, and product information.",
  },
  {
    number: "03",
    title: "Monitor and Respond",
    description: "Track counterfeit reports and protect your reputation.",
  },
];

const features = [
  {
    icon: Package,
    title: "Product Database",
    description: "Upload and manage your authentic product catalog.",
  },
  {
    icon: QrCode,
    title: "Custom QR Codes",
    description: "Generate unique verification codes for your products.",
  },
  {
    icon: FileText,
    title: "Counterfeit Reports",
    description: "Receive alerts about fake products in the market.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track scans, authenticity rates, and trends.",
  },
  {
    icon: Shield,
    title: "Brand Protection",
    description: "Legal support and takedown assistance.",
  },
];

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <Navbar />

      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 backdrop-blur-xl mb-6">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-slate-300">For Brands and Manufacturers</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Brand{" "}
              <span className="bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Partnership Portal
              </span>
            </h1>

            <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400">
              Join leading brands in the fight against counterfeits. Register your products and protect your brand reputation.
            </p>
          </motion.section>

          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
            {benefits.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.35 }}
                  className="h-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-center mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 text-center">{item.description}</p>
                </motion.article>
              );
            })}
          </section>

          <section className="mb-16">
            <h2 className="text-center text-3xl md:text-4xl font-bold mb-10">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {steps.map((step) => (
                <article key={step.number} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-7">
                  <p className="text-5xl font-bold text-cyan-400 mb-4">{step.number}</p>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-slate-400">{step.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid lg:grid-cols-2 gap-8">
            <article className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8">
              <h2 className="text-2xl font-semibold mb-7">Register Your Brand</h2>

              <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
                <Field label="Company Name" placeholder="Enter your company name" />
                <Field label="Website URL" placeholder="https://example.com" />

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Contact Name" placeholder="John Doe" />
                  <Field label="Email" type="email" placeholder="john@example.com" />
                </div>

                <Field label="Product Categories" placeholder="Electronics, Cosmetics..." />

                <div>
                  <label className="text-sm font-medium text-white/90">Additional Information</label>
                  <textarea
                    rows={5}
                    placeholder="Tell us about your brand..."
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>

                <button
                  type="button"
                  className="w-full border-2 border-dashed border-cyan-400/30 rounded-2xl p-8 text-center hover:border-cyan-400 transition"
                >
                  <Upload className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
                  <p className="font-semibold">Upload Verification Documents</p>
                  <p className="text-sm text-slate-400">Business license, trademark certificate, etc.</p>
                </button>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 transition text-lg font-semibold inline-flex items-center justify-center gap-2"
                >
                  <Building2 className="w-5 h-5" />
                  Submit Application
                </button>
              </form>
            </article>

            <div className="space-y-6">
              <article className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8">
                <h3 className="text-xl font-semibold mb-6">What You Get</h3>
                <div className="space-y-5">
                  {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div key={feature.title} className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-cyan-400 to-blue-500 flex items-center justify-center shrink-0">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{feature.title}</h4>
                          <p className="text-sm text-slate-400">{feature.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8">
                <h3 className="text-xl font-semibold mb-4">Trusted By</h3>
                <p className="text-slate-400 mb-6">Join over 1,200+ brands already protecting their products.</p>
                <div className="grid grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
                    >
                      <Building2 className="w-8 h-8 text-slate-500" />
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 backdrop-blur-2xl p-6">
                <div className="flex gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Enterprise Support</h4>
                    <p className="text-sm text-slate-300">
                      Dedicated account manager and 24/7 priority support for all enterprise partners.
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Field({ label, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-sm font-medium text-white/90">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
      />
    </div>
  );
}
import React from "react";
import {
  Upload,
  Cpu,
  CheckCircle,
} from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: "Upload or Scan",
      description:
        "Take a photo or upload product images, QR codes, or barcodes from your device",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Cpu,
      title: "AI Analyzes Product",
      description:
        "Our advanced AI examines packaging, logos, codes, and compares against verified database",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: CheckCircle,
      title: "Get Authenticity Result",
      description:
        "Receive instant verification score with detailed analysis and risk assessment",
      color: "from-cyan-500 to-blue-500",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-32 px-6"
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-20">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm mb-6">
            <span className="text-sm text-white/80">
              Simple Process
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            How It{" "}
            <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Works
            </span>
          </h2>

          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Three simple steps to verify any product's
            authenticity
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={index}
                className="relative group"
              >
                
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-24 left-full w-full h-0.5 bg-linear-to-r from-white/20 to-transparent -translate-x-1/2 z-0" />
                )}

                {/* Card */}
                <div className="relative bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:border-white/30 transition-all group-hover:scale-105 z-10">
                  
                  {/* Step Number */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-400  rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-16 h-16 bg-cyan-500 ${step.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-4">
                    {step.title}
                  </h3>

                  <p className="text-white/60 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          
          <p className="text-white/60 mb-6">
            Ready to verify your products?
          </p>

          <button className="px-8 py-4 bg-blue-500 hover:from-blue-600 hover:to-cyan-600 rounded-2xl font-semibold transition-all hover:scale-105 shadow-2xl shadow-blue-500/25">
            Start Scanning Now
          </button>
        </div>
      </div>
    </section>
  );
}
import React from "react";
import {
  Shield,
  Lock,
  Database,
  Award,
  Eye,
  CheckCircle2,
} from "lucide-react";

export default function TrustSecurity() {
  const features = [
    {
      icon: Shield,
      title: "AI-Powered Verification",
      description:
        "Advanced machine learning models trained on millions of authentic and counterfeit products",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Lock,
      title: "Encrypted Scans",
      description:
        "End-to-end encryption ensures your product data and images remain completely private",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: Database,
      title: "Trusted Database",
      description:
        "Verified manufacturer database with over 50,000 brands and counting",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: Award,
      title: "Brand Partnerships",
      description:
        "Official partnerships with leading brands for direct product verification",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Eye,
      title: "Real-Time Analysis",
      description:
        "Instant fraud detection using computer vision and pattern recognition",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: CheckCircle2,
      title: "Secure Engine",
      description:
        "Enterprise-grade security infrastructure protecting every scan",
      color: "from-cyan-500 to-teal-500",
    },
  ];

  return (
    <section id="security" className="py-32 px-6 relative">
      {/* Background Accent */}
      <div className="absolute inset-0 bg-linear-to-b from-blue-500/5 via-transparent to-cyan-500/5"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm mb-6">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-white/80">
              Enterprise Security
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Trust &{" "}
            <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Security
            </span>
          </h2>

          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Built with enterprise-grade security and trusted by millions
            worldwide
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="group bg-linear-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all hover:-translate-y-1"
              >
                <div
                  className={`w-14 h-14 bg-cyan-500 ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-semibold mb-3">
                  {feature.title}
                </h3>

                <p className="text-white/60 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="relative">
          <div className="absolute -inset-4 bg-linear-to-r from-blue-500/10 via-cyan-500/10 to-cyan-500/10 rounded-3xl blur-3xl"></div>

          <div className="relative bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-12">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-4xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  256-bit
                </div>
                <div className="text-sm text-white/60">Encryption</div>
              </div>

              <div className="space-y-2">
                <div className="text-4xl font-bold bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  50K+
                </div>
                <div className="text-sm text-white/60">
                  Verified Brands
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-4xl font-bold bg-linear-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  99.9%
                </div>
                <div className="text-sm text-white/60">Uptime SLA</div>
              </div>

              <div className="space-y-2">
                <div className="text-4xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  SOC 2
                </div>
                <div className="text-sm text-white/60">Certified</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-60">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span className="text-sm">ISO 27001</span>
          </div>

          <div className="w-px h-6 bg-white/20"></div>

          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            <span className="text-sm">GDPR Compliant</span>
          </div>

          <div className="w-px h-6 bg-white/20"></div>

          <div className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            <span className="text-sm">SOC 2 Type II</span>
          </div>

          <div className="w-px h-6 bg-white/20"></div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm">PCI DSS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
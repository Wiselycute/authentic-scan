import React from "react";
import {
  Shield,
  Mail,
  MapPin,
} from "lucide-react";
import Link from "next/link";

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.6c0-.9.2-1.6 1.6-1.6h1.7V4.1c-.3 0-1.3-.1-2.5-.1-2.4 0-4.1 1.5-4.1 4.2v2.4H8v3.2h2.2V22h3.3z" />
    </svg>
  );
}

function TikTokIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.8 3c.4 1.8 1.5 3 3.2 3.5v3.3c-1.2 0-2.4-.3-3.5-.9v6.4c0 3.4-2.8 6.2-6.2 6.2S4 18.7 4 15.3s2.8-6.2 6.2-6.2c.3 0 .7 0 1 .1v3.5a2.7 2.7 0 0 0-1-.2 2.9 2.9 0 0 0 0 5.8 2.9 2.9 0 0 0 2.9-2.9V3h3.7z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export  function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-cyan-500/10 ">
    

      {/* Grid Overlay */}
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-cyan-500  shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                <Shield className="w-6 h-6 text-white" />
              </div>

              <div>
                <h2 className="text-xl font-bold bg-linear-to-r from-cyan-300 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  AUTHENTIC SCAN
                </h2>
                <p className="text-xs text-slate-500 tracking-widest">
                  AI PRODUCT VERIFICATION
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-400">
              Advanced AI-powered fake product detection platform helping users
              verify authenticity through QR, barcode, and visual analysis.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-4">
                {[
                { icon: FacebookIcon, href: "#" },
                { icon: TikTokIcon, href: "#" },
                { icon: InstagramIcon, href: "#" },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <a
                    key={index}
                    href={item.href}
                    className="group flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-slate-400 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-5 text-lg font-semibold text-white">
              Product
            </h3>

            <ul className="space-y-3">
              {[
                { label: "AI Scanner", to: "/scanner" },
                { label: "Analytics Dashboard", to: "/dashboard" },
                { label: "Brand Portal", to: "/brand" },
                { label: "API Documentation", to: "#" },
              ].map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.to}
                    className="group flex items-center text-sm text-slate-400 transition-all hover:text-cyan-300"
                  >
                    <span className="mr-2 h-0.5 w-0 bg-cyan-400 transition-all duration-300 group-hover:w-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-5 text-lg font-semibold text-white">
              Company
            </h3>

            <ul className="space-y-3">
              {[
                "About Us",
                "Careers",
                "Press Kit",
                "Contact",
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="group flex items-center text-sm text-slate-400 transition-all hover:text-cyan-300"
                  >
                    <span className="mr-2 h-0.5 w-0 bg-cyan-400 transition-all duration-300 group-hover:w-4" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 text-lg font-semibold text-white">
              Contact
            </h3>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
                  <Mail className="h-5 w-5 text-cyan-300" />
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    Email
                  </p>
                  <p className="text-sm text-slate-400">
                    support@authenticscan.ai
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
                  <MapPin className="h-5 w-5 text-cyan-300" />
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    Location
                  </p>
                  <p className="text-sm text-slate-400">
                    San Francisco, CA
                    <br />
                    United States
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-cyan-500/10 pt-8 md:flex-row">
          <p className="text-sm text-slate-500">
            © 2026 AUTHENTIC SCAN. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
            <a
              href="#"
              className="transition-colors hover:text-cyan-300"
            >
              Privacy Policy
            </a>

            <a
              href="#"
              className="transition-colors hover:text-cyan-300"
            >
              Terms of Service
            </a>

            <a
              href="#"
              className="transition-colors hover:text-cyan-300"
            >
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
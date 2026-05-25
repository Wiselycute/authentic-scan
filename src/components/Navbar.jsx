"use client";
import React from "react";
import { useState } from "react";
import Link from "next/link";
import { Shield, Menu, X } from "lucide-react";

export const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Shield className="w-7 h-7 text-white" />
            </div>

            <span className="text-xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              AuthentiScan
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="/#features"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Features
            </a>

            <a
              href="/#how-it-works"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              How It Works
            </a>

            <a
              href="/#security"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Security
            </a>

            <Link
              href="/dashboard"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Dashboard
            </Link>

            <Link
              href="/scanner"
              className="px-6 py-2.5 bg-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl font-medium transition-all hover:scale-105 shadow-lg shadow-blue-500/25"
            >
              Scan Product
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="px-6 py-4 space-y-4">
            
            <a
              href="/#features"
              className="block text-white/70 hover:text-white transition-colors"
            >
              Features
            </a>

            <a
              href="/#how-it-works"
              className="block text-white/70 hover:text-white transition-colors"
            >
              How It Works
            </a>

            <a
              href="/#security"
              className="block text-white/70 hover:text-white transition-colors"
            >
              Security
            </a>

            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left text-white/70 hover:text-white transition-colors"
            >
              Dashboard
            </Link>

            <Link
              href="/scanner"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full px-6 py-3 bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl font-medium transition-all"
            >
              Scan Product
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

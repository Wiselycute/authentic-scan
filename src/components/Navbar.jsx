"use client";
import React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/utils/contexts/AuthContext";

export const Navbar = () => {
    const router = useRouter();
    const { user, isLogin, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const role = String(user?.role || "").toLowerCase();
    const isAdmin = role === "admin";
    const userName = user?.fullName || user?.name || user?.username || user?.email || "User";
    const userInitial = userName.trim().charAt(0).toUpperCase() || "U";

    const handleLogout = () => {
      logout();
      setProfileMenuOpen(false);
      setMobileMenuOpen(false);
      router.push("/login");
    };

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
              href="/brand"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Brand
            </Link>

            {isAdmin && (
              <Link
                href="/dashboard"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            )}

            <Link
              href="/scanner"
              className="px-6 py-2.5 bg-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl font-medium transition-all hover:scale-105 shadow-lg shadow-blue-500/25"
            >
              Scan Product
            </Link>

            {isLogin ? (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-semibold flex items-center justify-center shadow-lg shadow-cyan-500/25"
                  aria-label="Open profile menu"
                >
                  {userInitial}
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-52 rounded-2xl border border-white/10 bg-[#0b1229]/95 backdrop-blur-xl p-2 shadow-2xl">
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-sm text-white font-medium truncate">{userName}</p>
                      <p className="text-xs text-white/50 capitalize">{role || "user"}</p>
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
            ) : null}
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
              href="/brand"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-white/70 hover:text-white transition-colors"
            >
              Brand
            </Link>

            {isAdmin && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-left text-white/70 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            )}

            <Link
              href="/scanner"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full px-6 py-3 bg-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl font-medium transition-all"
            >
              Scan Product
            </Link>

            {isLogin ? (
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 rounded-xl border border-rose-400/20 bg-rose-500/10 text-rose-200 text-left"
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
}

"use client";

import React from "react";
import { useRouter } from "next/navigation";

import { Hero } from "../components/Hero";
import { HowItWorks } from "../components/HowItWorks";
import TrustSecurity from "../components/TrustSecurity";
import { ProductCategories } from "../components/ProductCategories";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/footer";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black  text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Navigation */}
      <Navbar />

      <div className="relative z-10">
        <>
          <Hero onScanClick={() => router.push("/scanner")} />
          <HowItWorks />
          <TrustSecurity />
          <ProductCategories />
        </>
      </div>

      <Footer />
    </div>
  );
}
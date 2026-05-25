"use client";

import React from "react";
import { useRouter } from "next/navigation";

import { AdminDashboard } from "@/components/AdminDashboard";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#050816] text-white overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10">
        <AdminDashboard onBack={() => router.push("/")} />
      </div>
    </div>
  );
}

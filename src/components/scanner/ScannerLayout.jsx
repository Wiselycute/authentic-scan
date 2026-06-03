"use client";

import { Menu, PanelLeftClose, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import MobileOverlay from "@/components/scanner/MobileOverlay";

export default function ScannerLayout({
  sidebarOpen,
  onToggleSidebar,
  onCloseSidebar,
  onNewScan,
  sidebar,
  composer,
  children,
}) {
  return (
    <div className="min-h-dvh bg-[#050816] text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-[18%] w-120 h-120 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-32 right-[14%] w-120 h-120 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <MobileOverlay open={sidebarOpen} onClose={onCloseSidebar} />

      <div className="relative z-10 flex min-h-dvh">
        <AnimatePresence initial={false}>
          {sidebarOpen ? (
            <motion.aside
              initial={{ x: -28, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -28, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 w-[88vw] max-w-90 border-r border-white/10 bg-[#071124]/95 backdrop-blur-2xl lg:relative lg:z-20 lg:w-90 lg:max-w-none"
            >
              {sidebar}
            </motion.aside>
          ) : null}
        </AnimatePresence>

        <main className="flex-1 min-w-0 flex flex-col lg:h-dvh">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050816]/82 backdrop-blur-2xl">
            <div className="px-3 sm:px-5 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                  type="button"
                  onClick={onToggleSidebar}
                  className="w-10 h-10 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center justify-center"
                  aria-label="Toggle scan history"
                >
                  {sidebarOpen ? <PanelLeftClose className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
                </button>

                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/75">Scanner workspace</p>
                  <h1 className="text-base sm:text-lg font-semibold text-white truncate">Product verification conversations</h1>
                </div>
              </div>

              <button
                type="button"
                onClick={onNewScan}
                className="h-10 px-3.5 rounded-2xl bg-linear-to-r from-cyan-500 to-blue-600 text-sm font-medium shadow-lg shadow-cyan-500/20 hover:opacity-95 transition inline-flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                New scan
              </button>
            </div>
          </header>

          <div className="flex-1 min-h-0 px-2 pb-2 sm:px-3 sm:pb-3 lg:px-4 lg:pb-4">
            <div className="h-full rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,16,38,0.82),rgba(4,10,24,0.92))] backdrop-blur-2xl shadow-[0_0_60px_rgba(8,15,40,0.32)] flex flex-col overflow-hidden">
              {children}
            </div>
          </div>

          <div className="relative z-20 px-2 pb-2 sm:px-3 sm:pb-3 lg:px-4 lg:pb-4">
            {composer}
          </div>
        </main>
      </div>
    </div>
  );
}
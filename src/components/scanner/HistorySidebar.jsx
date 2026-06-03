"use client";

import { Loader2, Search, Sparkles } from "lucide-react";
import ScanHistoryItem from "@/components/scanner/ScanHistoryItem";

export default function HistorySidebar({
  items,
  activeScanId,
  loading,
  loadingMore,
  hasMore,
  search,
  onSearch,
  onLoadMore,
  onSelect,
  onDelete,
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-5 pb-4 border-b border-white/10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">Scan history</p>
        <h2 className="mt-2 text-lg font-semibold text-white">Previous conversations</h2>
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 h-11">
          <Search className="w-4 h-4 text-white/35" />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search scans, brands, codes..."
            className="w-full bg-transparent text-sm text-white placeholder:text-white/35 outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {loading ? <SidebarSkeleton /> : null}

        {!loading && items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-cyan-400/20 bg-cyan-500/[0.06] p-5 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-200 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="mt-3 text-sm font-medium text-white">No scans yet</h3>
            <p className="mt-1 text-xs leading-5 text-white/55">
              Start a product scan to create your first conversation thread. Past scans will appear here.
            </p>
          </div>
        ) : null}

        {!loading
          ? items.map((item) => (
              <ScanHistoryItem
                key={item.scanId}
                item={item}
                active={activeScanId === item.scanId}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            ))
          : null}

        {!loading && hasMore ? (
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="w-full h-11 rounded-2xl border border-white/10 bg-white/5 text-sm text-white/80 hover:bg-white/10 transition disabled:cursor-not-allowed"
          >
            {loadingMore ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading more...
              </span>
            ) : (
              "Load more"
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="rounded-3xl border border-white/8 bg-white/[0.04] p-3 animate-pulse">
          <div className="flex gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/8 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 rounded bg-white/8 w-2/3" />
              <div className="h-3 rounded bg-white/8 w-1/3" />
              <div className="h-3 rounded bg-white/8 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
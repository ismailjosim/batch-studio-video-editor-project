"use client";

import { Archive, Check, Copy, Search } from "lucide-react";

interface SplitterToolbarProps {
  batchesCount: number;
  isZipping: boolean;
  zipSuccess: boolean;
  copiedSummary: boolean;
  searchQuery: string;
  onDownloadZip: () => void;
  onCopySummary: () => void;
  onSearchChange: (query: string) => void;
}

export function SplitterToolbar({
  batchesCount,
  isZipping,
  zipSuccess,
  copiedSummary,
  searchQuery,
  onDownloadZip,
  onCopySummary,
  onSearchChange,
}: SplitterToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl border border-white/10 bg-[#10121a]/90 backdrop-blur-md shadow-xl">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={onDownloadZip}
          disabled={isZipping}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-extrabold text-xs font-heading shadow-lg shadow-teal-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {isZipping ? (
            <>
              <Archive className="w-4 h-4 animate-spin" />
              <span>Packing ZIP...</span>
            </>
          ) : zipSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>ZIP Downloaded!</span>
            </>
          ) : (
            <>
              <Archive className="w-4 h-4" />
              <span>Download All Batches ZIP ({batchesCount} Batches)</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onCopySummary}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
        >
          {copiedSummary ? (
            <>
              <Check className="w-4 h-4 text-teal-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Summary Table</span>
            </>
          )}
        </button>
      </div>

      <div className="relative w-full sm:w-64">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search subtitles..."
          className="w-full rounded-xl border border-white/15 bg-black/40 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none"
        />
      </div>
    </div>
  );
}

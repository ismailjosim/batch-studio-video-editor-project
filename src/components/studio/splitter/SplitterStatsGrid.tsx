"use client";

import type { ParsedSubtitle, SplitBatch } from "./splitter-types";

interface SplitterStatsGridProps {
  parsedSubs: ParsedSubtitle[];
  batches: SplitBatch[];
  batchSize: number;
}

export function SplitterStatsGrid({
  parsedSubs,
  batches,
  batchSize,
}: SplitterStatsGridProps) {
  if (parsedSubs.length === 0) return null;

  const lastSub = parsedSubs[parsedSubs.length - 1];
  const fullDuration = lastSub?.endTime
    ? lastSub.endTime.split(",")[0]
    : "0:00";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="rounded-2xl border border-white/10 bg-[#12131b]/80 p-4 shadow-lg flex flex-col gap-1">
        <span className="text-[11px] uppercase font-bold text-slate-400">
          Total Subtitles
        </span>
        <span className="text-2xl font-black text-white font-heading">
          {parsedSubs.length}
        </span>
      </div>

      <div className="rounded-2xl border border-cyan-500/25 bg-[#12131b]/80 p-4 shadow-lg flex flex-col gap-1">
        <span className="text-[11px] uppercase font-bold text-cyan-400">
          Total Batches
        </span>
        <span className="text-2xl font-black text-cyan-400 font-heading">
          {batches.length}
        </span>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#12131b]/80 p-4 shadow-lg flex flex-col gap-1">
        <span className="text-[11px] uppercase font-bold text-slate-400">
          Batch Size
        </span>
        <span className="text-2xl font-black text-white font-heading">
          {batchSize} / batch
        </span>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#12131b]/80 p-4 shadow-lg flex flex-col gap-1">
        <span className="text-[11px] uppercase font-bold text-slate-400">
          Full Duration
        </span>
        <span className="text-2xl font-black text-pink-400 font-heading">
          {fullDuration}
        </span>
      </div>
    </div>
  );
}

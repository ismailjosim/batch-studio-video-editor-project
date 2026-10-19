"use client";

import { Download } from "lucide-react";
import { formatDisplayTime } from "../subtitle-sync-utils";

interface SubtitleHeaderProps {
  audioFileName: string;
  cuesCount: number;
  duration: number;
  onExportSrt: () => void;
}

export function SubtitleHeader({
  audioFileName,
  cuesCount,
  duration,
  onExportSrt,
}: SubtitleHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl border border-white/10 bg-[#0e1018]/90 backdrop-blur-xl shadow-xl">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 text-black flex items-center justify-center font-black text-lg shadow-lg shadow-emerald-500/20">
          S
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-tight text-white font-heading">
              {audioFileName
                ? audioFileName.replace(/\.[^.]+$/, "")
                : "Untitled Session"}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
              v1.1.7 Precision
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Decoded waveform scrubbing, cue edge resizing, playhead snapping,
            and SRT export.
          </p>
        </div>
      </div>

      {/* Top Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131622] border border-white/10 text-xs font-mono text-slate-400">
          <span className="text-slate-200 font-bold">{cuesCount}</span>
          <span>subtitles</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400 font-bold">
            {formatDisplayTime(duration, false, true)}
          </span>
        </div>

        <button
          type="button"
          onClick={onExportSrt}
          disabled={cuesCount === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span>Export SRT</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-black/20 text-[9px] font-mono ml-1">
            Ctrl E
          </kbd>
        </button>
      </div>
    </div>
  );
}

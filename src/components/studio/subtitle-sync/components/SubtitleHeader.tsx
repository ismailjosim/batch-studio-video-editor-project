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
        <div className="w-12 h-12 rounded-2xl bg-[#0e1019] border border-white/10 flex items-center justify-center p-1.5 shadow-lg shadow-cyan-500/15 shrink-0">
          <img
            src="/batch-studio-suit-logo.png"
            alt="Batch Studio Suite"
            className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(0,210,255,0.4)]"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-tight text-white font-heading">
              {audioFileName
                ? audioFileName.replace(/\.[^.]+$/, "")
                : "Untitled Session"}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-bold">
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
          <span className="text-cyan-400 font-bold">
            {formatDisplayTime(duration, false, true)}
          </span>
        </div>

        <button
          type="button"
          onClick={onExportSrt}
          disabled={cuesCount === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#00d2ff] via-[#ec4899] to-[#f97316] hover:opacity-95 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          title="Export subtitles in multiple formats (.srt, .vtt, .ass, .txt, .json)"
        >
          <Download className="w-4 h-4" />
          <span>Export Subtitles</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-black/20 text-[9px] font-mono ml-1">
            Ctrl E
          </kbd>
        </button>
      </div>
    </div>
  );
}

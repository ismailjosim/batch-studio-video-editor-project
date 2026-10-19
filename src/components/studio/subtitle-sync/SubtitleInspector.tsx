"use client";

import { ArrowLeft, ArrowRight, FileText, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { InspectorTimingControls } from "./components/InspectorTimingControls";
import { InspectorWordKaraoke } from "./components/InspectorWordKaraoke";
import type { SubtitleCue, WordTiming } from "./subtitle-sync-types";
import {
  computeDefaultWordTimings,
  formatTimecode,
} from "./subtitle-sync-utils";

interface SubtitleInspectorProps {
  cue: SubtitleCue | null;
  totalCues: number;
  playheadMs: number;
  onUpdateText: (text: string) => void;
  onUpdateTiming: (startMs: number, endMs: number) => void;
  onUpdateWords?: (cueId: number, words: WordTiming[]) => void;
  onAuditionRange?: (startMs: number, endMs: number) => void;
  onDeleteCue: () => void;
  onSelectPrev: () => void;
  onSelectNext: () => void;
}

export function SubtitleInspector({
  cue,
  totalCues,
  playheadMs,
  onUpdateText,
  onUpdateTiming,
  onUpdateWords,
  onAuditionRange,
  onDeleteCue,
  onSelectPrev,
  onSelectNext,
}: SubtitleInspectorProps) {
  const words: WordTiming[] = useMemo(() => {
    if (!cue) return [];
    if (cue.words && cue.words.length > 0) return cue.words;
    return computeDefaultWordTimings(cue.text, cue.startMs, cue.endMs);
  }, [cue]);

  if (!cue) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[#0e1018]/90 border border-white/10 rounded-3xl text-center shadow-xl backdrop-blur-xl">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <span className="text-sm font-bold text-slate-200">
          No subtitle selected
        </span>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Select any subtitle block on the timeline to edit its timing, split
          it, or change its text content.
        </p>
      </div>
    );
  }

  const durationMs = Math.max(0, cue.endMs - cue.startMs);
  const durationSec = (durationMs / 1000).toFixed(3);

  return (
    <div className="flex flex-col gap-4 p-5 bg-[#0e1018]/90 border border-white/10 rounded-3xl shadow-xl backdrop-blur-xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold">
            #{cue.id}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <span>Selected Subtitle Cue</span>
              <span className="text-[10px] text-slate-400 font-normal">
                ({cue.id} of {totalCues})
              </span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {formatTimecode(cue.startMs)} ➔ {formatTimecode(cue.endMs)} (
              {durationSec}s)
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSelectPrev}
            className="p-1.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Previous Cue (Arrow Left)"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onSelectNext}
            className="p-1.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Next Cue (Arrow Right)"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDeleteCue}
            className="p-1.5 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all cursor-pointer ml-1"
            title="Delete Selected Cue (Del)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Subtitle Textarea */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="subtitle-textarea"
          className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between"
        >
          <span>Subtitle Text Content</span>
          <span className="text-[9px] text-cyan-400 uppercase font-mono font-bold">
            live sync
          </span>
        </label>
        <textarea
          id="subtitle-textarea"
          value={cue.text}
          onChange={(e) => onUpdateText(e.target.value)}
          placeholder="Enter subtitle line here..."
          rows={3}
          className="w-full p-3.5 rounded-2xl bg-[#0a0b10] border border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 text-sm text-slate-100 placeholder-slate-600 outline-hidden transition-all resize-none leading-relaxed"
        />
        <span className="text-[10px] text-slate-500 italic">
          Changes are reflected on the timeline and SRT export immediately.
        </span>
      </div>

      {/* Timing Controls (Start/End Nudging + Playhead Snapping) */}
      <InspectorTimingControls
        cue={cue}
        playheadMs={playheadMs}
        onUpdateTiming={onUpdateTiming}
      />

      {/* Word-Level Karaoke Timing */}
      <InspectorWordKaraoke
        cue={cue}
        words={words}
        playheadMs={playheadMs}
        onUpdateWords={onUpdateWords}
        onAuditionRange={onAuditionRange}
      />
    </div>
  );
}

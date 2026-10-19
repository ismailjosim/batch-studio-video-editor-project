"use client";

import { Clock, Pin } from "lucide-react";
import type { SubtitleCue } from "../subtitle-sync-types";
import { formatDisplayTime } from "../subtitle-sync-utils";

interface InspectorTimingControlsProps {
  cue: SubtitleCue;
  playheadMs: number;
  onUpdateTiming: (startMs: number, endMs: number) => void;
}

export function InspectorTimingControls({
  cue,
  playheadMs,
  onUpdateTiming,
}: InspectorTimingControlsProps) {
  const handleNudgeStart = (deltaMs: number) => {
    const newStart = Math.max(0, cue.startMs + deltaMs);
    if (newStart < cue.endMs - 100) {
      onUpdateTiming(newStart, cue.endMs);
    }
  };

  const handleNudgeEnd = (deltaMs: number) => {
    const newEnd = Math.max(cue.startMs + 100, cue.endMs + deltaMs);
    onUpdateTiming(cue.startMs, newEnd);
  };

  const handleSnapStartToNeedle = () => {
    const targetMs = Math.round(playheadMs);
    if (targetMs < cue.endMs - 100) {
      onUpdateTiming(targetMs, cue.endMs);
    }
  };

  const handleSnapEndToNeedle = () => {
    const targetMs = Math.round(playheadMs);
    if (targetMs > cue.startMs + 100) {
      onUpdateTiming(cue.startMs, targetMs);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/10">
      {/* Start Time Fine-Tuning */}
      <div className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-[#0a0b10]/90 border border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Start Time</span>
          </span>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {formatDisplayTime(cue.startMs / 1000, true)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleNudgeStart(-500)}
            className="flex-1 py-1.5 px-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 transition-all cursor-pointer"
          >
            -500ms
          </button>
          <button
            type="button"
            onClick={() => handleNudgeStart(-100)}
            className="flex-1 py-1.5 px-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 transition-all cursor-pointer"
          >
            -100ms
          </button>
          <button
            type="button"
            onClick={() => handleNudgeStart(100)}
            className="flex-1 py-1.5 px-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 transition-all cursor-pointer"
          >
            +100ms
          </button>
          <button
            type="button"
            onClick={() => handleNudgeStart(500)}
            className="flex-1 py-1.5 px-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 transition-all cursor-pointer"
          >
            +500ms
          </button>
        </div>

        <button
          type="button"
          onClick={handleSnapStartToNeedle}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-[11px] font-bold text-emerald-300 transition-all cursor-pointer mt-0.5"
        >
          <Pin className="w-3 h-3 text-emerald-400" />
          <span>Snap Start to Playhead Needle</span>
        </button>
      </div>

      {/* End Time Fine-Tuning */}
      <div className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-[#0a0b10]/90 border border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-teal-400" />
            <span>End Time</span>
          </span>
          <span className="text-xs font-mono font-bold text-teal-400">
            {formatDisplayTime(cue.endMs / 1000, true)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleNudgeEnd(-500)}
            className="flex-1 py-1.5 px-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 transition-all cursor-pointer"
          >
            -500ms
          </button>
          <button
            type="button"
            onClick={() => handleNudgeEnd(-100)}
            className="flex-1 py-1.5 px-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 transition-all cursor-pointer"
          >
            -100ms
          </button>
          <button
            type="button"
            onClick={() => handleNudgeEnd(100)}
            className="flex-1 py-1.5 px-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 transition-all cursor-pointer"
          >
            +100ms
          </button>
          <button
            type="button"
            onClick={() => handleNudgeEnd(500)}
            className="flex-1 py-1.5 px-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 transition-all cursor-pointer"
          >
            +500ms
          </button>
        </div>

        <button
          type="button"
          onClick={handleSnapEndToNeedle}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-[11px] font-bold text-teal-300 transition-all cursor-pointer mt-0.5"
        >
          <Pin className="w-3 h-3 text-teal-400" />
          <span>Snap End to Playhead Needle</span>
        </button>
      </div>
    </div>
  );
}

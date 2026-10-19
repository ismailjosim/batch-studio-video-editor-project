"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import type { SubtitleCue } from "../subtitle-sync-types";
import { formatDisplayTime } from "../subtitle-sync-utils";

interface TimelineCueBlockProps {
  cue: SubtitleCue;
  isSelected: boolean;
  leftPx: number;
  widthPx: number;
  startMs: number;
  onSelectCue: (id: number) => void;
  onPointerDownResize: (
    e: ReactPointerEvent,
    cue: SubtitleCue,
    edge: "start" | "end",
  ) => void;
  onPointerMoveResize: (e: ReactPointerEvent) => void;
  onPointerUpResize: (e: ReactPointerEvent) => void;
}

export function TimelineCueBlock({
  cue,
  isSelected,
  leftPx,
  widthPx,
  startMs,
  onSelectCue,
  onPointerDownResize,
  onPointerMoveResize,
  onPointerUpResize,
}: TimelineCueBlockProps) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelectCue(cue.id);
      }}
      className={`absolute top-2.5 h-20 rounded-xl px-2.5 py-1.5 flex flex-col justify-between transition-colors duration-150 cursor-pointer ${
        isSelected
          ? "bg-emerald-950/50 border-2 border-emerald-400 text-white shadow-lg shadow-emerald-500/25 z-20"
          : "bg-[#131622]/90 hover:bg-[#181c2c] border border-white/10 text-slate-200 shadow-sm z-10"
      }`}
      style={{
        left: `${leftPx}px`,
        width: `${widthPx}px`,
      }}
    >
      {/* Left Resize Handle */}
      <div
        onPointerDown={(e) => onPointerDownResize(e, cue, "start")}
        onPointerMove={onPointerMoveResize}
        onPointerUp={onPointerUpResize}
        className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize flex items-center justify-center group hover:bg-emerald-400/20 rounded-l-xl z-30"
        title="Drag to adjust start time (Snaps to needle)"
      >
        <div className="w-1 h-8 rounded-full bg-slate-500/40 group-hover:bg-emerald-400 transition-colors" />
      </div>

      {/* Cue Content */}
      <div className="flex items-center justify-between gap-1 text-[10px] font-mono text-slate-400 pointer-events-none leading-none">
        <span className="font-bold text-emerald-400">#{cue.id}</span>
        <span className="truncate text-[9px] opacity-80 font-mono">
          {formatDisplayTime(startMs / 1000, true)}
        </span>
      </div>

      <p className="text-xs font-medium text-slate-100 line-clamp-2 leading-tight pointer-events-none select-none my-auto">
        {cue.text || <span className="italic text-slate-500">Empty cue</span>}
      </p>

      {/* Right Resize Handle */}
      <div
        onPointerDown={(e) => onPointerDownResize(e, cue, "end")}
        onPointerMove={onPointerMoveResize}
        onPointerUp={onPointerUpResize}
        className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize flex items-center justify-center group hover:bg-emerald-400/20 rounded-r-xl z-30"
        title="Drag to adjust end time (Snaps to needle)"
      >
        <div className="w-1 h-8 rounded-full bg-slate-500/40 group-hover:bg-emerald-400 transition-colors" />
      </div>
    </div>
  );
}

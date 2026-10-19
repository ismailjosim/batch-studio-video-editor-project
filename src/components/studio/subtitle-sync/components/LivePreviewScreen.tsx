"use client";

import { Pause, Play, Sparkles } from "lucide-react";
import type { SubtitleCue } from "../subtitle-sync-types";
import { computeDefaultWordTimings } from "../subtitle-sync-utils";

export type AspectRatio = "9:16" | "16:9" | "1:1";
export type SubtitleStylePreset =
  | "hormozi-pop"
  | "jc-cyan-glow"
  | "emerald-glow"
  | "classic-yellow"
  | "minimal-clean";

interface LivePreviewScreenProps {
  activeCue: SubtitleCue | null;
  currentTimeMs: number;
  aspectRatio: AspectRatio;
  containerAspectClasses: string;
  stylePreset: SubtitleStylePreset;
  animKey: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export function LivePreviewScreen({
  activeCue,
  currentTimeMs,
  aspectRatio,
  containerAspectClasses,
  stylePreset,
  animKey,
  isPlaying,
  onTogglePlay,
}: LivePreviewScreenProps) {
  return (
    <div className="p-4 flex flex-col sm:flex-row items-center justify-center gap-4 bg-[#0a0b10]/40">
      {/* Simulated Screen Monitor */}
      <div
        onClick={onTogglePlay}
        className={`relative ${containerAspectClasses} rounded-2xl overflow-hidden shadow-2xl border-2 border-white/15 bg-radial from-[#121820] to-[#07080c] flex flex-col items-center justify-center cursor-pointer group select-none transition-all duration-200`}
      >
        {/* Ambient Background Grid pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* Subtle center crosshairs */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-8 h-px bg-white/40" />
          <div className="h-8 w-px bg-white/40" />
        </div>

        {/* Play/Pause Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20">
          <div className="w-10 h-10 rounded-full bg-cyan-400/90 text-black flex items-center justify-center shadow-lg">
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </div>
        </div>

        {/* Aspect Ratio Badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 border border-white/10 text-[9px] font-mono text-slate-300 pointer-events-none z-10">
          {aspectRatio}
        </div>

        {/* Current Subtitle Burn-In Overlay */}
        <div className="absolute inset-x-3 bottom-8 flex flex-col items-center justify-center text-center z-10 pointer-events-none">
          {activeCue ? (
            <div
              key={animKey}
              className={`animate-in zoom-in-90 fade-in duration-150 px-2.5 py-1 ${getStylePresetClasses(
                stylePreset,
              )}`}
            >
              {formatSubtitleWords(activeCue, stylePreset, currentTimeMs)}
            </div>
          ) : (
            <span className="text-[11px] font-mono text-slate-600 italic">
              [ Silence / No Subtitle ]
            </span>
          )}
        </div>

        {/* Bottom Safe Area Line */}
        <div className="absolute bottom-2 inset-x-4 h-0.5 bg-cyan-500/20 rounded-full pointer-events-none" />
      </div>

      {/* Quick Info & Tips */}
      <div className="flex flex-col gap-2 max-w-xs text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Realtime Burn-In Preview</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          This preview shows exactly how text typography and timing will appear
          when burned into the final 2K video.
        </p>
        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1 text-[10px] font-mono">
          <div className="flex justify-between">
            <span className="text-slate-500">Active Cue:</span>
            <span className="text-cyan-400 font-bold">
              {activeCue ? `#${activeCue.id}` : "None"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Preset:</span>
            <span className="text-slate-300 capitalize">
              {stylePreset.replace("-", " ")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Click Monitor:</span>
            <span className="text-slate-300">Play / Pause</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStylePresetClasses(preset: SubtitleStylePreset): string {
  switch (preset) {
    case "hormozi-pop":
      return "font-heading font-black tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] text-sm sm:text-base leading-tight uppercase stroke-black";
    case "jc-cyan-glow":
    case "emerald-glow":
      return "font-sans font-extrabold tracking-tight text-cyan-300 drop-shadow-[0_0_16px_rgba(0,210,255,0.7)] text-sm sm:text-base leading-tight";
    case "classic-yellow":
      return "font-sans font-bold text-[#ffeb3b] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] text-xs sm:text-sm leading-normal";
    case "minimal-clean":
      return "font-sans font-semibold text-slate-100 bg-black/60 px-3 py-1 rounded-xl backdrop-blur-md text-xs leading-relaxed";
  }
}

function formatSubtitleWords(
  cue: SubtitleCue,
  preset: SubtitleStylePreset,
  currentTimeMs: number,
): React.ReactNode {
  const wordTimings =
    cue.words && cue.words.length > 0
      ? cue.words
      : computeDefaultWordTimings(cue.text, cue.startMs, cue.endMs);

  return wordTimings.map((item, idx) => {
    const isCurrentlySpoken =
      currentTimeMs >= item.startMs && currentTimeMs <= item.endMs;
    const isPast = currentTimeMs > item.endMs;

    if (preset === "hormozi-pop") {
      return (
        <span
          key={idx}
          className={`inline-block px-1 py-0.5 rounded transition-all duration-75 ${
            isCurrentlySpoken
              ? "text-amber-300 font-black scale-110 drop-shadow-[0_0_12px_rgba(251,191,36,0.95)] bg-amber-400/25 ring-1 ring-amber-400/40"
              : isPast
                ? "text-white font-extrabold opacity-95"
                : "text-slate-400/80 font-bold"
          }`}
        >
          {item.word}
        </span>
      );
    }

    if (preset === "jc-cyan-glow" || preset === "emerald-glow") {
      return (
        <span
          key={idx}
          className={`inline-block px-1 py-0.5 rounded transition-all duration-75 ${
            isCurrentlySpoken
              ? "text-cyan-300 font-black scale-110 drop-shadow-[0_0_14px_rgba(0,210,255,0.95)] bg-cyan-500/25 ring-1 ring-cyan-400/40"
              : isPast
                ? "text-cyan-100 font-extrabold opacity-95"
                : "text-slate-400 font-semibold"
          }`}
        >
          {item.word}
        </span>
      );
    }

    if (preset === "classic-yellow") {
      return (
        <span
          key={idx}
          className={`inline-block px-0.5 transition-all duration-75 ${
            isCurrentlySpoken
              ? "underline decoration-2 decoration-amber-300 text-amber-200 font-black scale-105"
              : isPast
                ? "text-yellow-300 opacity-95"
                : "text-yellow-100/70 opacity-60"
          }`}
        >
          {item.word}
        </span>
      );
    }

    // minimal-clean
    return (
      <span
        key={idx}
        className={`inline-block px-0.5 transition-all duration-75 ${
          isCurrentlySpoken
            ? "text-white font-bold bg-white/20 rounded px-1"
            : isPast
              ? "text-slate-200"
              : "text-slate-400 opacity-70"
        }`}
      >
        {item.word}
      </span>
    );
  });
}

"use client";

import {
  ChevronDown,
  ChevronUp,
  Maximize2,
  Monitor,
  Smartphone,
  Square,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  type AspectRatio,
  LivePreviewScreen,
  type SubtitleStylePreset,
} from "./components/LivePreviewScreen";
import type { SubtitleCue } from "./subtitle-sync-types";

export type { AspectRatio, SubtitleStylePreset };

interface SubtitleLivePreviewProps {
  cues: SubtitleCue[];
  currentTime: number; // in seconds
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
}

export function SubtitleLivePreview({
  cues,
  currentTime,
  isPlaying,
  onTogglePlay,
}: SubtitleLivePreviewProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [stylePreset, setStylePreset] =
    useState<SubtitleStylePreset>("hormozi-pop");
  const [animKey, setAnimKey] = useState<number>(0);

  const currentMs = currentTime * 1000;
  const activeCue = cues.find(
    (c) => currentMs >= c.startMs && currentMs <= c.endMs,
  );

  // Trigger bounce animation when cue changes
  useEffect(() => {
    if (activeCue?.id) {
      setAnimKey((k) => k + 1);
    }
  }, [activeCue?.id]);

  // Determine aspect ratio dimensions
  const containerAspectClasses = {
    "9:16": "w-[170px] sm:w-[190px] h-[300px] sm:h-[338px]",
    "16:9": "w-full max-w-[360px] h-[190px] sm:h-[202px]",
    "1:1": "w-[220px] sm:w-[240px] h-[220px] sm:h-[240px]",
  }[aspectRatio];

  return (
    <div className="flex flex-col bg-[#0e1018]/90 border border-white/10 rounded-3xl shadow-xl backdrop-blur-xl overflow-hidden transition-all duration-300">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a0b10]/60 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-heading font-bold text-white text-xs tracking-tight flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Typography Preview</span>
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            Realtime
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Aspect Ratio Toggles */}
          <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-white/10 text-[10px]">
            <button
              type="button"
              onClick={() => setAspectRatio("9:16")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                aspectRatio === "9:16"
                  ? "bg-cyan-400 text-black font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Vertical 9:16 (Shorts / Reels / TikTok)"
            >
              <Smartphone className="w-3 h-3" />
              <span>9:16</span>
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio("16:9")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                aspectRatio === "16:9"
                  ? "bg-cyan-400 text-black font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Widescreen 16:9 (YouTube)"
            >
              <Maximize2 className="w-3 h-3" />
              <span>16:9</span>
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio("1:1")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                aspectRatio === "1:1"
                  ? "bg-cyan-400 text-black font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Square 1:1 (Feed)"
            >
              <Square className="w-3 h-3" />
              <span>1:1</span>
            </button>
          </div>

          {/* Style Preset Selector */}
          <select
            value={stylePreset}
            onChange={(e) =>
              setStylePreset(e.target.value as SubtitleStylePreset)
            }
            className="bg-black/40 border border-white/10 rounded-xl px-2 py-1 text-[10px] text-slate-300 outline-hidden cursor-pointer"
            title="Subtitle Typography Style"
          >
            <option value="hormozi-pop">⚡ Hormozi Pop</option>
            <option value="jc-cyan-glow">💎 JC Cyan Glow</option>
            <option value="classic-yellow">🎬 Classic Cinema</option>
            <option value="minimal-clean">✨ Minimal Clean</option>
          </select>

          {/* Collapse/Expand toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isExpanded ? "Collapse Preview" : "Expand Preview"}
          >
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Preview Content */}
      {isExpanded && (
        <LivePreviewScreen
          activeCue={activeCue || null}
          currentTimeMs={currentMs}
          aspectRatio={aspectRatio}
          containerAspectClasses={containerAspectClasses}
          stylePreset={stylePreset}
          animKey={animKey}
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
        />
      )}
    </div>
  );
}

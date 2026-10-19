"use client";

import {
  FastForward,
  LocateFixed,
  Pause,
  Play,
  Radio,
  Rewind,
  Volume1,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { BgmTrackSettings } from "./subtitle-sync-types";
import { formatDisplayTime } from "./subtitle-sync-utils";

interface SubtitleTransportProps {
  isPlaying: boolean;
  currentTime: number; // in seconds
  duration: number; // in seconds
  zoom: number; // zoom percentage (e.g. 190)
  playbackRate: number;
  isMuted: boolean;
  volume?: number; // 0.0 to 1.0
  isAutoScrollEnabled: boolean;
  bgmTrack?: BgmTrackSettings;
  onChangeBgmVolume?: (volume: number) => void;
  onToggleBgmDucking?: () => void;
  onTogglePlay: () => void;
  onSeek: (timeInSeconds: number) => void;
  onChangeZoom: (newZoom: number) => void;
  onChangePlaybackRate: (rate: number) => void;
  onToggleMute: () => void;
  onChangeVolume: (volume: number) => void;
  onToggleAutoScroll: () => void;
  onJump: (deltaSeconds: number) => void;
}

export function SubtitleTransport({
  isPlaying,
  currentTime,
  duration,
  zoom,
  playbackRate,
  isMuted,
  volume = 0.8,
  isAutoScrollEnabled,
  bgmTrack,
  onChangeBgmVolume,
  onToggleBgmDucking,
  onTogglePlay,
  onSeek,
  onChangeZoom,
  onChangePlaybackRate,
  onToggleMute,
  onChangeVolume,
  onToggleAutoScroll,
  onJump,
}: SubtitleTransportProps) {
  const safeDuration = Math.max(0.1, duration);
  const playbackRates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const safeVolume =
    typeof volume === "number" && Number.isFinite(volume)
      ? Math.max(0, Math.min(1, volume))
      : 0.8;
  const effectiveVolume = isMuted ? 0 : Math.round(safeVolume * 100);

  return (
    <div className="flex flex-col gap-3.5 p-4 bg-[#0e1018]/90 border border-white/10 rounded-3xl shadow-xl backdrop-blur-xl">
      {/* 1. Main Scrubber Bar */}
      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={onTogglePlay}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-black transition-all cursor-pointer shadow-lg shrink-0 ${
            isPlaying
              ? "bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 shadow-orange-500/25"
              : "bg-linear-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-emerald-500/30 hover:scale-[1.02]"
          }`}
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Current Time Readout */}
        <span className="font-mono text-sm font-bold text-emerald-400 min-w-20 tracking-tight">
          {formatDisplayTime(currentTime, true, false)}
        </span>

        {/* Interactive Scrubber Slider */}
        <div className="flex-1 relative flex items-center group py-2">
          <input
            type="range"
            min={0}
            max={safeDuration}
            step={0.01}
            value={Math.min(safeDuration, currentTime)}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#141724] rounded-lg appearance-none cursor-pointer accent-emerald-400 group-hover:h-2.5 transition-all outline-hidden"
          />
        </div>

        {/* Total Time Readout */}
        <span className="font-mono text-xs font-semibold text-slate-400 min-w-20 text-right tracking-tight">
          {formatDisplayTime(safeDuration, true, false)}
        </span>
      </div>

      {/* 2. Secondary Bar: Controls, Speed, Volume & Zoom Engine */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-white/10 text-xs">
        {/* Left Side: Jump buttons, Playback Rate, Follow Needle, Volume */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onJump(-5)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[11px] transition-all cursor-pointer"
            title="Jump back 5s"
          >
            <Rewind className="w-3.5 h-3.5" />
            <span>-5s</span>
          </button>
          <button
            type="button"
            onClick={() => onJump(5)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[11px] transition-all cursor-pointer"
            title="Jump forward 5s"
          >
            <span>+5s</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 ml-1 bg-black/40 p-0.5 rounded-xl border border-white/10">
            {playbackRates.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => onChangePlaybackRate(rate)}
                className={`px-1.5 py-0.5 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                  playbackRate === rate
                    ? "bg-emerald-400 text-black font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Follow Playhead Auto-Scroll Toggle */}
          <button
            type="button"
            onClick={onToggleAutoScroll}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ml-1 ${
              isAutoScrollEnabled
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200"
            }`}
            title="Auto-scroll timeline to follow playhead needle when reaching edge"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Follow Playhead</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAutoScrollEnabled ? "bg-emerald-400" : "bg-slate-500"
              }`}
            />
          </button>

          {/* Audio Volume Slider & Mute Toggle */}
          <div
            className="flex items-center gap-2 ml-1 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10"
            title={`Volume: ${effectiveVolume}% (Drag to adjust or click icon to mute)`}
          >
            <button
              type="button"
              onClick={onToggleMute}
              className="p-0.5 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={isMuted || volume === 0 ? "Unmute audio" : "Mute audio"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </button>

            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={effectiveVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value) / 100;
                if (Number.isFinite(val)) {
                  onChangeVolume(val);
                }
              }}
              className="w-16 sm:w-20 h-1.5 bg-[#141724] rounded-lg appearance-none cursor-pointer accent-emerald-400"
              aria-label="Audio Volume Slider"
            />

            <span className="font-mono text-[10px] font-semibold text-slate-400 min-w-7 text-right">
              {effectiveVolume}%
            </span>
          </div>

          {/* Multi-Track BGM Mixer (Visible when BGM track is loaded) */}
          {bgmTrack?.url && (
            <div
              className="flex items-center gap-2 ml-1 bg-violet-950/30 px-2.5 py-1 rounded-xl border border-violet-500/30 text-xs"
              title="Multi-Track BGM volume & auto-ducking"
            >
              <div className="flex items-center gap-1 text-violet-400">
                <Radio className="w-3.5 h-3.5" />
                <span className="font-mono text-[10px] font-bold">BGM</span>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(bgmTrack.volume * 100)}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) / 100;
                  if (Number.isFinite(val)) {
                    onChangeBgmVolume?.(val);
                  }
                }}
                className="w-14 sm:w-16 h-1.5 bg-[#141724] rounded-lg appearance-none cursor-pointer accent-violet-400"
                aria-label="BGM Audio Volume Slider"
              />

              <span className="font-mono text-[10px] font-semibold text-violet-300 min-w-6 text-right">
                {Math.round(bgmTrack.volume * 100)}%
              </span>

              {/* Auto Ducking Toggle */}
              <button
                type="button"
                onClick={onToggleBgmDucking}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                  bgmTrack.isDuckingEnabled
                    ? "bg-violet-500/20 text-violet-300 border border-violet-400/30"
                    : "bg-white/5 text-slate-500 hover:text-slate-300"
                }`}
                title="Auto-Ducking: lowers BGM volume automatically whenever speech is active"
              >
                {bgmTrack.isDuckingEnabled ? "Ducking ON" : "Ducking OFF"}
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Zoom Controls */}
        <div className="flex items-center gap-2.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Timeline Zoom
          </span>

          <button
            type="button"
            onClick={() => onChangeZoom(Math.max(50, zoom - 25))}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <input
            type="range"
            min={50}
            max={500}
            step={10}
            value={zoom}
            onChange={(e) => onChangeZoom(parseInt(e.target.value, 10))}
            className="w-20 sm:w-28 h-1.5 bg-[#141724] rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />

          <button
            type="button"
            onClick={() => onChangeZoom(Math.min(500, zoom + 25))}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onChangeZoom(100)}
            className="px-1.5 py-0.5 rounded border border-white/10 text-[10px] font-mono text-emerald-400 font-bold hover:bg-emerald-500/10 transition-colors cursor-pointer"
            title="Reset Zoom to 100%"
          >
            {zoom}%
          </button>
        </div>
      </div>
    </div>
  );
}

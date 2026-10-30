"use client";

import { Film, Layers, Monitor, Music, Sparkles, Volume2 } from "lucide-react";
import type { SRTData, VideoSettings } from "@/lib/video-generator/types";

interface ProjectSummaryCardProps {
  srtData: SRTData | null;
  audioBuffer: AudioBuffer | null;
  audioFileName: string;
  loadedImagesCount: number;
  settings: VideoSettings;
  onEditStep: (step: 1 | 2) => void;
}

export function ProjectSummaryCard({
  srtData,
  audioBuffer,
  audioFileName,
  loadedImagesCount,
  settings,
  onEditStep,
}: ProjectSummaryCardProps) {
  const cuesCount = srtData ? srtData.cues.length : 0;
  const resolutionLabel =
    settings.resolution === "1440"
      ? "2K QHD 1440p (2560×1440)"
      : settings.resolution === "1080"
        ? "1080p Full HD (1920×1080)"
        : "720p HD (1280×720)";

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#10121a]/70 backdrop-blur-md p-5 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white font-heading">
          <Film className="w-4 h-4 text-cyan-400" />
          <span>Render Project Specification</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-bold">
          Ready to Encode
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {/* Resolution & Ratio */}
        <div className="flex flex-col gap-1 p-3 rounded-xl border border-white/5 bg-white/2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <Monitor className="w-3.5 h-3.5 text-cyan-400" />
              <span>Video Output</span>
            </span>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>
          <div className="font-bold text-white">{resolutionLabel}</div>
          <div className="text-[11px] text-slate-400">
            {settings.aspectRatio} • {settings.fps} FPS •{" "}
            {(settings.bitrate / 1000000).toFixed(0)} Mbps
          </div>
          {settings.watermarkImage ? (
            <div className="text-[11px] text-cyan-400 font-medium flex items-center gap-1">
              <span>
                Watermark:{" "}
                {(settings.watermarkPosition || "bottom-right").replace(
                  "-",
                  " ",
                )}{" "}
                ({Math.round((settings.watermarkOpacity ?? 0.8) * 100)}%)
              </span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500">No watermark</div>
          )}
        </div>

        {/* Subtitles */}
        <div className="flex flex-col gap-1 p-3 rounded-xl border border-white/5 bg-white/2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <Layers className="w-3.5 h-3.5 text-pink-400" />
              <span>Subtitles (.srt)</span>
            </span>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="text-[11px] text-pink-400 hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>
          <div className="font-bold text-white truncate">
            {srtData ? `${srtData.fileName}.srt` : "Not loaded"}
          </div>
          <div className="text-[11px] text-slate-400">
            {cuesCount} cues •{" "}
            {settings.isSubtitleBurnInEnabled !== false
              ? `Burn-In: ${settings.subtitlePreset || "hormozi-pop"} (${settings.subtitleFont || "Impact"} • ${settings.subtitleAnimation || "pop-bounce"})`
              : "Burn-In disabled"}
          </div>
        </div>

        {/* Storyboard Images & Audio */}
        <div className="flex flex-col gap-1 p-3 rounded-xl border border-white/5 bg-white/2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <Music className="w-3.5 h-3.5 text-orange-400" />
              <span>Images & Audio</span>
            </span>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="text-[11px] text-orange-400 hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>
          <div className="font-bold text-white">
            {loadedImagesCount} storyboard images
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {audioBuffer
              ? `${audioFileName} (${formatDuration(audioBuffer.duration)})`
              : "No background audio track"}
          </div>
          {Object.keys(settings.cueAssetMap || {}).length > 0 ? (
            <div className="text-[11px] text-emerald-400 font-medium">
              {Object.keys(settings.cueAssetMap || {}).length} scenes
              custom-mapped
            </div>
          ) : (
            <div className="text-[11px] text-slate-500">
              Sequential cue sync
            </div>
          )}
        </div>

        {/* Animations & SFX */}
        <div className="flex flex-col gap-1 p-3 rounded-xl border border-white/5 bg-white/2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Animations & SFX</span>
            </span>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>
          <div className="font-bold text-white">
            {settings.selectedAnims.size} active transitions
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-cyan-400" />
            <span>
              {settings.isSfxEnabled
                ? `${settings.selectedSfx.size} SFX enabled`
                : "SFX muted"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

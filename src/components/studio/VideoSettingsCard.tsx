"use client";

import { Film, Gauge, Monitor, Sliders, Sparkles } from "lucide-react";
import type {
  AspectRatioOption,
  ResolutionOption,
  VideoSettings,
} from "@/lib/video-generator/types";

interface VideoSettingsCardProps {
  settings: VideoSettings;
  onChange: (updated: Partial<VideoSettings>) => void;
}

export function VideoSettingsCard({
  settings,
  onChange,
}: VideoSettingsCardProps) {
  const handleResolutionChange = (newRes: ResolutionOption) => {
    // Smart recommended bitrate auto-switch
    let newBitrate = settings.bitrate;
    if (newRes === "1440") {
      newBitrate = 18000000;
    } else if (newRes === "1080") {
      if (settings.bitrate === 18000000 || settings.bitrate === 4000000) {
        newBitrate = 12000000;
      }
    } else if (newRes === "720") {
      if (settings.bitrate === 18000000 || settings.bitrate === 12000000) {
        newBitrate = 4000000;
      }
    }
    onChange({ resolution: newRes, bitrate: newBitrate });
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#10121a]/70 backdrop-blur-md p-5 shadow-xl">
      <div className="flex items-center gap-2 border-b border-white/5 pb-3 text-sm font-bold text-white tracking-wide">
        <Sliders className="w-4 h-4 text-emerald-400" />
        <span>Step 4: Resolution & Video Settings</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-1">
        {/* Resolution */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Monitor className="w-3.5 h-3.5 text-emerald-400" />
            <span>Resolution (Quality)</span>
          </label>
          <select
            value={settings.resolution}
            onChange={(e) =>
              handleResolutionChange(e.target.value as ResolutionOption)
            }
            className="w-full rounded-lg border border-white/20 bg-[#13141f] px-3 py-2 text-xs font-semibold text-slate-100 shadow-sm focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="1440" className="bg-[#13141f] text-slate-100">
              2K QHD 1440p (2560×1440 — Ultra HD)
            </option>
            <option value="1080" className="bg-[#13141f] text-slate-100">
              1080p Full HD (1920×1080 — Crisp Quality)
            </option>
            <option value="720" className="bg-[#13141f] text-slate-100">
              720p HD (1280×720 — Fast & Light)
            </option>
          </select>
        </div>

        {/* Aspect Ratio */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Film className="w-3.5 h-3.5 text-emerald-400" />
            <span>Aspect Ratio</span>
          </label>
          <select
            value={settings.aspectRatio}
            onChange={(e) =>
              onChange({ aspectRatio: e.target.value as AspectRatioOption })
            }
            className="w-full rounded-lg border border-white/20 bg-[#13141f] px-3 py-2 text-xs font-semibold text-slate-100 shadow-sm focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="16:9" className="bg-[#13141f] text-slate-100">
              16:9 Landscape (YouTube, Desktop)
            </option>
            <option value="9:16" className="bg-[#13141f] text-slate-100">
              9:16 Portrait (TikTok, Shorts, Reels)
            </option>
          </select>
        </div>

        {/* Frame Rate */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
            <span>Frame Rate (FPS)</span>
          </label>
          <select
            value={settings.fps}
            onChange={(e) => onChange({ fps: parseInt(e.target.value, 10) })}
            className="w-full rounded-lg border border-white/20 bg-[#13141f] px-3 py-2 text-xs font-semibold text-slate-100 shadow-sm focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="24" className="bg-[#13141f] text-slate-100">
              24 FPS (Cinematic — Lighter & Faster)
            </option>
            <option value="30" className="bg-[#13141f] text-slate-100">
              30 FPS (Standard Smooth)
            </option>
          </select>
        </div>

        {/* Bitrate / Video Quality */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Quality (Bitrate)</span>
          </label>
          <select
            value={settings.bitrate}
            onChange={(e) =>
              onChange({ bitrate: parseInt(e.target.value, 10) })
            }
            className="w-full rounded-lg border border-white/20 bg-[#13141f] px-3 py-2 text-xs font-semibold text-slate-100 shadow-sm focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="18000000" className="bg-[#13141f] text-slate-100">
              Studio 2K (18 Mbps — Recommended for 2K)
            </option>
            <option value="12000000" className="bg-[#13141f] text-slate-100">
              High Quality (12 Mbps — Best for 1080p)
            </option>
            <option value="8000000" className="bg-[#13141f] text-slate-100">
              Balanced (8 Mbps)
            </option>
            <option value="4000000" className="bg-[#13141f] text-slate-100">
              Fast (4 Mbps — Best for 720p)
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}

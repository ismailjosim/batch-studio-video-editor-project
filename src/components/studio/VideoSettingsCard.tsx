"use client";

import {
  Film,
  Gauge,
  Monitor,
  Shield,
  Sliders,
  Sparkles,
  Type,
} from "lucide-react";
import { useRef } from "react";
import type {
  AspectRatioOption,
  ResolutionOption,
  VideoSettings,
  WatermarkPosition,
} from "@/lib/video-generator/types";

interface VideoSettingsCardProps {
  settings: VideoSettings;
  onChange: (updated: Partial<VideoSettings>) => void;
}

export function VideoSettingsCard({
  settings,
  onChange,
}: VideoSettingsCardProps) {
  const watermarkInputRef = useRef<HTMLInputElement>(null);

  const handleResolutionChange = (newRes: ResolutionOption) => {
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

  const handleWatermarkUpload = (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      onChange({
        isWatermarkEnabled: true,
        watermarkImage: img,
      });
    };
  };

  const isSubEnabled = settings.isSubtitleBurnInEnabled !== false;
  const subPreset = settings.subtitlePreset || "hormozi-pop";
  const isWatermarkEnabled = Boolean(settings.isWatermarkEnabled);
  const watermarkPosition = settings.watermarkPosition || "top-right";
  const watermarkOpacity = Math.round(
    (settings.watermarkOpacity ?? 0.85) * 100,
  );
  const watermarkScale = Math.round((settings.watermarkScale ?? 0.14) * 100);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#10121a]/70 backdrop-blur-md p-5 shadow-xl animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white tracking-wide">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Step 4: Resolution & Video Settings</span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
          Hardware WebCodecs
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-1">
        {/* Resolution */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Monitor className="w-3.5 h-3.5 text-cyan-400" />
            <span>Resolution (Quality)</span>
          </label>
          <select
            value={settings.resolution}
            onChange={(e) =>
              handleResolutionChange(e.target.value as ResolutionOption)
            }
            className="w-full rounded-lg border border-white/20 bg-[#13141f] px-3 py-2 text-xs font-semibold text-slate-100 shadow-sm focus:border-cyan-500 focus:outline-none cursor-pointer"
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
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span>Aspect Ratio</span>
          </label>
          <select
            value={settings.aspectRatio}
            onChange={(e) =>
              onChange({ aspectRatio: e.target.value as AspectRatioOption })
            }
            className="w-full rounded-lg border border-white/20 bg-[#13141f] px-3 py-2 text-xs font-semibold text-slate-100 shadow-sm focus:border-cyan-500 focus:outline-none cursor-pointer"
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
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Frame Rate (FPS)</span>
          </label>
          <select
            value={settings.fps}
            onChange={(e) => onChange({ fps: parseInt(e.target.value, 10) })}
            className="w-full rounded-lg border border-white/20 bg-[#13141f] px-3 py-2 text-xs font-semibold text-slate-100 shadow-sm focus:border-cyan-500 focus:outline-none cursor-pointer"
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
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Quality (Bitrate)</span>
          </label>
          <select
            value={settings.bitrate}
            onChange={(e) =>
              onChange({ bitrate: parseInt(e.target.value, 10) })
            }
            className="w-full rounded-lg border border-white/20 bg-[#13141f] px-3 py-2 text-xs font-semibold text-slate-100 shadow-sm focus:border-cyan-500 focus:outline-none cursor-pointer"
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

      {/* Subtitle Burn-In Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-white/5 bg-[#0a0b12]/60 p-3.5 rounded-xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100">
                Burn-In Animated Subtitles
              </span>
              <span className="text-[9px] font-mono uppercase bg-cyan-500/15 text-cyan-400 px-1.5 py-0.5 rounded font-bold">
                Karaoke Glow
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Burns synchronized typography directly onto the video canvas with
              bouncing word-pop highlights.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            disabled={!isSubEnabled}
            value={subPreset}
            onChange={(e) =>
              onChange({
                subtitlePreset: e.target
                  .value as VideoSettings["subtitlePreset"],
              })
            }
            className="rounded-lg border border-white/20 bg-[#13141f] px-3 py-1.5 text-xs font-semibold text-slate-100 shadow-sm focus:border-cyan-500 focus:outline-none cursor-pointer disabled:opacity-40"
          >
            <option value="hormozi-pop">Hormozi Pop (High-Energy Bold)</option>
            <option value="jc-cyan-glow">💎 JC Cyan Glow</option>
            <option value="emerald-glow">Emerald Glow</option>
            <option value="classic-yellow">Classic Yellow (Cinema)</option>
            <option value="minimal-clean">Minimal Clean (Pill)</option>
          </select>

          <button
            type="button"
            onClick={() => onChange({ isSubtitleBurnInEnabled: !isSubEnabled })}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
              isSubEnabled
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : "bg-white/5 text-slate-500 border border-white/10"
            }`}
          >
            {isSubEnabled ? "Burn-In ON" : "Burn-In OFF"}
          </button>
        </div>
      </div>

      {/* Brand Logo & Watermark Overlay Row */}
      <div className="flex flex-col gap-3 pt-3 border-t border-white/5 bg-[#0a0b12]/60 p-3.5 rounded-xl border border-white/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100">
                  Brand Watermark & Logo Overlay
                </span>
                <span className="text-[9px] font-mono uppercase bg-indigo-500/15 text-indigo-400 px-1.5 py-0.5 rounded font-bold">
                  Pro Branding
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Overlay your custom PNG logo or watermark onto the video frame.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <input
              ref={watermarkInputRef}
              type="file"
              accept="image/png,image/webp,image/svg+xml,image/jpeg"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleWatermarkUpload(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => {
                if (!settings.watermarkImage) {
                  watermarkInputRef.current?.click();
                } else {
                  onChange({ isWatermarkEnabled: !isWatermarkEnabled });
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                isWatermarkEnabled && settings.watermarkImage
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                  : "bg-white/5 text-slate-400 hover:text-white border border-white/10"
              }`}
            >
              {isWatermarkEnabled && settings.watermarkImage
                ? "Watermark ON"
                : "Upload / Enable Logo"}
            </button>
          </div>
        </div>

        {/* Watermark Detailed Controls (when active) */}
        {isWatermarkEnabled && settings.watermarkImage && (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-white/5 text-xs animate-in fade-in duration-200">
            {/* Logo Preview & Change Button */}
            <div className="sm:col-span-3 flex items-center gap-2.5 p-2 rounded-lg bg-black/40 border border-white/10">
              <div className="w-12 h-12 rounded bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0">
                <img
                  src={settings.watermarkImage.src}
                  alt="Watermark Preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[11px] font-semibold text-slate-200 truncate">
                  Brand Logo
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => watermarkInputRef.current?.click()}
                    className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        isWatermarkEnabled: false,
                        watermarkImage: null,
                      })
                    }
                    className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Position Selector */}
            <div className="sm:col-span-3 flex flex-col gap-1 justify-center">
              <span className="text-[10px] font-semibold uppercase text-slate-400">
                Corner Position
              </span>
              <select
                value={watermarkPosition}
                onChange={(e) =>
                  onChange({
                    watermarkPosition: e.target.value as WatermarkPosition,
                  })
                }
                className="w-full rounded-lg border border-white/15 bg-[#13141f] px-2.5 py-1.5 text-xs font-semibold text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="top-right">Top Right (Recommended)</option>
                <option value="top-left">Top Left</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="center">Center (Protective Mark)</option>
              </select>
            </div>

            {/* Opacity Slider */}
            <div className="sm:col-span-3 flex flex-col gap-1 justify-center">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-semibold uppercase text-slate-400">
                  Opacity
                </span>
                <span className="font-mono text-cyan-400">
                  {watermarkOpacity}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={watermarkOpacity}
                onChange={(e) =>
                  onChange({
                    watermarkOpacity: parseInt(e.target.value, 10) / 100,
                  })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Scale / Size Slider */}
            <div className="sm:col-span-3 flex flex-col gap-1 justify-center">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-semibold uppercase text-slate-400">
                  Size Scale
                </span>
                <span className="font-mono text-cyan-400">
                  {watermarkScale}%
                </span>
              </div>
              <input
                type="range"
                min="6"
                max="30"
                value={watermarkScale}
                onChange={(e) =>
                  onChange({
                    watermarkScale: parseInt(e.target.value, 10) / 100,
                  })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

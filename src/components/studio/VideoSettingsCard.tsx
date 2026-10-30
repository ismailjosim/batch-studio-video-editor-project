"use client";

import {
  Film,
  Gauge,
  Monitor,
  RotateCcw,
  Shield,
  Sliders,
  Sparkles,
  Type,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { drawSubtitleOverlay } from "@/lib/video-generator/subtitle-renderer";
import type {
  AspectRatioOption,
  ResolutionOption,
  SubtitleAnimationOption,
  SubtitleFontOption,
  SubtitlePresetOption,
  VideoSettings,
  WatermarkPosition,
} from "@/lib/video-generator/types";

interface VideoSettingsCardProps {
  settings: VideoSettings;
  onChange: (updated: Partial<VideoSettings>) => void;
}

/**
 * Interactive live preview player for animated subtitles.
 * Runs simulated karaoke word tracking with real-time in/out transitions.
 */
function SubtitleLivePreviewCanvas({
  preset,
  font,
  animation,
}: {
  preset: SubtitlePresetOption;
  font: SubtitleFontOption;
  animation: SubtitleAnimationOption;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const loopDurationMs = 3400;
    // replayKey triggers re-initialization of timing loop
    const startTime = performance.now() + replayKey * 0;

    const sampleCue = {
      id: 1,
      startMs: 0,
      endMs: 3000,
      text: "CREATE HIGH IMPACT SHORTS WITH DOLLAR DOODLES",
      words: [
        { word: "CREATE", startMs: 200, endMs: 600 },
        { word: "HIGH", startMs: 600, endMs: 1000 },
        { word: "IMPACT", startMs: 1000, endMs: 1500 },
        { word: "SHORTS", startMs: 1500, endMs: 1950 },
        { word: "WITH", startMs: 1950, endMs: 2350 },
        { word: "DOLLAR", startMs: 2350, endMs: 2650 },
        { word: "DOODLES", startMs: 2650, endMs: 3000 },
      ],
    };

    const render = () => {
      const elapsed = (performance.now() - startTime) % loopDurationMs;

      const w = canvas.width;
      const h = canvas.height;

      // Draw modern dark cinematic background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, "#0e111a");
      bgGrad.addColorStop(1, "#07080d");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle mockup grid overlay
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w * 0.1, 0);
      ctx.lineTo(w * 0.1, h);
      ctx.moveTo(w * 0.9, 0);
      ctx.lineTo(w * 0.9, h);
      ctx.stroke();

      // Render subtitle overlay using the exact same renderer
      drawSubtitleOverlay({
        ctx,
        cue: sampleCue,
        currentTimeMs: elapsed,
        canvasWidth: w,
        canvasHeight: h,
        preset,
        font,
        animation,
        isPortrait: false,
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [preset, font, animation, replayKey]);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="relative rounded-xl border border-white/10 bg-black/60 overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          width={640}
          height={140}
          className="w-full h-[110px] sm:h-[130px] block"
        />
        <div className="absolute top-2 left-3 flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span className="text-[10px] font-mono font-semibold text-slate-300">
            Live Preview • Real-time Karaoke & In/Out Motion
          </span>
        </div>
        <button
          type="button"
          onClick={() => setReplayKey((k) => k + 1)}
          className="absolute top-2 right-2 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 bg-white/10 hover:bg-white/15 px-2 py-0.5 rounded border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Replay In/Out</span>
        </button>
      </div>
    </div>
  );
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
  const subFont = settings.subtitleFont || "Impact";
  const subAnimation = settings.subtitleAnimation || "pop-bounce";

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

      {/* Subtitle Burn-In Row & Studio Controls */}
      <div className="flex flex-col gap-3 pt-3 border-t border-white/5 bg-[#0a0b12]/60 p-3.5 rounded-xl border border-white/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
                  Karaoke & Motion
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Burns dynamic word-tracking typography directly onto video with
                custom fonts and in/out transitions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() =>
                onChange({ isSubtitleBurnInEnabled: !isSubEnabled })
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                isSubEnabled
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                  : "bg-white/5 text-slate-500 border border-white/10 hover:text-slate-300"
              }`}
            >
              {isSubEnabled ? "Burn-In ON" : "Burn-In OFF"}
            </button>
          </div>
        </div>

        {isSubEnabled && (
          <div className="flex flex-col gap-3 pt-3 border-t border-white/5 animate-in fade-in duration-200">
            {/* Live Interactive Preview Canvas */}
            <SubtitleLivePreviewCanvas
              preset={subPreset}
              font={subFont}
              animation={subAnimation}
            />

            {/* Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Preset / Style */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase text-slate-400">
                  Visual Style / Preset
                </label>
                <select
                  value={subPreset}
                  onChange={(e) =>
                    onChange({
                      subtitlePreset: e.target.value as SubtitlePresetOption,
                    })
                  }
                  className="rounded-lg border border-white/15 bg-[#13141f] px-2.5 py-1.5 text-xs font-semibold text-slate-100 shadow-sm focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value="hormozi-pop">
                    ⚡ Hormozi Pop (High-Energy Bold)
                  </option>
                  <option value="capcut-karaoke">
                    🎬 CapCut Karaoke (Vibrant Cyan)
                  </option>
                  <option value="dollar-doodles-brand">
                    💵 Dollar Doodles Brand (Green & Red)
                  </option>
                  <option value="beast-bold">
                    🦁 MrBeast Bold (Thick Outline)
                  </option>
                  <option value="jc-cyan-glow">
                    💎 JC Cyan Glow (Neon Electric)
                  </option>
                  <option value="emerald-glow">🌿 Emerald Mint Glow</option>
                  <option value="neon-purple">🔮 Cyber Neon Purple</option>
                  <option value="classic-yellow">
                    🎞️ Classic Cinema Yellow
                  </option>
                  <option value="boxed-badge">
                    🏷️ Boxed Badge (Dark Rounded Pill)
                  </option>
                  <option value="minimal-clean">
                    ✨ Minimal Clean (Understated)
                  </option>
                </select>
              </div>

              {/* Font Family */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase text-slate-400">
                  Font Family (CapCut Style)
                </label>
                <select
                  value={subFont}
                  onChange={(e) =>
                    onChange({
                      subtitleFont: e.target.value as SubtitleFontOption,
                    })
                  }
                  className="rounded-lg border border-white/15 bg-[#13141f] px-2.5 py-1.5 text-xs font-semibold text-slate-100 shadow-sm focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value="Impact">Impact (Heavy Bold Shorts)</option>
                  <option value="Montserrat">Montserrat (Modern Clean)</option>
                  <option value="Inter">Inter (Ultra-Crisp UI)</option>
                  <option value="Anton">Anton (Tall Condensed Headline)</option>
                  <option value="Poppins">Poppins (Friendly Rounded)</option>
                  <option value="Bangers">
                    Bangers (Comic / Cartoon Punch)
                  </option>
                </select>
              </div>

              {/* In/Out Animation */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase text-slate-400">
                  Cue In / Out Animation
                </label>
                <select
                  value={subAnimation}
                  onChange={(e) =>
                    onChange({
                      subtitleAnimation: e.target
                        .value as SubtitleAnimationOption,
                    })
                  }
                  className="rounded-lg border border-white/15 bg-[#13141f] px-2.5 py-1.5 text-xs font-semibold text-slate-100 shadow-sm focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value="pop-bounce">🏀 Pop & Spring Bounce</option>
                  <option value="fade-smooth">🌊 Smooth Fade In & Out</option>
                  <option value="slide-up">⬆️ Slide Up from Bottom</option>
                  <option value="zoom-fade">🔍 Zoom & Fade In / Out</option>
                  <option value="none">⏹️ None (Instant Cut)</option>
                </select>
              </div>
            </div>
          </div>
        )}
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

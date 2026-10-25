"use client";

import { AlertCircle, Cpu, Loader2, Rocket, Square } from "lucide-react";
import type { RenderProgress } from "@/lib/video-generator/types";

interface RenderProgressCardProps {
  isRendering: boolean;
  canGenerate: boolean;
  progress: RenderProgress;
  onGenerate: () => void;
  onCancel: () => void;
  previewCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function formatEta(seconds: number): string {
  if (!seconds || seconds <= 0 || !Number.isFinite(seconds))
    return "Calculating...";
  const s = Math.round(seconds);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const remS = s % 60;
  if (m < 60) return `${m}m ${remS.toString().padStart(2, "0")}s`;
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return `${h}h ${remM}m ${remS.toString().padStart(2, "0")}s`;
}

export function RenderProgressCard({
  isRendering,
  canGenerate,
  progress,
  onGenerate,
  onCancel,
  previewCanvasRef,
}: RenderProgressCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#10121a]/70 backdrop-blur-md p-5 shadow-xl">
      {!isRendering ? (
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#00d2ff] via-[#38bdf8] to-[#0284c7] py-3.5 px-6 font-extrabold text-sm text-black shadow-lg shadow-cyan-500/25 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <Rocket className="w-4 h-4" />
          <span>Generate MP4 Video</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onCancel}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 py-3 px-6 font-bold text-sm text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
        >
          <Square className="w-4 h-4 fill-current" />
          <span>Cancel Video Generation</span>
        </button>
      )}

      {/* Error Feedback Display */}
      {progress.status === "error" && !isRendering && (
        <div className="flex flex-col gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 mt-2 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Video Generation Interrupted</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {progress.errorMessage ||
              "Hardware GPU encoder encountered an unexpected issue."}
          </p>
          <div className="text-[11px] text-slate-400 bg-white/5 p-2.5 rounded-lg border border-white/5 flex flex-col gap-1 mt-1">
            <span className="font-semibold text-slate-300">
              💡 Recommended Solution:
            </span>
            <span>
              If 2K (1440p) resolution is too intensive for your GPU hardware
              encoder, switch to <strong>1080p Full HD</strong> in Step 1. It
              provides crisp quality and 100% universal stability across all
              browsers and devices.
            </span>
          </div>
        </div>
      )}

      {/* Canceled Notification */}
      {progress.status === "canceled" && !isRendering && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-2.5 mt-2 text-amber-300 text-xs animate-in fade-in duration-300">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Rendering was canceled by user.</span>
        </div>
      )}

      {/* Active Rendering Progress Card */}
      {isRendering && (
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/50 p-5 shadow-2xl mt-2 animate-in fade-in duration-300">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>{progress.statusText}</span>
            </span>
            <span className="font-mono text-cyan-400 font-bold text-sm">
              {progress.percent}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-[#00d2ff] via-[#ec4899] to-[#f97316] transition-all duration-100"
              style={{ width: `${progress.percent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>
              Frame: {progress.currentFrame} / {progress.totalFrames} • Scene{" "}
              {progress.currentScene}/{progress.totalScenes} (
              {progress.currentAnim})
            </span>
            <span className="text-cyan-400 font-semibold">
              Speed: {progress.fpsSpeed} FPS • ETA:{" "}
              {formatEta(progress.remainingSec)}
            </span>
          </div>

          {/* Hardware accelerated video canvas preview */}
          <div className="flex flex-col items-center gap-2 mt-2">
            <canvas
              id="renderPreviewCanvas"
              ref={previewCanvasRef}
              width={640}
              height={360}
              className="max-w-full max-h-60 rounded-xl border border-white/10 bg-black shadow-lg block"
            />
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span>Real-time Hardware GPU WebCodecs Encoding Preview</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

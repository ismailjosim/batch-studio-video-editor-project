"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { StudioAnimationsSfx } from "@/components/studio/StudioAnimationsSfx";
import type { VideoSettings } from "@/lib/video-generator/types";

interface Step2AnimationsSfxProps {
  settings: VideoSettings;
  onChange: (updated: Partial<VideoSettings>) => void;
  onOpenPreview: (animId?: string) => void;
  canGoToStep3: boolean;
  onBack: () => void;
  onContinue: () => void;
}

export function Step2AnimationsSfx({
  settings,
  onChange,
  onOpenPreview,
  canGoToStep3,
  onBack,
  onContinue,
}: Step2AnimationsSfxProps) {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-extrabold text-white font-heading tracking-tight">
            2. Transition Animations & Sound Effects
          </h2>
          <p className="text-xs text-slate-400">
            Choose transition motion effects and toggle sound fx to play
            automatically on slide changes.
          </p>
        </div>
      </div>

      <StudioAnimationsSfx
        settings={settings}
        onChange={onChange}
        onOpenPreview={onOpenPreview}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-[#10121a]/80 backdrop-blur-md shadow-xl mt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold font-heading transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Step 1: Media</span>
        </button>

        <button
          type="button"
          disabled={!canGoToStep3}
          onClick={onContinue}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs font-heading shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <span>Continue to Step 3: Video Generation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

"use client";

import { ArrowLeft, RotateCcw } from "lucide-react";
import type { RefObject } from "react";
import { OutputVideoCard } from "@/components/studio/OutputVideoCard";
import { ProjectSummaryCard } from "@/components/studio/ProjectSummaryCard";
import { RenderProgressCard } from "@/components/studio/RenderProgressCard";
import type {
  RenderProgress,
  SRTData,
  VideoSettings,
} from "@/lib/video-generator/types";

interface Step3RenderReviewProps {
  srtData: SRTData | null;
  audioBuffer: AudioBuffer | null;
  audioFileName: string;
  loadedImages: HTMLImageElement[];
  settings: VideoSettings;
  isRendering: boolean;
  canGenerate: boolean;
  progress: RenderProgress;
  previewCanvasRef: RefObject<HTMLCanvasElement | null>;
  onGenerate: () => void;
  onCancel: () => void;
  onEditStep: (step: 1 | 2) => void;
  onBack: () => void;
  onReset: () => void;
}

export function Step3RenderReview({
  srtData,
  audioBuffer,
  audioFileName,
  loadedImages,
  settings,
  isRendering,
  canGenerate,
  progress,
  previewCanvasRef,
  onGenerate,
  onCancel,
  onEditStep,
  onBack,
  onReset,
}: Step3RenderReviewProps) {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-extrabold text-white font-heading tracking-tight">
            3. Review & Hardware Video Generation
          </h2>
          <p className="text-xs text-slate-400">
            Review your project parameters and start GPU-accelerated video
            rendering.
          </p>
        </div>
      </div>

      <ProjectSummaryCard
        srtData={srtData}
        audioBuffer={audioBuffer}
        audioFileName={audioFileName}
        loadedImagesCount={loadedImages.length}
        settings={settings}
        onEditStep={onEditStep}
      />

      <RenderProgressCard
        isRendering={isRendering}
        canGenerate={canGenerate}
        progress={progress}
        onGenerate={onGenerate}
        onCancel={onCancel}
        previewCanvasRef={previewCanvasRef}
      />

      {progress.outputBlobUrl && (
        <OutputVideoCard
          outputBlobUrl={progress.outputBlobUrl}
          srtData={srtData}
          audioFileName={audioFileName}
          loadedImagesCount={loadedImages.length}
          settings={settings}
        />
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-[#10121a]/80 backdrop-blur-md shadow-xl mt-2">
        <button
          type="button"
          disabled={isRendering}
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold font-heading transition-all cursor-pointer disabled:opacity-40"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Animations & SFX</span>
        </button>

        <button
          type="button"
          disabled={isRendering}
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/20 text-rose-300 hover:bg-rose-500/10 text-xs font-semibold font-heading transition-all cursor-pointer disabled:opacity-40"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Start New Project</span>
        </button>
      </div>
    </div>
  );
}

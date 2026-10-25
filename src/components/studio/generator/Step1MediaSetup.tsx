"use client";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { AudioUploader } from "@/components/studio/AudioUploader";
import { ImagesUploader } from "@/components/studio/ImagesUploader";
import { OneClickVideoWizard } from "@/components/studio/OneClickVideoWizard";
import { SrtUploader } from "@/components/studio/SrtUploader";
import { StoryboardCueMapper } from "@/components/studio/StoryboardCueMapper";
import { VideoSettingsCard } from "@/components/studio/VideoSettingsCard";
import type { SRTData, VideoSettings } from "@/lib/video-generator/types";

interface Step1MediaSetupProps {
  srtData: SRTData | null;
  onSrtLoaded: (data: SRTData | null) => void;
  audioBuffer: AudioBuffer | null;
  audioFileName: string;
  onAudioLoaded: (buf: AudioBuffer | null, name: string) => void;
  loadedImages: HTMLImageElement[];
  onImagesLoaded: (imgs: HTMLImageElement[]) => void;
  settings: VideoSettings;
  onSettingsChange: (updated: Partial<VideoSettings>) => void;
  canGoToStep2: boolean;
  onContinue: () => void;
}

export function Step1MediaSetup({
  srtData,
  onSrtLoaded,
  audioBuffer,
  audioFileName,
  onAudioLoaded,
  loadedImages,
  onImagesLoaded,
  settings,
  onSettingsChange,
  canGoToStep2,
  onContinue,
}: Step1MediaSetupProps) {
  const hasSrt = Boolean(srtData && srtData.cues.length > 0);
  const hasImages = loadedImages.length > 0;
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-lg font-extrabold text-white font-heading tracking-tight">
            1. Media Uploads & Format Setup
          </h2>
          <p className="text-xs text-slate-400">
            Upload your voiceover .srt subtitles, storyboard image batch or
            video clips, optional background audio, and video resolution.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsWizardOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-linear-to-r from-cyan-400 via-pink-500 to-orange-500 hover:brightness-110 text-black font-black text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer shrink-0"
          title="Automate entire video generation from a single topic prompt"
        >
          <Sparkles className="w-4 h-4 text-black" />
          <span>1-Click AI Video Wizard</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SrtUploader srtData={srtData} onSrtLoaded={onSrtLoaded} />
        <AudioUploader
          audioBuffer={audioBuffer}
          audioFileName={audioFileName}
          onAudioLoaded={onAudioLoaded}
        />
      </div>

      <ImagesUploader
        srtData={srtData}
        loadedImages={loadedImages}
        onImagesLoaded={onImagesLoaded}
      />

      {hasSrt && hasImages && (
        <StoryboardCueMapper
          srtData={srtData}
          loadedImages={loadedImages}
          cueAssetMap={settings.cueAssetMap}
          onChange={(cueAssetMap) => onSettingsChange({ cueAssetMap })}
        />
      )}

      <VideoSettingsCard settings={settings} onChange={onSettingsChange} />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-[#10121a]/80 backdrop-blur-md shadow-xl mt-2">
        <div className="flex items-center gap-2 text-xs">
          {hasSrt && hasImages ? (
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>
                Ready: {srtData?.cues.length} subtitle cues and{" "}
                {loadedImages.length} images loaded
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-400/80" />
              <span>
                Upload your files here, or jump into Step 2 to preview and save
                animation presets.
              </span>
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={!canGoToStep2}
          onClick={onContinue}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-[#00d2ff] via-[#38bdf8] to-[#0284c7] hover:brightness-110 text-black font-extrabold text-xs font-heading shadow-lg shadow-cyan-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <span>Continue to Step 2: Animations & SFX</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <OneClickVideoWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onApplyProject={(params) => {
          onSrtLoaded(params.srtData);
          onAudioLoaded(params.audioBuffer, params.audioFileName);
          onImagesLoaded(params.loadedImages);
          onSettingsChange({ cueAssetMap: params.cueAssetMap });
        }}
      />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { AnimPreviewModal } from "@/components/studio/AnimPreviewModal";
import { Step1MediaSetup } from "@/components/studio/generator/Step1MediaSetup";
import { Step2AnimationsSfx } from "@/components/studio/generator/Step2AnimationsSfx";
import { Step3RenderReview } from "@/components/studio/generator/Step3RenderReview";
import { Header } from "@/components/studio/Header";
import { ProjectsHistoryModal } from "@/components/studio/ProjectsHistoryModal";
import { Stepper, type StudioStep } from "@/components/studio/Stepper";
import { useVideoGenerator } from "@/hooks/useVideoGenerator";
import {
  consumeTransferAudio,
  consumeTransferCues,
  consumeTransferImages,
} from "@/lib/studio-transfer";
import { ANIMATIONS_LIST, SFX_LIST } from "@/lib/video-generator/transitions";
import type { SRTData, VideoSettings } from "@/lib/video-generator/types";

interface VideoEditorClientProps {
  onOpenProjects?: () => void;
}

export function VideoEditorClient({ onOpenProjects }: VideoEditorClientProps) {
  // Stepper & Media State
  const [currentStep, setCurrentStep] = useState<StudioStep>(1);
  const [srtData, setSrtData] = useState<SRTData | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioFileName, setAudioFileName] = useState("");
  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);

  // Settings
  const [settings, setSettings] = useState<VideoSettings>({
    resolution: "1080",
    aspectRatio: "16:9",
    fps: 24,
    bitrate: 8000000,
    isSfxEnabled: true,
    animMode: "random",
    selectedAnims: new Set(ANIMATIONS_LIST.map((a) => a.id)),
    sfxMode: "random",
    selectedSfx: new Set(SFX_LIST.map((s) => s.id)),
  });

  // Preview & projects modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewAnimId, setPreviewAnimId] = useState("push");
  const [projectsModalOpen, setProjectsModalOpen] = useState(false);

  const handleOpenProjects = () => {
    if (onOpenProjects) {
      onOpenProjects();
    } else {
      setProjectsModalOpen(true);
    }
  };

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const { progress, isRendering, generate, cancel } = useVideoGenerator();

  // Check for transferred media from Splitter or Nano Banana AI
  useEffect(() => {
    const pendingCues = consumeTransferCues();
    if (pendingCues) {
      setSrtData(pendingCues);
      setCurrentStep(1);
    }

    const pendingImageUrls = consumeTransferImages();
    if (pendingImageUrls && pendingImageUrls.length > 0) {
      const promises = pendingImageUrls.map((url) => {
        return new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => resolve(img);
          img.src = url;
        });
      });
      Promise.all(promises).then((imgs) => {
        const validImgs = imgs.filter((img) => img.naturalWidth > 0);
        if (validImgs.length > 0) {
          setLoadedImages((prev) => [...prev, ...validImgs]);
        }
      });
    }

    // Check for transferred audio from Audio & Voice Studio
    consumeTransferAudio().then(async (transfer) => {
      if (transfer?.blob) {
        try {
          const buffer = await transfer.blob.arrayBuffer();
          const AudioContextClass =
            window.AudioContext ||
            // @ts-expect-error fallback
            window.webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const decoded = await ctx.decodeAudioData(buffer);
            setAudioBuffer(decoded);
            setAudioFileName(transfer.fileName);
            setCurrentStep(1);
          }
        } catch (err) {
          console.warn("Error decoding transferred audio:", err);
        }
      }
    });
  }, []);

  const handleSettingsChange = (updated: Partial<VideoSettings>) => {
    setSettings((prev) => ({ ...prev, ...updated }));
  };

  const handleOpenPreview = (animId?: string) => {
    if (animId) setPreviewAnimId(animId);
    setPreviewModalOpen(true);
  };

  const handleToggleAnim = (id: string, enabled: boolean) => {
    const next = new Set(settings.selectedAnims);
    if (enabled) next.add(id);
    else next.delete(id);
    setSettings((prev) => ({
      ...prev,
      selectedAnims: next,
      animMode: "custom",
    }));
  };

  const handleGenerate = async () => {
    if (!srtData || loadedImages.length === 0) return;
    await generate(
      srtData,
      audioBuffer,
      loadedImages,
      settings,
      previewCanvasRef.current,
    );
  };

  const hasSrt = Boolean(srtData && srtData.cues.length > 0);
  const hasImages = loadedImages.length > 0;
  const canGoToStep2 = true;
  const canGoToStep3 = hasSrt && hasImages;
  const canGenerate = Boolean(
    srtData && loadedImages.length > 0 && !isRendering,
  );

  const handleReset = () => {
    if (confirm("Reset current project files and return to Step 1?")) {
      setSrtData(null);
      setAudioBuffer(null);
      setAudioFileName("");
      setLoadedImages([]);
      setCurrentStep(1);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300 pb-16">
      <Header onOpenProjects={handleOpenProjects} />

      <Stepper
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
        canGoToStep2={canGoToStep2}
        canGoToStep3={canGoToStep3}
      />

      {currentStep === 1 && (
        <Step1MediaSetup
          srtData={srtData}
          onSrtLoaded={setSrtData}
          audioBuffer={audioBuffer}
          audioFileName={audioFileName}
          onAudioLoaded={(buf, name) => {
            setAudioBuffer(buf);
            setAudioFileName(name);
          }}
          loadedImages={loadedImages}
          onImagesLoaded={setLoadedImages}
          settings={settings}
          onSettingsChange={handleSettingsChange}
          canGoToStep2={canGoToStep2}
          onContinue={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 2 && (
        <Step2AnimationsSfx
          settings={settings}
          onChange={handleSettingsChange}
          onOpenPreview={handleOpenPreview}
          canGoToStep3={canGoToStep3}
          onBack={() => setCurrentStep(1)}
          onContinue={() => setCurrentStep(3)}
        />
      )}

      {currentStep === 3 && (
        <Step3RenderReview
          srtData={srtData}
          audioBuffer={audioBuffer}
          audioFileName={audioFileName}
          loadedImages={loadedImages}
          settings={settings}
          isRendering={isRendering}
          canGenerate={canGenerate}
          progress={progress}
          previewCanvasRef={previewCanvasRef}
          onGenerate={handleGenerate}
          onCancel={cancel}
          onEditStep={(step) => setCurrentStep(step)}
          onBack={() => setCurrentStep(2)}
          onReset={handleReset}
        />
      )}

      {previewModalOpen && (
        <AnimPreviewModal
          initialAnimId={previewAnimId}
          loadedImages={loadedImages}
          selectedAnims={settings.selectedAnims}
          onToggleAnim={handleToggleAnim}
          onClose={() => setPreviewModalOpen(false)}
        />
      )}

      {projectsModalOpen && (
        <ProjectsHistoryModal
          onClose={() => setProjectsModalOpen(false)}
          onLoadProjectSettings={handleSettingsChange}
        />
      )}
    </div>
  );
}

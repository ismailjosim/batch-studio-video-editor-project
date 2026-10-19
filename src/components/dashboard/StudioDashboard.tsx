"use client";

import { Film, FolderGit2, Menu, Scissors, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { AnimPreviewModal } from "@/components/studio/AnimPreviewModal";
import { AuthGate } from "@/components/studio/AuthGate";
import { Step1MediaSetup } from "@/components/studio/generator/Step1MediaSetup";
import { Step2AnimationsSfx } from "@/components/studio/generator/Step2AnimationsSfx";
import { Step3RenderReview } from "@/components/studio/generator/Step3RenderReview";
import { Header } from "@/components/studio/Header";
import { NanoBananaStudio } from "@/components/studio/nano-banana/NanoBananaStudio";
import { ProjectsHistoryModal } from "@/components/studio/ProjectsHistoryModal";
import { SrtBatchSplitter } from "@/components/studio/SrtBatchSplitter";
import { Stepper, type StudioStep } from "@/components/studio/Stepper";
import { useVideoGenerator } from "@/hooks/useVideoGenerator";
import { useSession } from "@/lib/auth-client";
import { ANIMATIONS_LIST, SFX_LIST } from "@/lib/video-generator/transitions";
import type { SRTData, VideoSettings } from "@/lib/video-generator/types";
import { DashboardSidebar, type DashboardToolTab } from "./DashboardSidebar";

export function StudioDashboard() {
  const { data: session, isPending: isSessionPending } = useSession();

  // Dashboard layout state
  const [activeTab, setActiveTab] = useState<DashboardToolTab>("generator");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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

  // Modals state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewAnimId, setPreviewAnimId] = useState("push");
  const [projectsModalOpen, setProjectsModalOpen] = useState(false);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const { progress, isRendering, generate, cancel } = useVideoGenerator();

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

  const handleLoadBatchIntoGenerator = (batchSrt: SRTData) => {
    setSrtData(batchSrt);
    setActiveTab("generator");
    setCurrentStep(1);
  };

  if (isSessionPending) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-[#0a0b10]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/25 animate-pulse">
            <Sparkles className="w-6 h-6 text-black" />
          </div>
          <span className="text-xs font-semibold text-slate-300">
            Checking studio access...
          </span>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return <AuthGate />;
  }

  return (
    <div className="min-h-screen bg-[#0a0b10] text-slate-100 flex">
      {/* 1. Dashboard Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === "projects") {
            setProjectsModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Right Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        {/* Top Navigation & Status Bar */}
        <header className="sticky top-0 z-30 w-full flex items-center justify-between gap-4 py-3 px-4 md:px-8 bg-[#0c0d14]/80 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 hidden sm:inline">Suite</span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <span className="font-bold text-white flex items-center gap-1.5">
                {activeTab === "generator" && (
                  <>
                    <Film className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SRT Video Generator</span>
                  </>
                )}
                {activeTab === "splitter" && (
                  <>
                    <Scissors className="w-3.5 h-3.5 text-teal-400" />
                    <span>SRT Batch Splitter</span>
                  </>
                )}
                {activeTab === "nano-banana" && (
                  <>
                    <span className="text-sm">🍌</span>
                    <span>Nano Banana AI Studio</span>
                  </>
                )}
                {activeTab === "projects" && (
                  <>
                    <FolderGit2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cloud Projects & History</span>
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setProjectsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Cloud Projects</span>
            </button>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-6">
          {activeTab === "splitter" && (
            <SrtBatchSplitter
              onSendToGenerator={handleLoadBatchIntoGenerator}
            />
          )}

          {activeTab === "nano-banana" && (
            <NanoBananaStudio
              onSendToVideoGenerator={(imgs) => {
                setLoadedImages((prev) => [...prev, ...imgs]);
                setActiveTab("generator");
                setCurrentStep(1);
              }}
            />
          )}

          {activeTab === "generator" && (
            <div className="flex flex-col gap-6">
              <Header onOpenProjects={() => setProjectsModalOpen(true)} />

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
            </div>
          )}

          <footer className="text-center text-slate-500 text-xs py-4 mt-auto border-t border-white/5">
            Dollar Doodles Studio Suite • Hardware WebCodecs Video & SRT Batch
            Tools • Next.js & MongoDB
          </footer>
        </main>
      </div>

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

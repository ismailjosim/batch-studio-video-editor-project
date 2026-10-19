"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Film,
  FolderGit2,
  Menu,
  RotateCcw,
  Scissors,
  Sparkles,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  DashboardSidebar,
  type DashboardToolTab,
} from "@/components/dashboard/DashboardSidebar";
import { AnimPreviewModal } from "@/components/studio/AnimPreviewModal";
import { AudioUploader } from "@/components/studio/AudioUploader";
import { AuthGate } from "@/components/studio/AuthGate";
import { Header } from "@/components/studio/Header";
import { ImagesUploader } from "@/components/studio/ImagesUploader";
import { OutputVideoCard } from "@/components/studio/OutputVideoCard";
import { ProjectSummaryCard } from "@/components/studio/ProjectSummaryCard";
import { ProjectsHistoryModal } from "@/components/studio/ProjectsHistoryModal";
import { RenderProgressCard } from "@/components/studio/RenderProgressCard";
import { SrtBatchSplitter } from "@/components/studio/SrtBatchSplitter";
import { SrtUploader } from "@/components/studio/SrtUploader";
import { Stepper, type StudioStep } from "@/components/studio/Stepper";
import { StudioAnimationsSfx } from "@/components/studio/StudioAnimationsSfx";
import { VideoSettingsCard } from "@/components/studio/VideoSettingsCard";
import { useVideoGenerator } from "@/hooks/useVideoGenerator";
import { useSession } from "@/lib/auth-client";
import { ANIMATIONS_LIST, SFX_LIST } from "@/lib/video-generator/transitions";
import type { SRTData, VideoSettings } from "@/lib/video-generator/types";

export default function StudioPage() {
  const { data: session, isPending: isSessionPending } = useSession();

  // Dashboard layout state
  const [activeTab, setActiveTab] = useState<DashboardToolTab>("generator");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Video Generator Stepper State
  const [currentStep, setCurrentStep] = useState<StudioStep>(1);

  // Step 1: Media & Setup
  const [srtData, setSrtData] = useState<SRTData | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioFileName, setAudioFileName] = useState("");
  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);

  // Step 2: Video & Animation Settings
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
  const canGoToStep2 = hasSrt && hasImages;
  const canGoToStep3 = canGoToStep2;
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

  // Cross-tool integration: load split batch directly into Video Generator
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
      {/* 1. Dashboard Sidebar (Collapsible & Mobile Drawer) */}
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
          {/* TAB 1: SRT BATCH SPLITTER */}
          {activeTab === "splitter" && (
            <SrtBatchSplitter
              onSendToGenerator={handleLoadBatchIntoGenerator}
            />
          )}

          {/* TAB 2: SRT VIDEO GENERATOR */}
          {activeTab === "generator" && (
            <div className="flex flex-col gap-6">
              {/* Tool Header */}
              <Header onOpenProjects={() => setProjectsModalOpen(true)} />

              {/* 3-Stage Multi-Step Navigation Stepper */}
              <Stepper
                currentStep={currentStep}
                onStepClick={(step) => setCurrentStep(step)}
                canGoToStep2={canGoToStep2}
                canGoToStep3={canGoToStep3}
              />

              {/* STEP 1: MEDIA & SETUP */}
              {currentStep === 1 && (
                <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <h2 className="text-lg font-extrabold text-white font-heading tracking-tight">
                        1. Media Uploads & Format Setup
                      </h2>
                      <p className="text-xs text-slate-400">
                        Upload your voiceover .srt subtitles, storyboard image
                        batch, optional background audio, and video resolution.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <SrtUploader srtData={srtData} onSrtLoaded={setSrtData} />
                    <AudioUploader
                      audioBuffer={audioBuffer}
                      audioFileName={audioFileName}
                      onAudioLoaded={(buf, name) => {
                        setAudioBuffer(buf);
                        setAudioFileName(name);
                      }}
                    />
                  </div>

                  <ImagesUploader
                    srtData={srtData}
                    loadedImages={loadedImages}
                    onImagesLoaded={setLoadedImages}
                  />

                  <VideoSettingsCard
                    settings={settings}
                    onChange={handleSettingsChange}
                  />

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-[#10121a]/80 backdrop-blur-md shadow-xl mt-2">
                    <div className="flex items-center gap-2 text-xs">
                      {canGoToStep2 ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>
                            Ready: {srtData?.cues.length} subtitle cues and{" "}
                            {loadedImages.length} images loaded
                          </span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <span>
                            {!hasSrt && !hasImages
                              ? "Please upload a .srt subtitle file and storyboard images to continue"
                              : !hasSrt
                                ? "Please upload a .srt subtitle file to continue"
                                : "Please upload your storyboard images to continue"}
                          </span>
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={!canGoToStep2}
                      onClick={() => setCurrentStep(2)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs font-heading shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <span>Continue to Step 2: Animations & SFX</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: ANIMATIONS & SFX */}
              {currentStep === 2 && (
                <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <h2 className="text-lg font-extrabold text-white font-heading tracking-tight">
                        2. Transition Animations & Sound Effects
                      </h2>
                      <p className="text-xs text-slate-400">
                        Choose transition motion effects and toggle sound fx to
                        play automatically on slide changes.
                      </p>
                    </div>
                  </div>

                  <StudioAnimationsSfx
                    settings={settings}
                    onChange={handleSettingsChange}
                    onOpenPreview={handleOpenPreview}
                  />

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-[#10121a]/80 backdrop-blur-md shadow-xl mt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold font-heading transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Step 1: Media</span>
                    </button>

                    <button
                      type="button"
                      disabled={!canGoToStep3}
                      onClick={() => setCurrentStep(3)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs font-heading shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <span>Continue to Step 3: Video Generation</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: SUMMARY & GENERATION */}
              {currentStep === 3 && (
                <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <h2 className="text-lg font-extrabold text-white font-heading tracking-tight">
                        3. Review & Hardware Video Generation
                      </h2>
                      <p className="text-xs text-slate-400">
                        Review your project parameters and start GPU-accelerated
                        video rendering.
                      </p>
                    </div>
                  </div>

                  <ProjectSummaryCard
                    srtData={srtData}
                    audioBuffer={audioBuffer}
                    audioFileName={audioFileName}
                    loadedImagesCount={loadedImages.length}
                    settings={settings}
                    onEditStep={(step) => setCurrentStep(step)}
                  />

                  <RenderProgressCard
                    isRendering={isRendering}
                    canGenerate={canGenerate}
                    progress={progress}
                    onGenerate={handleGenerate}
                    onCancel={cancel}
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
                      onClick={() => setCurrentStep(2)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold font-heading transition-all cursor-pointer disabled:opacity-40"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Animations & SFX</span>
                    </button>

                    <button
                      type="button"
                      disabled={isRendering}
                      onClick={handleReset}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/20 text-rose-300 hover:bg-rose-500/10 text-xs font-semibold font-heading transition-all cursor-pointer disabled:opacity-40"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Start New Project</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <footer className="text-center text-slate-500 text-xs py-4 mt-auto border-t border-white/5">
            Dollar Doodles Studio Suite • Hardware WebCodecs Video & SRT Batch
            Tools • Next.js & MongoDB
          </footer>
        </main>
      </div>

      {/* Animation Live Preview Modal */}
      {previewModalOpen && (
        <AnimPreviewModal
          initialAnimId={previewAnimId}
          loadedImages={loadedImages}
          selectedAnims={settings.selectedAnims}
          onToggleAnim={handleToggleAnim}
          onClose={() => setPreviewModalOpen(false)}
        />
      )}

      {/* Projects History Modal */}
      {projectsModalOpen && (
        <ProjectsHistoryModal
          onClose={() => setProjectsModalOpen(false)}
          onLoadProjectSettings={handleSettingsChange}
        />
      )}
    </div>
  );
}

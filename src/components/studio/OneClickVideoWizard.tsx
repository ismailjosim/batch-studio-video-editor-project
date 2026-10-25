"use client";

import {
  ArrowRight,
  CheckCircle2,
  Film,
  Loader2,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { SRTData } from "@/lib/video-generator/types";

interface GeneratedScene {
  id: number;
  text: string;
  visualPrompt: string;
  durationSec: number;
  imageUrl: string;
}

interface OneClickVideoWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyProject: (params: {
    srtData: SRTData;
    audioBuffer: AudioBuffer | null;
    audioFileName: string;
    loadedImages: HTMLImageElement[];
    cueAssetMap: Record<number, number>;
  }) => void;
}

export function OneClickVideoWizard({
  isOpen,
  onClose,
  onApplyProject,
}: OneClickVideoWizardProps) {
  const [topic, setTopic] = useState("");
  const [targetDuration, setTargetDuration] = useState<30 | 60>(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [generatedScenes, setGeneratedScenes] = useState<
    GeneratedScene[] | null
  >(null);
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [generatedAudioBlob, setGeneratedAudioBlob] = useState<Blob | null>(
    null,
  );
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const sampleTopics = [
    "5 Psychological Tricks to Improve Focus",
    "Why 99% of Startups Fail in Year One",
    "The Secret Science of Muscle Hypertrophy",
    "How the Human Eye Perceives Color",
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.warning("Please enter a video topic");
      return;
    }

    setIsGenerating(true);
    setGeneratedScenes(null);
    setCurrentStep(1); // Script generation

    try {
      // 1. Script Generation
      const scriptRes = await fetch("/api/script-to-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          durationSec: targetDuration,
        }),
      });

      const scriptData = await scriptRes.json();
      if (!scriptRes.ok) {
        throw new Error(scriptData.error || "Failed to generate script");
      }

      setGeneratedTitle(scriptData.title);
      setGeneratedScenes(scriptData.scenes);
      setCurrentStep(2); // Neural Voiceover

      // 2. Synthesize Voice Audio
      let audioBlobData: Blob | null = null;
      try {
        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: scriptData.fullScript,
            lang: "en",
          }),
        });

        if (ttsRes.ok) {
          audioBlobData = await ttsRes.blob();
          setGeneratedAudioBlob(audioBlobData);
          if (audioUrl) URL.revokeObjectURL(audioUrl);
          setAudioUrl(URL.createObjectURL(audioBlobData));
        }
      } catch (ttsErr) {
        console.warn("TTS synthesis warning:", ttsErr);
      }

      setCurrentStep(3); // Storyboard visuals
      await new Promise((r) => setTimeout(r, 600));

      setCurrentStep(4); // Ready
      toast.success("Complete AI Video project generated successfully!");
    } catch (err: unknown) {
      console.error("1-click wizard error:", err);
      toast.error((err as Error).message || "Generation pipeline failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLaunchStudio = async () => {
    if (!generatedScenes?.length) return;

    toast.loading("Preparing assets for 2K Video Generator...", {
      id: "launch-wizard",
    });

    try {
      // 1. Convert scenes to Subtitle Cues (SRTData)
      let currentTimeSec = 0;
      const cues = generatedScenes.map((scene, idx) => {
        const startMs = Math.round(currentTimeSec * 1000);
        const endMs = Math.round((currentTimeSec + scene.durationSec) * 1000);
        currentTimeSec += scene.durationSec;
        return {
          id: idx + 1,
          startMs,
          endMs,
          text: scene.text,
        };
      });

      const srtData: SRTData = {
        fileName: `${generatedTitle.replace(/[^a-zA-Z0-9_-]/g, "_") || "ai_video"}.srt`,
        cues,
      };

      // 2. Load images into HTMLImageElements
      const imagePromises = generatedScenes.map((scene) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Image failed to load"));
          img.src = scene.imageUrl;
        });
      });

      const loadedImages = await Promise.all(imagePromises);

      // 3. Map cues 1:1 to their corresponding generated images
      const cueAssetMap: Record<number, number> = {};
      for (let i = 0; i < cues.length; i++) {
        cueAssetMap[i] = i % loadedImages.length;
      }

      // 4. Decode audio buffer if blob exists
      let audioBuffer: AudioBuffer | null = null;
      if (generatedAudioBlob) {
        try {
          const arrayBuf = await generatedAudioBlob.arrayBuffer();
          const audioCtx = new (
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext
          )();
          audioBuffer = await audioCtx.decodeAudioData(arrayBuf);
          audioCtx.close().catch(() => {});
        } catch (audioErr) {
          console.warn("AudioBuffer decode failed:", audioErr);
        }
      }

      onApplyProject({
        srtData,
        audioBuffer,
        audioFileName: "ai_voiceover.mp3",
        loadedImages,
        cueAssetMap,
      });

      toast.success("Loaded AI project into 2K Video Generator!", {
        id: "launch-wizard",
      });
      onClose();
    } catch (err) {
      console.error("Launch error:", err);
      toast.error("Failed to load project into studio", {
        id: "launch-wizard",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl flex flex-col max-h-[90vh] bg-[#0c0e16] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#101320]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-400 via-pink-500 to-orange-500 text-black flex items-center justify-center font-bold shadow-lg shadow-cyan-500/20">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white font-heading">
                  1-Click AI Video Generator
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-bold">
                  Topic → Script → Voice → 2K Video
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically generate script, synchronized voiceover narration,
                and scene visuals in one click
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {!generatedScenes && (
            <div className="flex flex-col gap-4">
              {/* Topic Input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-300">
                  What should this video be about?
                </label>
                <textarea
                  rows={3}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. 5 Psychological Tricks to Improve Focus, or The Dark Secrets of the Mariana Trench..."
                  className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none leading-relaxed"
                />
              </div>

              {/* Sample Topics */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400">
                  Quick Ideas:
                </span>
                <div className="flex flex-wrap gap-2">
                  {sampleTopics.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTopic(t)}
                      className="px-2.5 py-1 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 hover:border-cyan-500/30 text-[11px] text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Options */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-300">
                  Target Length & Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTargetDuration(30)}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      targetDuration === 30
                        ? "bg-cyan-500/15 border-cyan-500 text-white shadow-lg shadow-cyan-500/10"
                        : "bg-[#131622] border-white/5 text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    <span className="text-xs font-bold text-white">
                      30-Second Viral Short
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Optimized for TikTok, Reels, and Shorts (4 scenes)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetDuration(60)}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      targetDuration === 60
                        ? "bg-cyan-500/15 border-cyan-500 text-white shadow-lg shadow-cyan-500/10"
                        : "bg-[#131622] border-white/5 text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    <span className="text-xs font-bold text-white">
                      60-Second Deep Dive
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Extended explainer with full narrative arc (6 scenes)
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Progress Steps during generation */}
          {isGenerating && (
            <div className="p-6 rounded-3xl bg-[#131622] border border-white/10 flex flex-col gap-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Automated AI Generation Pipeline:
              </span>

              <div className="flex flex-col gap-3">
                {[
                  { step: 1, label: "Drafting Viral Script with Gemini Pro" },
                  {
                    step: 2,
                    label: "Synthesizing Neural Voiceover Narration",
                  },
                  { step: 3, label: "Generating Scene Visual Illustrations" },
                  { step: 4, label: "Aligning Subtitle Timings & Audio Muxer" },
                ].map((s) => {
                  const isDone = currentStep > s.step;
                  const isCurrent = currentStep === s.step;
                  return (
                    <div
                      key={s.step}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-xs transition-all ${
                        isDone
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : isCurrent
                            ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                            : "bg-white/2 border-white/5 text-slate-500"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
                      )}
                      <span className="font-semibold">{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Generated Result Preview */}
          {generatedScenes && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-heading">
                    {generatedTitle}
                  </h3>
                  <span className="text-[11px] text-cyan-400 font-mono">
                    {generatedScenes.length} scenes generated · ~
                    {targetDuration}s
                  </span>
                </div>

                {audioUrl && (
                  <audio
                    src={audioUrl}
                    controls
                    className="h-8 max-w-[200px]"
                  />
                )}
              </div>

              {/* Scene Grid Preview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
                {generatedScenes.map((scene) => (
                  <div
                    key={scene.id}
                    className="flex flex-col rounded-2xl border border-white/10 bg-[#131622] overflow-hidden"
                  >
                    <div className="aspect-video bg-black/60 relative overflow-hidden">
                      <img
                        src={scene.imageUrl}
                        alt={scene.visualPrompt}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1 py-0.2 rounded bg-black/70 text-cyan-400 font-bold">
                        {scene.durationSec}s
                      </span>
                    </div>
                    <div className="p-2.5 text-[11px] text-slate-300 line-clamp-3">
                      {scene.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-white/10 bg-[#101320]">
          <span className="text-[11px] text-slate-400 font-mono">
            {generatedScenes
              ? "Ready for 2K client-side GPU rendering"
              : "Zero server cost • WebCodecs hardware accelerated"}
          </span>

          <div className="flex items-center gap-2.5">
            {generatedScenes ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setGeneratedScenes(null);
                    setCurrentStep(0);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  Regenerate
                </button>

                <button
                  type="button"
                  onClick={handleLaunchStudio}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-cyan-400 via-sky-400 to-blue-500 hover:brightness-110 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                >
                  <Film className="w-4 h-4" />
                  <span>Launch in 2K Video Editor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-cyan-400 via-pink-500 to-orange-500 hover:brightness-110 text-black font-black text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Video Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>Generate AI Video</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  ChevronLeft,
  ChevronRight,
  Film,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ANIMATIONS_LIST } from "@/lib/video-generator/transitions";
import { useAnimPreviewCanvas } from "./anim-preview/useAnimPreviewCanvas";

interface AnimPreviewModalProps {
  initialAnimId: string;
  loadedImages: HTMLImageElement[];
  selectedAnims: Set<string>;
  onToggleAnim: (id: string, enabled: boolean) => void;
  onClose: () => void;
}

export function AnimPreviewModal({
  initialAnimId,
  loadedImages,
  selectedAnims,
  onToggleAnim,
  onClose,
}: AnimPreviewModalProps) {
  const [currentAnimId, setCurrentAnimId] = useState(initialAnimId || "push");

  const {
    canvasRef,
    isPlaying,
    setIsPlaying,
    isSfxEnabled,
    setIsSfxEnabled,
    badgeText,
    progressWidth,
    handleReplay,
  } = useAnimPreviewCanvas({
    currentAnimId,
    loadedImages,
  });

  const currentIndex = ANIMATIONS_LIST.findIndex((a) => a.id === currentAnimId);
  const currentAnim = ANIMATIONS_LIST[currentIndex] || ANIMATIONS_LIST[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handlePrev = () => {
    const prevIdx =
      (currentIndex - 1 + ANIMATIONS_LIST.length) % ANIMATIONS_LIST.length;
    setCurrentAnimId(ANIMATIONS_LIST[prevIdx].id);
    handleReplay();
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % ANIMATIONS_LIST.length;
    setCurrentAnimId(ANIMATIONS_LIST[nextIdx].id);
    handleReplay();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-[#121218] shadow-2xl overflow-hidden flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/3">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-cyan-400">
              <Film className="w-6 h-6" />
            </span>
            <div>
              <div className="text-base font-bold text-white">
                {currentIndex + 1}. {currentAnim.name}
              </div>
              <div className="text-xs text-slate-400">{currentAnim.desc}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedAnims.has(currentAnimId)}
                onChange={(e) => onToggleAnim(currentAnimId, e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-300">
                Enable in Video
              </span>
            </label>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Canvas Display */}
        <div className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            className="w-full h-full object-contain block"
          />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div
              className="h-full bg-linear-to-r from-cyan-500 to-cyan-300 transition-all duration-75"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
          <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 bg-black/80 backdrop-blur-md border border-white/15 px-3 py-1 rounded-md text-xs font-semibold text-white shadow-md pointer-events-none">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{badgeText}</span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2.5 px-4 py-3 border-b border-white/10 bg-black/30">
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleReplay}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/15 text-slate-200 hover:border-cyan-500 hover:text-cyan-400 text-xs font-semibold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/15 text-slate-200 hover:border-cyan-500 hover:text-cyan-400 text-xs font-semibold transition-all cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </button>
            <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer ml-1">
              <input
                type="checkbox"
                checked={isSfxEnabled}
                onChange={(e) => setIsSfxEnabled(e.target.checked)}
                className="w-3.5 h-3.5 accent-pink-500 rounded cursor-pointer"
              />
              <Volume2 className="w-3.5 h-3.5 text-pink-400" />
              <span>Sound Effect</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              title="Previous Transition"
              className="p-1 rounded-full border border-white/15 text-slate-300 hover:border-cyan-500 hover:text-cyan-400 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-400 min-w-12 text-center">
              {currentIndex + 1} / {ANIMATIONS_LIST.length}
            </span>
            <button
              type="button"
              onClick={handleNext}
              title="Next Transition"
              className="p-1 rounded-full border border-white/15 text-slate-300 hover:border-cyan-500 hover:text-cyan-400 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pill Tabs for All 10 transitions */}
        <div className="flex gap-1.5 p-3 overflow-x-auto bg-black/50 scrollbar-none">
          {ANIMATIONS_LIST.map((anim, idx) => (
            <button
              key={anim.id}
              type="button"
              onClick={() => {
                setCurrentAnimId(anim.id);
                handleReplay();
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                anim.id === currentAnimId
                  ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {idx + 1}. {anim.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

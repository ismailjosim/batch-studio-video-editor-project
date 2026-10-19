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
import { useCallback, useEffect, useRef, useState } from "react";
import { playSfxPreview } from "@/lib/video-generator/sfx-loader";
import {
  ANIMATIONS_LIST,
  createDemoSlide,
  drawFitImage,
  renderTransition,
} from "@/lib/video-generator/transitions";

interface AnimPreviewModalProps {
  initialAnimId: string;
  loadedImages: HTMLImageElement[];
  selectedAnims: Set<string>;
  onToggleAnim: (id: string, enabled: boolean) => void;
  onClose: () => void;
}

const SFX_MAP: Record<string, string> = {
  push: "whoosh",
  fade: "page_turn",
  slide_in: "arrow_whoosh",
  wipe: "page_forward",
  zoom: "small_glitch",
  pan: "air_woosh",
  cover: "paper",
  split: "select_click",
  iris: "interface_click",
  morph: "modern_tech",
};

export function AnimPreviewModal({
  initialAnimId,
  loadedImages,
  selectedAnims,
  onToggleAnim,
  onClose,
}: AnimPreviewModalProps) {
  const [currentAnimId, setCurrentAnimId] = useState(initialAnimId || "push");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);
  const [badgeText, setBadgeText] = useState("Slide 1 (Incoming)");
  const [progressWidth, setProgressWidth] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const sfxPlayedRef = useRef(false);
  const isPlayingRef = useRef(isPlaying);
  const currentAnimIdRef = useRef(currentAnimId);
  const isSfxEnabledRef = useRef(isSfxEnabled);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    currentAnimIdRef.current = currentAnimId;
  }, [currentAnimId]);

  useEffect(() => {
    isSfxEnabledRef.current = isSfxEnabled;
  }, [isSfxEnabled]);

  const currentIndex = ANIMATIONS_LIST.findIndex((a) => a.id === currentAnimId);
  const currentAnim = ANIMATIONS_LIST[currentIndex] || ANIMATIONS_LIST[0];

  const getPreviewSlides = useCallback(() => {
    let imgA: HTMLImageElement | HTMLCanvasElement;
    let imgB: HTMLImageElement | HTMLCanvasElement;

    if (loadedImages && loadedImages.length >= 2) {
      imgA = loadedImages[0];
      imgB = loadedImages[1];
    } else if (loadedImages && loadedImages.length === 1) {
      imgA = loadedImages[0];
      imgB = createDemoSlide(
        2,
        "ANSWER TO NO ONE",
        "Live Storyboard Simulation (Slide B)",
        "#162b20",
        "#3DAA72",
      );
    } else {
      imgA = createDemoSlide(
        1,
        "DOLLAR DOODLES",
        "Live Storyboard Simulation (Slide A)",
        "#14182b",
        "#3A86FF",
      );
      imgB = createDemoSlide(
        2,
        "ANSWER TO NO ONE",
        "Live Storyboard Simulation (Slide B)",
        "#162b20",
        "#3DAA72",
      );
    }
    return { imgA, imgB };
  }, [loadedImages]);

  const loop = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = (timestamp - startTimeRef.current) / 1000;
      const cycleDuration = 2.4;
      const cycleTime = elapsed % cycleDuration;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const aspectW = canvas.width;
      const aspectH = canvas.height;

      ctx.fillStyle = "#0c0c10";
      ctx.fillRect(0, 0, aspectW, aspectH);

      const transStart = 0.5;
      const transDuration = 0.9;
      const transEnd = transStart + transDuration;

      const { imgA, imgB } = getPreviewSlides();

      if (cycleTime < transStart) {
        const drift = cycleTime / transStart;
        drawFitImage(ctx, imgA, aspectW, aspectH, 1.0 + 0.02 * drift, 0, 0);
        setBadgeText("Slide 1 (Incoming)");
        setProgressWidth(0);
        sfxPlayedRef.current = false;
      } else if (cycleTime < transEnd) {
        const p = (cycleTime - transStart) / transDuration;
        renderTransition(
          ctx,
          currentAnimIdRef.current,
          imgA,
          imgB,
          p,
          aspectW,
          aspectH,
        );
        const percent = Math.round(p * 100);
        setBadgeText(`Playing Transition (${percent}%)`);
        setProgressWidth(percent);

        if (!sfxPlayedRef.current && isSfxEnabledRef.current) {
          sfxPlayedRef.current = true;
          const sfxId = SFX_MAP[currentAnimIdRef.current] || "whoosh";
          playSfxPreview(sfxId);
        }
      } else {
        const drift = (cycleTime - transEnd) / (cycleDuration - transEnd);
        drawFitImage(ctx, imgB, aspectW, aspectH, 1.0 + 0.02 * drift, 0, 0);
        setBadgeText("Slide 2 (Complete)");
        setProgressWidth(100);
      }

      if (isPlayingRef.current) {
        animFrameIdRef.current = requestAnimationFrame(loop);
      }
    },
    [getPreviewSlides],
  );

  useEffect(() => {
    startTimeRef.current = performance.now();
    sfxPlayedRef.current = false;
    if (isPlaying) {
      animFrameIdRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, loop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleReplay = () => {
    startTimeRef.current = performance.now();
    sfxPlayedRef.current = false;
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    const prevIdx =
      (currentIndex - 1 + ANIMATIONS_LIST.length) % ANIMATIONS_LIST.length;
    setCurrentAnimId(ANIMATIONS_LIST[prevIdx].id);
    startTimeRef.current = performance.now();
    sfxPlayedRef.current = false;
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % ANIMATIONS_LIST.length;
    setCurrentAnimId(ANIMATIONS_LIST[nextIdx].id);
    startTimeRef.current = performance.now();
    sfxPlayedRef.current = false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-[#121218] shadow-2xl overflow-hidden flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/3">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-emerald-400">
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
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-300">
                Enable in Video
              </span>
            </label>
            <button
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
              className="h-full bg-linear-to-r from-emerald-500 to-emerald-300 transition-all duration-75"
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
              onClick={handleReplay}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/15 text-slate-200 hover:border-emerald-500 hover:text-emerald-400 text-xs font-semibold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/15 text-slate-200 hover:border-emerald-500 hover:text-emerald-400 text-xs font-semibold transition-all cursor-pointer"
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
                className="w-3.5 h-3.5 accent-emerald-500 rounded cursor-pointer"
              />
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sound Effect</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              title="Previous Transition"
              className="p-1 rounded-full border border-white/15 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-400 min-w-12 text-center">
              {currentIndex + 1} / {ANIMATIONS_LIST.length}
            </span>
            <button
              onClick={handleNext}
              title="Next Transition"
              className="p-1 rounded-full border border-white/15 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-all cursor-pointer"
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
              onClick={() => {
                setCurrentAnimId(anim.id);
                startTimeRef.current = performance.now();
                sfxPlayedRef.current = false;
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                anim.id === currentAnimId
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm"
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

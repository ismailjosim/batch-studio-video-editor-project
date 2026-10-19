"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playSfxPreview } from "@/lib/video-generator/sfx-loader";
import {
  createDemoSlide,
  drawFitImage,
  renderTransition,
} from "@/lib/video-generator/transitions";

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

interface UseAnimPreviewCanvasOptions {
  currentAnimId: string;
  loadedImages: HTMLImageElement[];
}

export function useAnimPreviewCanvas({
  currentAnimId,
  loadedImages,
}: UseAnimPreviewCanvasOptions) {
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

  const handleReplay = () => {
    startTimeRef.current = performance.now();
    sfxPlayedRef.current = false;
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  return {
    canvasRef,
    isPlaying,
    setIsPlaying,
    isSfxEnabled,
    setIsSfxEnabled,
    badgeText,
    progressWidth,
    handleReplay,
  };
}

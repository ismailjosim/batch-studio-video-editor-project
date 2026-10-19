"use client";

import { useEffect, useRef, useState } from "react";

interface UseTimelineScrollOptions {
  isPlaying: boolean;
  isAutoScrollEnabled: boolean;
  playheadPx: number;
  isDragging?: boolean;
}

export function useTimelineScroll({
  isPlaying,
  isAutoScrollEnabled,
  playheadPx,
  isDragging = false,
}: UseTimelineScrollOptions) {
  const shellRef = useRef<HTMLDivElement | null>(null);

  const [scrollState, setScrollState] = useState({
    scrollLeft: 0,
    visibleWidth: 1200,
  });

  const scrollRafRef = useRef<number | null>(null);
  const lastAutoScrollTimeRef = useRef<number>(0);
  const isAutoScrollingRef = useRef<boolean>(false);

  // Update visible width on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (shellRef.current) {
        setScrollState({
          scrollLeft: shellRef.current.scrollLeft,
          visibleWidth: shellRef.current.clientWidth || 1200,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Throttled scroll handler using requestAnimationFrame
  const handleScroll = () => {
    if (scrollRafRef.current !== null) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      if (shellRef.current) {
        setScrollState({
          scrollLeft: shellRef.current.scrollLeft,
          visibleWidth: shellRef.current.clientWidth || 1200,
        });
      }
    });
  };

  // Follow Playhead Auto-Scroll
  useEffect(() => {
    if (!isPlaying || !isAutoScrollEnabled) return;
    const shell = shellRef.current;
    if (!shell || isDragging) return;

    const now = performance.now();
    if (
      now - lastAutoScrollTimeRef.current < 900 ||
      isAutoScrollingRef.current
    ) {
      return;
    }

    const { scrollLeft, clientWidth } = shell;
    const visibleRight = scrollLeft + clientWidth;
    const visibleLeft = scrollLeft;

    // Trigger when playhead approaches the right edge (within 60px)
    if (playheadPx >= visibleRight - 60 || playheadPx < visibleLeft) {
      lastAutoScrollTimeRef.current = now;
      isAutoScrollingRef.current = true;
      const targetLeft = Math.max(0, playheadPx - clientWidth * 0.15);
      shell.scrollTo({ left: targetLeft, behavior: "smooth" });
      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 700);
    }
  }, [isPlaying, isAutoScrollEnabled, playheadPx, isDragging]);

  return {
    shellRef,
    scrollState,
    handleScroll,
  };
}

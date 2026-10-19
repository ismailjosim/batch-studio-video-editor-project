"use client";

import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import type { SubtitleCue } from "../subtitle-sync-types";

const MIN_CUE_MS = 250;
const SNAP_THRESHOLD_MS = 140;

interface UseTimelineResizeProps {
  cues: SubtitleCue[];
  safeDuration: number;
  timelineWidth: number;
  currentTime: number;
  onUpdateCueTiming: (
    id: number,
    startMs: number,
    endMs: number,
    saveHistory?: boolean,
  ) => void;
}

export function useTimelineResize({
  cues,
  safeDuration,
  timelineWidth,
  currentTime,
  onUpdateCueTiming,
}: UseTimelineResizeProps) {
  const dragRef = useRef<{
    isDragging: boolean;
    cueId: number;
    edge: "start" | "end";
    startX: number;
    originalStartMs: number;
    originalEndMs: number;
    minStartMs: number;
    maxEndMs: number;
    pixelsPerMs: number;
  } | null>(null);

  const [activeDragCue, setActiveDragCue] = useState<{
    id: number;
    edge: "start" | "end";
    tempStartMs: number;
    tempEndMs: number;
  } | null>(null);

  // Snapping to current playhead
  const applyPlayheadSnapping = useCallback(
    (timeMs: number): number => {
      const playheadMs = currentTime * 1000;
      if (Math.abs(timeMs - playheadMs) <= SNAP_THRESHOLD_MS) {
        return playheadMs;
      }
      return timeMs;
    },
    [currentTime],
  );

  const handlePointerDownResize = (
    e: ReactPointerEvent,
    cue: SubtitleCue,
    edge: "start" | "end",
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore pointer capture error
    }

    const currentIdx = cues.findIndex((c) => c.id === cue.id);
    const prevCue = currentIdx > 0 ? cues[currentIdx - 1] : null;
    const nextCue = currentIdx < cues.length - 1 ? cues[currentIdx + 1] : null;

    const minStartMs = prevCue ? prevCue.endMs : 0;
    const maxEndMs = nextCue ? nextCue.startMs : safeDuration * 1000;
    const pixelsPerMs = timelineWidth / (safeDuration * 1000);

    dragRef.current = {
      isDragging: true,
      cueId: cue.id,
      edge,
      startX: e.clientX,
      originalStartMs: cue.startMs,
      originalEndMs: cue.endMs,
      minStartMs,
      maxEndMs,
      pixelsPerMs,
    };

    setActiveDragCue({
      id: cue.id,
      edge,
      tempStartMs: cue.startMs,
      tempEndMs: cue.endMs,
    });
  };

  const handlePointerMoveResize = (e: ReactPointerEvent) => {
    if (!dragRef.current || !dragRef.current.isDragging) return;

    const {
      cueId,
      edge,
      startX,
      originalStartMs,
      originalEndMs,
      minStartMs,
      maxEndMs,
      pixelsPerMs,
    } = dragRef.current;

    const deltaX = e.clientX - startX;
    const deltaMs = deltaX / pixelsPerMs;

    let newStart = originalStartMs;
    let newEnd = originalEndMs;

    if (edge === "start") {
      const maxAllowedStart = originalEndMs - MIN_CUE_MS;
      newStart = applyPlayheadSnapping(originalStartMs + deltaMs);
      newStart = Math.max(minStartMs, Math.min(maxAllowedStart, newStart));
    } else {
      const minAllowedEnd = originalStartMs + MIN_CUE_MS;
      newEnd = applyPlayheadSnapping(originalEndMs + deltaMs);
      newEnd = Math.min(maxEndMs, Math.max(minAllowedEnd, newEnd));
    }

    setActiveDragCue({
      id: cueId,
      edge,
      tempStartMs: Math.round(newStart),
      tempEndMs: Math.round(newEnd),
    });
  };

  const handlePointerUpResize = (e: ReactPointerEvent) => {
    if (!dragRef.current || !dragRef.current.isDragging) return;

    const { cueId } = dragRef.current;
    if (activeDragCue && activeDragCue.id === cueId) {
      onUpdateCueTiming(
        cueId,
        activeDragCue.tempStartMs,
        activeDragCue.tempEndMs,
        true,
      );
    }

    dragRef.current = null;
    setActiveDragCue(null);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore pointer capture error
    }
  };

  return {
    dragRef,
    activeDragCue,
    handlePointerDownResize,
    handlePointerMoveResize,
    handlePointerUpResize,
  };
}

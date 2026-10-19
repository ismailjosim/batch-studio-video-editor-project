"use client";

import { useMemo } from "react";
import { TimelineCueBlock } from "./components/TimelineCueBlock";
import { TimelinePlayhead } from "./components/TimelinePlayhead";
import { TimelineRuler } from "./components/TimelineRuler";
import { useTimelineResize } from "./hooks/useTimelineResize";
import { useTimelineScroll } from "./hooks/useTimelineScroll";
import type { SubtitleCue } from "./subtitle-sync-types";
import { formatDisplayTime } from "./subtitle-sync-utils";
import { WaveformCanvasTrack } from "./WaveformCanvasTrack";

interface SubtitleTimelineProps {
  cues: SubtitleCue[];
  selectedId: number | null;
  duration: number; // in seconds
  currentTime: number; // in seconds
  zoom: number; // percentage (e.g. 100, 190, 300, 500)
  waveformPeaks: number[];
  isPlaying?: boolean;
  isAutoScrollEnabled?: boolean;
  onSelectCue: (id: number | null) => void;
  onUpdateCueTiming: (
    id: number,
    startMs: number,
    endMs: number,
    saveHistory?: boolean,
  ) => void;
  onSeek: (timeInSeconds: number) => void;
}

export function SubtitleTimeline({
  cues,
  selectedId,
  duration,
  currentTime,
  zoom,
  waveformPeaks,
  isPlaying = false,
  isAutoScrollEnabled = true,
  onSelectCue,
  onUpdateCueTiming,
  onSeek,
}: SubtitleTimelineProps) {
  const safeDuration = Math.max(1, duration);

  // Timeline display width based on zoom level and duration
  const basePxPerSec = 35;
  const zoomMultiplier = zoom / 100;
  const pixelsPerSecond = basePxPerSec * zoomMultiplier;
  const timelineWidth = Math.max(
    1000,
    Math.round(safeDuration * pixelsPerSecond),
  );

  // Playhead Position in Pixels
  const playheadPercent = Math.min(1, Math.max(0, currentTime / safeDuration));
  const playheadPx = playheadPercent * timelineWidth;

  // Drag-resizing cue edge hook
  const {
    dragRef,
    activeDragCue,
    handlePointerDownResize,
    handlePointerMoveResize,
    handlePointerUpResize,
  } = useTimelineResize({
    cues,
    safeDuration,
    timelineWidth,
    currentTime,
    onUpdateCueTiming,
  });

  // Viewport scroll & auto-scroll hook
  const { shellRef, scrollState, handleScroll } = useTimelineScroll({
    isPlaying,
    isAutoScrollEnabled,
    playheadPx,
    isDragging: Boolean(dragRef.current?.isDragging),
  });

  // Generate dynamic Ruler Ticks cleanly spaced at any zoom level
  const rulerTicks = useMemo(() => {
    const targetIntervalSec = 140 / Math.max(1, pixelsPerSecond);
    const intervals = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600];
    let stepSec = 1;
    for (const item of intervals) {
      if (item >= targetIntervalSec) {
        stepSec = item;
        break;
      }
    }

    const bufferPx = 300;
    const minTimeSec = Math.max(
      0,
      ((scrollState.scrollLeft - bufferPx) / timelineWidth) * safeDuration,
    );
    const maxTimeSec = Math.min(
      safeDuration,
      ((scrollState.scrollLeft + scrollState.visibleWidth + bufferPx) /
        timelineWidth) *
        safeDuration,
    );

    const startSec = Math.floor(minTimeSec / stepSec) * stepSec;
    const ticks: { timeSec: number; label: string }[] = [];
    for (let sec = startSec; sec <= maxTimeSec; sec += stepSec) {
      ticks.push({
        timeSec: sec,
        label: formatDisplayTime(sec, false, false),
      });
    }
    return ticks;
  }, [
    pixelsPerSecond,
    scrollState.scrollLeft,
    scrollState.visibleWidth,
    timelineWidth,
    safeDuration,
  ]);

  // Virtualized Cues: only render cues that intersect with visible viewport + buffer
  const visibleCues = useMemo(() => {
    const bufferPx = 800;
    const minX = Math.max(0, scrollState.scrollLeft - bufferPx);
    const maxX = scrollState.scrollLeft + scrollState.visibleWidth + bufferPx;

    return cues.filter((cue) => {
      const isBeingDragged = activeDragCue && activeDragCue.id === cue.id;
      const startMs = isBeingDragged ? activeDragCue.tempStartMs : cue.startMs;
      const endMs = isBeingDragged ? activeDragCue.tempEndMs : cue.endMs;
      const leftPx = (startMs / (safeDuration * 1000)) * timelineWidth;
      const widthPx = Math.max(
        24,
        ((endMs - startMs) / (safeDuration * 1000)) * timelineWidth,
      );
      const rightPx = leftPx + widthPx;
      return rightPx >= minX && leftPx <= maxX;
    });
  }, [
    cues,
    activeDragCue,
    safeDuration,
    timelineWidth,
    scrollState.scrollLeft,
    scrollState.visibleWidth,
  ]);

  return (
    <div className="flex flex-col w-full max-w-full min-w-0 bg-[#0e1018]/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Scrollable Timeline Shell */}
      <div
        ref={shellRef}
        onScroll={handleScroll}
        className="relative w-full max-w-full overflow-x-auto overflow-y-hidden select-none scrollbar-thin scrollbar-thumb-cyan-500/25 scrollbar-track-black/40 scroll-smooth"
        style={{ minHeight: "284px" }}
      >
        {/* Timeline Inner Content with dynamic calculated width */}
        <div
          className="relative min-h-71"
          style={{ width: `${timelineWidth}px` }}
        >
          {/* 1. Time Ruler */}
          <TimelineRuler
            rulerTicks={rulerTicks}
            safeDuration={safeDuration}
            timelineWidth={timelineWidth}
          />

          {/* 2. Track Header: Subtitles */}
          <div className="flex items-center justify-between px-3 py-1 bg-[#10121a]/90 border-b border-white/10 text-[9px] uppercase font-bold tracking-widest text-slate-400">
            <span>SUBTITLES TRACK</span>
            <span className="text-cyan-400 font-mono font-semibold">
              {cues.length} Cues
            </span>
          </div>

          {/* 3. Subtitles Track Area */}
          <div className="relative h-28 w-full bg-[#0c0e16] border-b border-white/10 overflow-hidden">
            {cues.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-xs">
                <span className="font-semibold text-slate-400">
                  No subtitles loaded
                </span>
                <span className="text-[10px] text-slate-600 mt-0.5">
                  Load an SRT file or click "+ Add cue" to begin
                </span>
              </div>
            ) : (
              visibleCues.map((cue) => {
                const isSelected = cue.id === selectedId;
                const isBeingDragged =
                  activeDragCue && activeDragCue.id === cue.id;
                const startMs = isBeingDragged
                  ? activeDragCue.tempStartMs
                  : cue.startMs;
                const endMs = isBeingDragged
                  ? activeDragCue.tempEndMs
                  : cue.endMs;

                const leftPx =
                  (startMs / (safeDuration * 1000)) * timelineWidth;
                const widthPx = Math.max(
                  24,
                  ((endMs - startMs) / (safeDuration * 1000)) * timelineWidth,
                );

                return (
                  <TimelineCueBlock
                    key={cue.id}
                    cue={cue}
                    isSelected={isSelected}
                    leftPx={leftPx}
                    widthPx={widthPx}
                    startMs={startMs}
                    onSelectCue={onSelectCue}
                    onPointerDownResize={handlePointerDownResize}
                    onPointerMoveResize={handlePointerMoveResize}
                    onPointerUpResize={handlePointerUpResize}
                  />
                );
              })
            )}
          </div>

          {/* 4. Track Header: Audio Waveform */}
          <div className="flex items-center justify-between px-3 py-1 bg-[#10121a]/90 border-b border-white/10 text-[9px] uppercase font-bold tracking-widest text-slate-400">
            <span>AUDIO WAVEFORM (DECODED PEAKS)</span>
            <span className="text-slate-500">Click or drag to scrub</span>
          </div>

          {/* 5. Audio Waveform Track Area */}
          <WaveformCanvasTrack
            waveformPeaks={waveformPeaks}
            timelineWidth={timelineWidth}
            safeDuration={safeDuration}
            scrollLeft={scrollState.scrollLeft}
            visibleWidth={scrollState.visibleWidth}
            onSeek={onSeek}
          />

          {/* 6. Precision Needle / Playhead Indicator */}
          <TimelinePlayhead playheadPx={playheadPx} />
        </div>
      </div>
    </div>
  );
}

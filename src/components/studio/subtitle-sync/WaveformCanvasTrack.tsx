"use client";

import React, {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
} from "react";

interface WaveformCanvasTrackProps {
  waveformPeaks: number[];
  timelineWidth: number;
  safeDuration: number;
  scrollLeft: number;
  visibleWidth: number;
  onSeek: (timeInSeconds: number) => void;
}

const TILE_WIDTH = 2000; // Safe pixel width per canvas tile, far below browser 32,767px limit
const TRACK_HEIGHT = 112; // Height in pixels of waveform track

interface TileItem {
  index: number;
  leftPx: number;
  widthPx: number;
  startPeakIdx: number;
  endPeakIdx: number;
}

export function WaveformCanvasTrack({
  waveformPeaks,
  timelineWidth,
  safeDuration,
  scrollLeft,
  visibleWidth,
  onSeek,
}: WaveformCanvasTrackProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Compute all tiles needed for timeline width
  const tiles: TileItem[] = useMemo(() => {
    if (timelineWidth <= 0) return [];
    const numTiles = Math.ceil(timelineWidth / TILE_WIDTH);
    const totalPeaks = waveformPeaks.length;
    const result: TileItem[] = [];

    for (let i = 0; i < numTiles; i++) {
      const leftPx = i * TILE_WIDTH;
      const widthPx = Math.min(TILE_WIDTH, timelineWidth - leftPx);
      const startRatio = leftPx / timelineWidth;
      const endRatio = (leftPx + widthPx) / timelineWidth;

      const startPeakIdx = Math.floor(startRatio * totalPeaks);
      const endPeakIdx = Math.min(totalPeaks, Math.ceil(endRatio * totalPeaks));

      result.push({
        index: i,
        leftPx,
        widthPx,
        startPeakIdx,
        endPeakIdx,
      });
    }
    return result;
  }, [timelineWidth, waveformPeaks.length]);

  // Virtualization: filter tiles that are within visible viewport + 1 tile buffer
  const visibleTiles = useMemo(() => {
    if (tiles.length === 0) return [];
    const buffer = TILE_WIDTH;
    const viewLeft = Math.max(0, scrollLeft - buffer);
    const viewRight = scrollLeft + visibleWidth + buffer;

    return tiles.filter((tile) => {
      const tileRight = tile.leftPx + tile.widthPx;
      return tileRight >= viewLeft && tile.leftPx <= viewRight;
    });
  }, [tiles, scrollLeft, visibleWidth]);

  // Seek interaction via click or drag on the waveform track
  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    seekFromEvent(e);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      seekFromEvent(e);
    }
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore pointer release error
    }
  };

  const seekFromEvent = (e: ReactPointerEvent<HTMLDivElement>) => {
    const track = containerRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = clickX / rect.width;
    const targetSeconds = ratio * safeDuration;
    onSeek(Math.max(0, Math.min(safeDuration, targetSeconds)));
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative w-full cursor-crosshair overflow-hidden select-none bg-[#0a0b10]"
      style={{ height: `${TRACK_HEIGHT}px`, width: `${timelineWidth}px` }}
      title="Click or drag anywhere on waveform to seek"
    >
      {waveformPeaks.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-500 font-medium">
          Load audio to generate waveform
        </div>
      ) : (
        visibleTiles.map((tile) => (
          <TileCanvas
            key={tile.index}
            tile={tile}
            waveformPeaks={waveformPeaks}
            height={TRACK_HEIGHT}
          />
        ))
      )}
    </div>
  );
}

interface TileCanvasProps {
  tile: TileItem;
  waveformPeaks: number[];
  height: number;
}

const TileCanvas = React.memo(function TileCanvas({
  tile,
  waveformPeaks,
  height,
}: TileCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = tile.widthPx;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const centerY = height / 2;

    // Draw center quiet baseline in subtle emerald tint
    ctx.strokeStyle = "rgba(16, 185, 129, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    const tilePeaks = waveformPeaks.slice(tile.startPeakIdx, tile.endPeakIdx);
    const peaksCount = tilePeaks.length;
    if (peaksCount === 0) return;

    const barWidth = Math.max(1, width / peaksCount);

    // Modern studio gradient: emerald-400 to emerald-500 to teal-700
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#34d399");
    gradient.addColorStop(0.5, "#10b981");
    gradient.addColorStop(1, "#047857");
    ctx.fillStyle = gradient;

    for (let i = 0; i < peaksCount; i++) {
      const peak = tilePeaks[i];
      const barHeight = Math.max(2, peak * (height * 0.88));
      const x = i * barWidth;
      const y = centerY - barHeight / 2;
      ctx.fillRect(x, y, Math.max(1, barWidth - 0.6), barHeight);
    }
  }, [tile, waveformPeaks, height]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 bottom-0 pointer-events-none block"
      style={{
        left: `${tile.leftPx}px`,
        width: `${tile.widthPx}px`,
        height: `${height}px`,
      }}
    />
  );
});

"use client";

interface TimelinePlayheadProps {
  playheadPx: number;
}

export function TimelinePlayhead({ playheadPx }: TimelinePlayheadProps) {
  return (
    <div
      className="absolute top-0 bottom-0 w-0.5 bg-[#f6a56f] z-30 pointer-events-none shadow-[0_0_12px_rgba(246,165,111,0.8)] will-change-transform"
      style={{
        left: 0,
        transform: `translate3d(${playheadPx}px, 0, 0)`,
      }}
    >
      {/* Top Inverted Triangle Marker */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-t-[9px] border-t-[#f6a56f]" />
    </div>
  );
}

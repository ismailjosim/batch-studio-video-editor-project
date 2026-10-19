"use client";

interface TimelineRulerProps {
  rulerTicks: { timeSec: number; label: string }[];
  safeDuration: number;
  timelineWidth: number;
}

export function TimelineRuler({
  rulerTicks,
  safeDuration,
  timelineWidth,
}: TimelineRulerProps) {
  return (
    <div className="h-8 w-full bg-[#0a0b10] border-b border-white/10 flex items-center relative text-[10px] font-mono text-slate-400">
      {rulerTicks.map((tick) => {
        const tickLeft = (tick.timeSec / safeDuration) * timelineWidth;
        return (
          <div
            key={tick.timeSec}
            className="absolute top-0 bottom-0 flex flex-col justify-end pb-1 border-l border-white/10 pl-1.5 pointer-events-none"
            style={{ left: `${tickLeft}px` }}
          >
            <span>{tick.label}</span>
          </div>
        );
      })}
    </div>
  );
}

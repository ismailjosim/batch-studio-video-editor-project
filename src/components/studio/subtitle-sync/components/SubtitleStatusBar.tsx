"use client";

interface SubtitleStatusBarProps {
  statusText: string;
  zoom: number;
}

export function SubtitleStatusBar({
  statusText,
  zoom,
}: SubtitleStatusBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#0e1018]/90 border border-white/10 text-xs font-mono text-slate-400 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span>{statusText}</span>
      </div>
      <div className="flex items-center gap-3 text-[11px]">
        <span>Zoom: {zoom}%</span>
        <span>•</span>
        <span className="text-cyan-400 font-semibold">
          Web Audio API + Canvas Engine
        </span>
      </div>
    </div>
  );
}

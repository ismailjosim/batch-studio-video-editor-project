import { Loader2 } from "lucide-react";

interface SubtitleStatusBarProps {
  statusText: string;
  zoom: number;
  isAudioLoading?: boolean;
}

export function SubtitleStatusBar({
  statusText,
  zoom,
  isAudioLoading = false,
}: SubtitleStatusBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#0e1018]/90 border border-white/10 text-xs font-mono text-slate-400 shadow-lg">
      <div className="flex items-center gap-2">
        {isAudioLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        )}
        <span>
          {isAudioLoading ? "Decoding Web Audio waveform..." : statusText}
        </span>
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

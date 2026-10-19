"use client";

import { ArrowRight, Film, Radio, Subtitles } from "lucide-react";

interface TranscribeSuiteBridgesProps {
  hasResult: boolean;
  onOpenInSubtitleStudio: () => void;
  onSendToVideoGenerator: () => void;
}

export function TranscribeSuiteBridges({
  hasResult,
  onOpenInSubtitleStudio,
  onSendToVideoGenerator,
}: TranscribeSuiteBridgesProps) {
  return (
    <div className="flex flex-col gap-3 p-5 bg-[#0e1018]/90 border border-white/10 rounded-3xl shadow-xl backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <Radio className="w-4 h-4 text-violet-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
          1-Click Studio Suite Bridge
        </span>
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed">
        Pass this transcription directly into the Dollar Doodles editing
        pipeline without downloading files:
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-1">
        <button
          type="button"
          onClick={onOpenInSubtitleStudio}
          disabled={!hasResult}
          className="flex-1 flex items-center justify-between p-3 rounded-2xl border border-cyan-500/30 hover:border-cyan-400 bg-linear-to-r from-cyan-500/10 to-pink-500/10 hover:from-cyan-500/20 hover:to-pink-500/20 text-slate-100 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group shadow-sm"
          title="Directly load both audio and subtitles into Subtitle Sync Studio"
        >
          <div className="flex items-center gap-2.5">
            <Subtitles className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Open in Subtitle Studio</span>
          </div>
          <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          type="button"
          onClick={onSendToVideoGenerator}
          disabled={!hasResult}
          className="flex-1 flex items-center justify-between p-3 rounded-2xl border border-white/10 hover:border-violet-500/40 bg-[#131622]/90 hover:bg-[#181c2c] text-slate-100 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
          title="Send subtitles directly into 2K Video Generator"
        >
          <div className="flex items-center gap-2.5">
            <Film className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
            <span>Send to Video Generator</span>
          </div>
          <ArrowRight className="w-4 h-4 text-violet-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

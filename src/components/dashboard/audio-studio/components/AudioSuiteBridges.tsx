"use client";

import { ArrowRight, AudioLines, FileAudio, Film, Radio } from "lucide-react";

interface AudioSuiteBridgesProps {
  audioBlob: Blob | null;
  onSendToSubtitleStudio: () => void;
  onSendToVideoGenerator: () => void;
  onSendToTranscriber?: () => void;
}

export function AudioSuiteBridges({
  audioBlob,
  onSendToSubtitleStudio,
  onSendToVideoGenerator,
  onSendToTranscriber,
}: AudioSuiteBridgesProps) {
  return (
    <div className="flex flex-col gap-3 p-5 bg-[#0e1018]/90 border border-white/10 rounded-3xl shadow-xl backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <Radio className="w-4 h-4 text-violet-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Studio Suite Bridge
        </span>
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed">
        Export this synthesized voiceover directly across Dollar Doodles tools
        without manual downloads:
      </p>

      <div className="flex flex-col gap-2 mt-1">
        {onSendToTranscriber && (
          <button
            type="button"
            onClick={onSendToTranscriber}
            disabled={!audioBlob}
            className="flex items-center justify-between w-full p-3 rounded-2xl border border-violet-500/30 hover:border-violet-400 bg-linear-to-r from-violet-500/15 to-indigo-500/15 hover:from-violet-500/25 hover:to-indigo-500/25 text-violet-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <FileAudio className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
              <span>Transcribe to SRT (Whisper)</span>
            </div>
            <ArrowRight className="w-4 h-4 text-violet-400 group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        <button
          type="button"
          onClick={onSendToSubtitleStudio}
          disabled={!audioBlob}
          className="flex items-center justify-between w-full p-3 rounded-2xl border border-cyan-500/30 hover:border-cyan-400 bg-linear-to-r from-cyan-500/10 to-pink-500/10 hover:from-cyan-500/20 hover:to-pink-500/20 text-slate-100 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <AudioLines className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Send to Subtitle Studio</span>
          </div>
          <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          type="button"
          onClick={onSendToVideoGenerator}
          disabled={!audioBlob}
          className="flex items-center justify-between w-full p-3 rounded-2xl border border-white/10 hover:border-violet-500/40 bg-[#131622]/90 hover:bg-[#181c2c] text-slate-100 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
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

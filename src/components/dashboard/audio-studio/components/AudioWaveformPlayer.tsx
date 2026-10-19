"use client";

import { AudioLines, Download, Pause, Play } from "lucide-react";

interface AudioWaveformPlayerProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  audioBlob: Blob | null;
  audioUrl: string | null;
  isPlayingAudio: boolean;
  isSpeaking: boolean;
  onTogglePlayAudio: () => void;
}

export function AudioWaveformPlayer({
  canvasRef,
  audioBlob,
  audioUrl,
  isPlayingAudio,
  isSpeaking,
  onTogglePlayAudio,
}: AudioWaveformPlayerProps) {
  return (
    <div className="flex flex-col gap-3 p-5 bg-[#0e1018]/90 border border-white/10 rounded-3xl shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AudioLines className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Audio Output Monitor
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
          {audioBlob ? "WAV Ready" : "Standby"}
        </span>
      </div>

      {/* Waveform Canvas */}
      <div className="w-full h-24 rounded-2xl bg-[#0a0b10] border border-white/10 overflow-hidden relative flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={380}
          height={96}
          className="w-full h-full"
        />
        {!audioBlob && !isSpeaking && (
          <span className="absolute text-[11px] font-mono text-slate-600">
            Synthesize or audition to monitor wave
          </span>
        )}
      </div>

      {/* Play synthesized audio button */}
      {audioUrl && (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#131622] border border-white/10">
          <button
            type="button"
            onClick={onTogglePlayAudio}
            className="w-9 h-9 rounded-xl bg-linear-to-r from-[#00d2ff] via-[#38bdf8] to-[#0284c7] hover:brightness-110 text-black flex items-center justify-center font-bold transition-all cursor-pointer shrink-0 shadow-sm"
          >
            {isPlayingAudio ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-200 block truncate">
              ai_voiceover.wav
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              {(audioBlob?.size ? audioBlob.size / 1024 : 0).toFixed(0)} KB ·
              44.1 kHz
            </span>
          </div>
          <a
            href={audioUrl}
            download="ai_voiceover.wav"
            className="p-2 rounded-xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Download WAV"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}

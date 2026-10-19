"use client";

import { FileText, Link2, Sparkles, Wand2, Zap } from "lucide-react";

export type TranscribeFormat = "sentence_srt" | "word_srt" | "txt";
export type TranscribeEngine = "groq" | "colab";

interface TranscribeFormatSelectorProps {
  format: TranscribeFormat;
  onChangeFormat: (fmt: TranscribeFormat) => void;
  engine: TranscribeEngine;
  onChangeEngine: (eng: TranscribeEngine) => void;
  colabUrl: string;
  onChangeColabUrl: (url: string) => void;
  isTranscribing: boolean;
  canTranscribe: boolean;
  onTranscribe: () => void;
}

export function TranscribeFormatSelector({
  format,
  onChangeFormat,
  engine,
  onChangeEngine,
  colabUrl,
  onChangeColabUrl,
  isTranscribing,
  canTranscribe,
  onTranscribe,
}: TranscribeFormatSelectorProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* 1. Output Format Selection */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
          Output Format
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onChangeFormat("sentence_srt")}
            className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              format === "sentence_srt"
                ? "bg-violet-500/15 border-violet-500/60 text-violet-300 shadow-sm"
                : "bg-[#0a0b10] border-white/10 text-slate-300 hover:border-white/20"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Sentence SRT</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">
              Full sentences with natural punctuation (YouTube)
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChangeFormat("word_srt")}
            className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              format === "word_srt"
                ? "bg-violet-500/15 border-violet-500/60 text-violet-300 shadow-sm"
                : "bg-[#0a0b10] border-white/10 text-slate-300 hover:border-white/20"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Word by Word SRT</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">
              Rapid word-level timestamps (Shorts / Reels)
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChangeFormat("txt")}
            className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              format === "txt"
                ? "bg-violet-500/15 border-violet-500/60 text-violet-300 shadow-sm"
                : "bg-[#0a0b10] border-white/10 text-slate-300 hover:border-white/20"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Plain TXT</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">
              Clean raw script text without timestamps
            </span>
          </button>
        </div>
      </div>

      {/* 2. Transcription Engine Selector */}
      <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
          Transcription Engine
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChangeEngine("groq")}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              engine === "groq"
                ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-300"
                : "bg-[#0a0b10] border-white/10 text-slate-300 hover:border-white/20"
            }`}
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold block">
                Groq Whisper Large-v3
              </span>
              <span className="text-[10px] text-slate-500 block">
                Ultra-fast cloud AI (~0.5s speed)
              </span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
              Active
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChangeEngine("colab")}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              engine === "colab"
                ? "bg-violet-500/15 border-violet-500/50 text-violet-300"
                : "bg-[#0a0b10] border-white/10 text-slate-300 hover:border-white/20"
            }`}
          >
            <Link2 className="w-4 h-4 text-violet-400" />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold block">
                Google Colab / Gradio
              </span>
              <span className="text-[10px] text-slate-500 block">
                Connect external GPU endpoint
              </span>
            </div>
          </button>
        </div>

        {/* Colab URL Input if Colab selected */}
        {engine === "colab" && (
          <div className="flex flex-col gap-1 mt-1 animate-in fade-in duration-200">
            <label className="text-[10px] font-mono text-slate-400">
              Paste your Colab Gradio Public URL:
            </label>
            <input
              type="text"
              value={colabUrl}
              onChange={(e) => onChangeColabUrl(e.target.value)}
              placeholder="https://xxxx.gradio.live"
              className="w-full p-2.5 rounded-xl bg-[#0a0b10] border border-white/10 text-xs font-mono text-slate-100 outline-hidden focus:border-violet-500/50"
            />
          </div>
        )}
      </div>

      {/* 3. Transcribe Trigger Button */}
      <button
        type="button"
        onClick={onTranscribe}
        disabled={!canTranscribe || isTranscribing}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-linear-to-r from-[#00d2ff] via-[#ec4899] to-[#f97316] hover:brightness-110 text-black font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-2"
      >
        <Wand2 className="w-4 h-4" />
        <span>
          {isTranscribing
            ? "Transcribing with Whisper AI..."
            : "Transcribe Audio"}
        </span>
      </button>
    </div>
  );
}

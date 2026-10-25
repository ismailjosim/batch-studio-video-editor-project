"use client";

import {
  ArrowRight,
  Loader2,
  Mic,
  Music,
  Plus,
  Radio,
  Sparkles,
  Type,
  Volume2,
} from "lucide-react";
import { useRef } from "react";

interface SidebarFilesSectionProps {
  audioFileName: string;
  srtFileName: string;
  bgmFileName?: string;
  hasAudio: boolean;
  hasSrt: boolean;
  hasBgm?: boolean;
  isAudioLoading?: boolean;
  onSelectAudioFile: (file: File) => void;
  onSelectSrtFile: (file: File) => void;
  onSelectBgmFile?: (file: File) => void;
  onLoadDemoBgm?: () => void;
  onLoadTimeline: () => void;
  onLoadDemoProject: () => void;
  onOpenMicRecorder?: () => void;
}

export function SidebarFilesSection({
  audioFileName,
  srtFileName,
  bgmFileName,
  hasAudio,
  hasSrt,
  hasBgm,
  isAudioLoading = false,
  onSelectAudioFile,
  onSelectSrtFile,
  onSelectBgmFile,
  onLoadDemoBgm,
  onLoadTimeline,
  onLoadDemoProject,
  onOpenMicRecorder,
}: SidebarFilesSectionProps) {
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const srtInputRef = useRef<HTMLInputElement | null>(null);
  const bgmInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-slate-400 px-1">
        <span>Project Files</span>
        <span
          className={`w-2 h-2 rounded-full ${
            hasAudio && hasSrt
              ? "bg-cyan-400 shadow-[0_0_8px_#00d2ff]"
              : "bg-amber-400"
          }`}
        />
      </div>

      {/* Hidden inputs */}
      <input
        ref={audioInputRef}
        type="file"
        accept=".mp3,.wav,.m4a,.aac,.flac,.ogg,.opus,.webm,.wma"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelectAudioFile(file);
        }}
      />
      <input
        ref={srtInputRef}
        type="file"
        accept=".srt,.txt"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelectSrtFile(file);
        }}
      />
      <input
        ref={bgmInputRef}
        type="file"
        accept=".mp3,.wav,.m4a,.aac,.flac,.ogg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelectBgmFile?.(file);
        }}
      />

      {/* Audio Picker & Mic Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => audioInputRef.current?.click()}
          className="flex-1 flex items-center gap-2.5 p-2.5 rounded-2xl border border-white/10 hover:border-cyan-500/40 bg-[#131622]/90 hover:bg-[#181c2c] text-left transition-all cursor-pointer group min-w-0"
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Music className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-200 block truncate">
              {audioFileName || "Choose audio"}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              Voiceover track
            </span>
          </div>
          <Plus className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0" />
        </button>

        {onOpenMicRecorder && (
          <button
            type="button"
            onClick={onOpenMicRecorder}
            className="p-3 rounded-2xl border border-red-500/30 hover:border-red-400 bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-sm group"
            title="Record voice live via microphone"
          >
            <Mic className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>

      {/* SRT Picker Button */}
      <button
        type="button"
        onClick={() => srtInputRef.current?.click()}
        className="flex items-center gap-3 p-2.5 rounded-2xl border border-white/10 hover:border-pink-500/40 bg-[#131622]/90 hover:bg-[#181c2c] text-left transition-all cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <Type className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-slate-200 block truncate">
            {srtFileName || "Choose subtitles"}
          </span>
          <span className="text-[10px] text-slate-400 block truncate">
            SubRip .srt file
          </span>
        </div>
        <Plus className="w-4 h-4 text-slate-400 group-hover:text-white" />
      </button>

      {/* BGM Audio Picker Button */}
      <button
        type="button"
        onClick={() => bgmInputRef.current?.click()}
        className="flex items-center gap-3 p-2.5 rounded-2xl border border-white/10 hover:border-violet-500/40 bg-[#131622]/90 hover:bg-[#181c2c] text-left transition-all cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <Radio className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-slate-200 block truncate">
            {bgmFileName || "Background Music (BGM)"}
          </span>
          <span className="text-[10px] text-slate-400 block truncate">
            {hasBgm
              ? "Active · Multi-track mixing"
              : "Optional background track"}
          </span>
        </div>
        <Plus className="w-4 h-4 text-slate-400 group-hover:text-white" />
      </button>

      {/* Load Timeline Button */}
      <button
        type="button"
        onClick={onLoadTimeline}
        disabled={isAudioLoading}
        className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-2xl bg-linear-to-r from-[#00d2ff] via-[#ec4899] to-[#f97316] hover:opacity-95 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isAudioLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
            <span>Decoding Timeline...</span>
          </>
        ) : (
          <>
            <span>Load Timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>

      {/* Load Demo Sample Project */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          id="btn-demo-project"
          type="button"
          disabled={isAudioLoading}
          onClick={onLoadDemoProject}
          className="flex items-center justify-center gap-1.5 w-full py-2 px-2.5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white font-semibold text-[10px] transition-all cursor-pointer disabled:opacity-50"
          title="Load synthesized voiceover & demo SRT"
        >
          {isAudioLoading ? (
            <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
          ) : (
            <Sparkles className="w-3 h-3 text-cyan-400" />
          )}
          <span>Demo Project</span>
        </button>
        <button
          id="btn-demo-bgm"
          type="button"
          onClick={onLoadDemoBgm}
          className="flex items-center justify-center gap-1.5 w-full py-2 px-2.5 rounded-xl border border-violet-500/20 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 hover:text-white font-semibold text-[10px] transition-all cursor-pointer"
          title="Load chill synthesized ambient Lo-Fi BGM track"
        >
          <Volume2 className="w-3 h-3 text-violet-400" />
          <span>Demo BGM</span>
        </button>
      </div>
    </div>
  );
}

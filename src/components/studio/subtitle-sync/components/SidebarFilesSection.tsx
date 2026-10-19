"use client";

import {
  ArrowRight,
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
  onSelectAudioFile: (file: File) => void;
  onSelectSrtFile: (file: File) => void;
  onSelectBgmFile?: (file: File) => void;
  onLoadDemoBgm?: () => void;
  onLoadTimeline: () => void;
  onLoadDemoProject: () => void;
}

export function SidebarFilesSection({
  audioFileName,
  srtFileName,
  bgmFileName,
  hasAudio,
  hasSrt,
  hasBgm,
  onSelectAudioFile,
  onSelectSrtFile,
  onSelectBgmFile,
  onLoadDemoBgm,
  onLoadTimeline,
  onLoadDemoProject,
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
              ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
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

      {/* Audio Picker Button */}
      <button
        type="button"
        onClick={() => audioInputRef.current?.click()}
        className="flex items-center gap-3 p-2.5 rounded-2xl border border-white/10 hover:border-emerald-500/40 bg-[#131622]/90 hover:bg-[#181c2c] text-left transition-all cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
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
        <Plus className="w-4 h-4 text-slate-400 group-hover:text-white" />
      </button>

      {/* SRT Picker Button */}
      <button
        type="button"
        onClick={() => srtInputRef.current?.click()}
        className="flex items-center gap-3 p-2.5 rounded-2xl border border-white/10 hover:border-teal-500/40 bg-[#131622]/90 hover:bg-[#181c2c] text-left transition-all cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
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
        className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-2xl bg-linear-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
      >
        <span>Load Timeline</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {/* Load Demo Sample Project */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          id="btn-demo-project"
          type="button"
          onClick={onLoadDemoProject}
          className="flex items-center justify-center gap-1.5 w-full py-2 px-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-[10px] transition-all cursor-pointer"
          title="Load synthesized voiceover & demo SRT"
        >
          <Sparkles className="w-3 h-3 text-emerald-400" />
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

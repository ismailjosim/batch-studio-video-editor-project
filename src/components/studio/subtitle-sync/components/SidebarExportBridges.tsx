"use client";

import { ArrowRight, Download, FileAudio, Film, Scissors } from "lucide-react";
import Link from "next/link";

interface SidebarExportBridgesProps {
  hasSrt: boolean;
  onExportSrt: () => void;
  onSendToVideoGenerator: () => void;
  onSendToBatchSplitter: () => void;
}

export function SidebarExportBridges({
  hasSrt,
  onExportSrt,
  onSendToVideoGenerator,
  onSendToBatchSplitter,
}: SidebarExportBridgesProps) {
  return (
    <>
      {/* Studio Suite Seamless Transfer */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-1">
          Export & Studio Suite
        </span>

        {/* Export Subtitles */}
        <button
          type="button"
          onClick={onExportSrt}
          disabled={!hasSrt}
          className="flex items-center justify-between w-full p-2.5 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          title="Export edited subtitles to .srt, .vtt, .ass, .txt, or .json (Ctrl+E)"
        >
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Export Subtitles</span>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-cyan-300 border border-cyan-500/30">
            SRT · VTT · ASS
          </span>
        </button>

        {/* Send to 2K Video Generator */}
        <button
          type="button"
          onClick={onSendToVideoGenerator}
          disabled={!hasSrt}
          className="flex items-center justify-between w-full p-2.5 rounded-2xl border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          title="Send current synced cues directly to 2K Video Generator"
        >
          <div className="flex items-center gap-2">
            <Film className="w-3.5 h-3.5 text-orange-400" />
            <span>Send to Video Generator</span>
          </div>
          <ArrowRight className="w-3 h-3 text-orange-400" />
        </button>

        {/* Send to Batch Splitter */}
        <button
          type="button"
          onClick={onSendToBatchSplitter}
          disabled={!hasSrt}
          className="flex items-center justify-between w-full p-2.5 rounded-2xl border border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          title="Send current cues to SRT Batch Splitter"
        >
          <div className="flex items-center gap-2">
            <Scissors className="w-3.5 h-3.5 text-pink-400" />
            <span>Send to Batch Splitter</span>
          </div>
          <ArrowRight className="w-3 h-3 text-pink-400" />
        </button>

        {/* Link to AI Transcriber */}
        <Link
          href="/dashboard/transcribe"
          className="flex items-center justify-between w-full p-2.5 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[11px] font-semibold transition-all cursor-pointer group"
          title="Transcribe voice audio to SRT using Whisper Large-v3"
        >
          <div className="flex items-center gap-2">
            <FileAudio className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>AI Audio Transcriber</span>
          </div>
          <ArrowRight className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Shortcuts Cheatsheet */}
      <div className="mt-auto pt-3 border-t border-white/10 text-[11px] text-slate-400 flex flex-col gap-1.5">
        <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500">
          SHORTCUTS
        </span>
        <div className="flex items-center justify-between">
          <span>Play / Pause</span>
          <kbd className="px-1.5 py-0.5 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono text-slate-300">
            Space
          </kbd>
        </div>
        <div className="flex items-center justify-between">
          <span>Split at playhead</span>
          <kbd className="px-1.5 py-0.5 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono text-slate-300">
            S
          </kbd>
        </div>
        <div className="flex items-center justify-between">
          <span>Delete selected</span>
          <kbd className="px-1.5 py-0.5 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono text-slate-300">
            Del
          </kbd>
        </div>
        <div className="flex items-center justify-between">
          <span>Export SRT</span>
          <kbd className="px-1.5 py-0.5 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono text-slate-300">
            Ctrl E
          </kbd>
        </div>
      </div>
    </>
  );
}

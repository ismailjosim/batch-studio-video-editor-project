"use client";

import { Plus, RotateCcw, Scissors, Trash2, Undo2, Wand2 } from "lucide-react";
import type { SubtitleCue } from "../subtitle-sync-types";

interface SidebarEditToolsProps {
  hasAudio: boolean;
  hasSrt: boolean;
  canUndo: boolean;
  selectedCue: SubtitleCue | null;
  onAutoAlignToSpeech: () => void;
  onSplitAtPlayhead: () => void;
  onAddCue: () => void;
  onDeleteSelected: () => void;
  onUndo: () => void;
  onResetProject: () => void;
}

export function SidebarEditTools({
  hasAudio,
  hasSrt,
  canUndo,
  selectedCue,
  onAutoAlignToSpeech,
  onSplitAtPlayhead,
  onAddCue,
  onDeleteSelected,
  onUndo,
  onResetProject,
}: SidebarEditToolsProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-1">
        Subtitle Tools
      </span>

      {/* Auto-Align to Speech (AI VAD) */}
      <button
        id="btn-auto-align-voice"
        type="button"
        onClick={onAutoAlignToSpeech}
        disabled={!hasAudio || !hasSrt}
        className="flex items-center justify-between w-full p-2.5 rounded-2xl border border-cyan-500/30 hover:border-cyan-400 bg-linear-to-r from-cyan-500/10 to-pink-500/10 hover:from-cyan-500/20 hover:to-pink-500/20 text-cyan-300 hover:text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group shadow-sm"
        title="Auto-detect voice pauses & snap subtitles to active speech boundaries (VAD)"
      >
        <div className="flex items-center gap-2.5">
          <Wand2 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>Auto-Align to Voice</span>
        </div>
        <span className="px-1.5 py-0.5 rounded-md bg-cyan-400/20 border border-cyan-400/30 text-[9px] font-mono text-cyan-300">
          AI VAD
        </span>
      </button>

      {/* Split at Playhead */}
      <button
        type="button"
        onClick={onSplitAtPlayhead}
        className="flex items-center justify-between w-full p-2.5 rounded-2xl border border-white/10 hover:border-cyan-500/40 bg-[#131622]/90 hover:bg-[#181c2c] text-slate-200 text-xs font-semibold transition-all cursor-pointer group"
        title="Split cue at current playback playhead (S)"
      >
        <div className="flex items-center gap-2.5">
          <Scissors className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>Split at playhead</span>
        </div>
        <kbd className="px-1.5 py-0.5 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono text-slate-400">
          S
        </kbd>
      </button>

      {/* Add Cue on Timeline */}
      <button
        type="button"
        onClick={onAddCue}
        className="flex items-center justify-between w-full p-2.5 rounded-2xl border border-white/10 hover:border-pink-500/40 bg-[#131622]/90 hover:bg-[#181c2c] text-slate-200 text-xs font-semibold transition-all cursor-pointer group"
        title="Add new cue at playhead position (+)"
      >
        <div className="flex items-center gap-2.5">
          <Plus className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
          <span>Add cue on timeline</span>
        </div>
        <kbd className="px-1.5 py-0.5 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono text-slate-400">
          +
        </kbd>
      </button>

      {/* Delete Selected Cue */}
      <button
        type="button"
        onClick={onDeleteSelected}
        disabled={!selectedCue}
        className="flex items-center justify-between w-full p-2.5 rounded-2xl border border-white/10 hover:border-red-500/30 bg-[#131622]/90 hover:bg-red-500/10 text-slate-200 hover:text-red-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
        title="Delete selected subtitle (Del)"
      >
        <div className="flex items-center gap-2.5">
          <Trash2 className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
          <span>Delete selected</span>
        </div>
        <kbd className="px-1.5 py-0.5 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono text-slate-400">
          Del
        </kbd>
      </button>

      {/* Undo Last Change */}
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className="flex items-center justify-between w-full p-2.5 rounded-2xl border border-white/10 hover:border-amber-500/40 bg-[#131622]/90 hover:bg-[#181c2c] text-slate-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
        title="Undo last change (Ctrl+Z)"
      >
        <div className="flex items-center gap-2.5">
          <Undo2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span>Undo last change</span>
        </div>
        <kbd className="px-1.5 py-0.5 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono text-slate-400">
          Ctrl Z
        </kbd>
      </button>

      {/* Reset Project */}
      <button
        type="button"
        onClick={onResetProject}
        className="flex items-center gap-2.5 w-full p-2.5 rounded-2xl border border-white/10 hover:border-white/20 bg-[#131622]/90 hover:bg-white/5 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
        title="Reset project and clear session"
      >
        <RotateCcw className="w-4 h-4 text-slate-400" />
        <span>Reset demo project</span>
      </button>
    </div>
  );
}

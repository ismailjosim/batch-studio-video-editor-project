"use client";

import { Play, RotateCcw, Sparkles } from "lucide-react";
import type { SubtitleCue, WordTiming } from "../subtitle-sync-types";
import {
  computeDefaultWordTimings,
  formatDisplayTime,
} from "../subtitle-sync-utils";

interface InspectorWordKaraokeProps {
  cue: SubtitleCue;
  words: WordTiming[];
  playheadMs: number;
  onUpdateWords?: (cueId: number, words: WordTiming[]) => void;
  onAuditionRange?: (startMs: number, endMs: number) => void;
}

export function InspectorWordKaraoke({
  cue,
  words,
  playheadMs,
  onUpdateWords,
  onAuditionRange,
}: InspectorWordKaraokeProps) {
  const handleNudgeWord = (index: number, deltaMs: number) => {
    if (!cue || !onUpdateWords) return;
    const currentWords = [...words];
    const target = { ...currentWords[index] };
    const minStart = index === 0 ? cue.startMs : currentWords[index - 1].endMs;
    const maxStart = target.endMs - 50;
    target.startMs = Math.max(
      minStart,
      Math.min(maxStart, target.startMs + deltaMs),
    );
    currentWords[index] = target;
    onUpdateWords(cue.id, currentWords);
  };

  const handleAutoDistributeWords = () => {
    if (!cue || !onUpdateWords) return;
    const recalculated = computeDefaultWordTimings(
      cue.text,
      cue.startMs,
      cue.endMs,
    );
    onUpdateWords(cue.id, recalculated);
  };

  return (
    <div className="flex flex-col gap-3 pt-3 border-t border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-300">
            Word-Level Karaoke Timing
          </span>
          <span className="px-1.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-[9px] font-mono text-amber-300 font-bold">
            {words.length} words
          </span>
        </div>

        <button
          type="button"
          onClick={handleAutoDistributeWords}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-white/10 hover:border-amber-400/40 bg-white/5 hover:bg-amber-400/10 text-[10px] font-mono text-slate-300 hover:text-amber-300 transition-all cursor-pointer"
          title="Recalculate even character-weighted word timing across this cue"
        >
          <RotateCcw className="w-3 h-3 text-amber-400" />
          <span>Re-interpolate</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
        {words.map((wordItem, idx) => {
          const isCurrentlySpoken =
            playheadMs >= wordItem.startMs && playheadMs <= wordItem.endMs;
          const wordDurationMs = wordItem.endMs - wordItem.startMs;

          return (
            <div
              key={idx}
              className={`flex items-center gap-1.5 p-1.5 px-2 rounded-xl border transition-all text-xs font-mono ${
                isCurrentlySpoken
                  ? "bg-amber-400/20 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.3)] scale-105"
                  : "bg-[#0a0b10] border-white/10 text-slate-300 hover:border-white/25"
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  onAuditionRange?.(wordItem.startMs, wordItem.endMs)
                }
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Audition this word"
              >
                <Play className="w-2.5 h-2.5" />
              </button>
              <span className="font-sans font-bold text-slate-100">
                {wordItem.word}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {formatDisplayTime(wordItem.startMs / 1000, true)}
              </span>
              <span className="text-[9px] text-amber-400/80 bg-amber-400/10 px-1 py-0.2 rounded font-mono">
                {wordDurationMs}ms
              </span>

              <div className="flex items-center ml-0.5">
                <button
                  type="button"
                  onClick={() => handleNudgeWord(idx, -50)}
                  disabled={idx === 0 && wordItem.startMs <= cue.startMs}
                  className="px-1 py-0.5 text-[9px] text-slate-500 hover:text-white cursor-pointer disabled:opacity-30"
                  title="Nudge earlier (-50ms)"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgeWord(idx, 50)}
                  disabled={wordItem.startMs >= wordItem.endMs - 50}
                  className="px-1 py-0.5 text-[9px] text-slate-500 hover:text-white cursor-pointer disabled:opacity-30"
                  title="Nudge later (+50ms)"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

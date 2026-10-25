"use client";

import { Check, Replace, Search, Sparkles, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { SubtitleCue } from "../subtitle-sync-types";

interface SubtitleSearchReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  cues: SubtitleCue[];
  onUpdateCues: (updatedCues: SubtitleCue[]) => void;
  onSaveUndoState: () => void;
}

const COMMON_FILLERS = [
  "um",
  "uh",
  "you know",
  "like",
  "actually",
  "basically",
  "literally",
  "sort of",
  "kind of",
  "i mean",
];

export function SubtitleSearchReplaceModal({
  isOpen,
  onClose,
  cues,
  onUpdateCues,
  onSaveUndoState,
}: SubtitleSearchReplaceModalProps) {
  const [activeTab, setActiveTab] = useState<"search" | "fillers">("search");

  // Search & Replace state
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [matchCase, setMatchCase] = useState(false);

  // Calculate search matches
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim() || !cues.length) return [];
    const query = matchCase ? searchQuery : searchQuery.toLowerCase();
    const matches: Array<{ cueId: number; text: string; occurrences: number }> =
      [];

    for (const cue of cues) {
      const text = matchCase ? cue.text : cue.text.toLowerCase();
      let count = 0;
      let pos = text.indexOf(query, 0);
      while (pos !== -1) {
        count++;
        pos = text.indexOf(query, pos + query.length);
      }
      if (count > 0) {
        matches.push({ cueId: cue.id, text: cue.text, occurrences: count });
      }
    }
    return matches;
  }, [cues, searchQuery, matchCase]);

  const totalMatchesCount = useMemo(() => {
    return searchMatches.reduce((acc, m) => acc + m.occurrences, 0);
  }, [searchMatches]);

  const handleReplaceAll = () => {
    if (!searchQuery.trim()) {
      toast.warning("Please enter a search term");
      return;
    }
    if (totalMatchesCount === 0) {
      toast.info("No matches found to replace");
      return;
    }

    onSaveUndoState();

    const flags = matchCase ? "g" : "gi";
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, flags);

    let replacedCount = 0;
    const updated = cues.map((cue) => {
      if (regex.test(cue.text)) {
        const newText = cue.text.replace(regex, () => {
          replacedCount++;
          return replaceQuery;
        });
        return { ...cue, text: newText };
      }
      return cue;
    });

    onUpdateCues(updated);
    toast.success(
      `Replaced ${replacedCount} occurrence${replacedCount === 1 ? "" : "s"} across ${searchMatches.length} cues!`,
    );
  };

  // Filler Word Detection
  const detectedFillers = useMemo(() => {
    if (!cues.length) return [];
    const stats: Record<string, number> = {};

    for (const filler of COMMON_FILLERS) {
      const regex = new RegExp(`\\b${filler}\\b`, "gi");
      let count = 0;
      for (const cue of cues) {
        const matches = cue.text.match(regex);
        if (matches) count += matches.length;
      }
      if (count > 0) {
        stats[filler] = count;
      }
    }

    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [cues]);

  const totalFillersCount = useMemo(() => {
    return detectedFillers.reduce((acc, [, count]) => acc + count, 0);
  }, [detectedFillers]);

  const handleCleanFillers = () => {
    if (totalFillersCount === 0) {
      toast.info("No filler words found in current subtitles!");
      return;
    }

    onSaveUndoState();

    let removedCount = 0;
    // Create regex matching all fillers as whole words
    const fillerPattern = COMMON_FILLERS.map((f) =>
      f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    ).join("|");
    const regex = new RegExp(`\\b(${fillerPattern})\\b[ ,.]*`, "gi");

    const updated = cues.map((cue) => {
      const newText = cue.text
        .replace(regex, () => {
          removedCount++;
          return "";
        })
        .replace(/\s+/g, " ")
        .trim();

      return {
        ...cue,
        text: newText || "...",
      };
    });

    onUpdateCues(updated);
    toast.success(
      `Cleaned ${removedCount} filler word${removedCount === 1 ? "" : "s"} from your subtitles!`,
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl flex flex-col max-h-[85vh] bg-[#0c0e16] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#101320]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
              <Replace className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white font-heading">
                Search, Replace & Filler Cleaner
              </h2>
              <p className="text-xs text-slate-400">
                Batch fix misspelled terms or remove conversational speech
                fillers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 p-3 bg-black/40 border-b border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab("search")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "search"
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search & Replace ({totalMatchesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("fillers")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "fillers"
                ? "bg-pink-500/15 text-pink-400 border border-pink-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto Filler Cleaner ({totalFillersCount})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {activeTab === "search" ? (
            <div className="flex flex-col gap-4">
              {/* Find input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Find Text
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. JC Desing or misheard brand..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                  />
                  {searchQuery && (
                    <span className="absolute right-3 top-2.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-cyan-300 border border-cyan-500/20">
                      {totalMatchesCount} matches
                    </span>
                  )}
                </div>
              </div>

              {/* Replace input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Replace With
                </label>
                <input
                  type="text"
                  value={replaceQuery}
                  onChange={(e) => setReplaceQuery(e.target.value)}
                  placeholder="e.g. JC Design"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Options */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={matchCase}
                    onChange={(e) => setMatchCase(e.target.checked)}
                    className="rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400 cursor-pointer"
                  />
                  <span>Match exact letter case</span>
                </label>
              </div>

              {/* Match Previews */}
              {searchMatches.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Matching Subtitles ({searchMatches.length} cues):
                  </span>
                  <div className="max-h-40 overflow-y-auto flex flex-col gap-1.5 pr-1">
                    {searchMatches.map((m) => (
                      <div
                        key={m.cueId}
                        className="p-2.5 rounded-xl bg-white/2 border border-white/5 text-xs text-slate-300 flex items-center justify-between gap-3"
                      >
                        <span className="font-mono text-cyan-400 shrink-0 text-[10px]">
                          #{m.cueId}
                        </span>
                        <span className="truncate flex-1">{m.text}</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-1.5 py-0.5 rounded shrink-0">
                          {m.occurrences}x
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Filler Words Tab */
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-pink-500/5 border border-pink-500/20 text-xs text-slate-300 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-pink-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Speech Polish Assistant</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Automatically scans all subtitle cues for hesitation phrases
                  like "um", "uh", "you know", and "like" so your video
                  narration captions look authoritative and punchy.
                </p>
              </div>

              {detectedFillers.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-slate-300">
                    Detected Filler Words ({totalFillersCount} total found):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {detectedFillers.map(([word, count]) => (
                      <div
                        key={word}
                        className="p-2.5 rounded-xl bg-[#131622] border border-white/10 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-pink-400">
                          "{word}"
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-black/50 px-2 py-0.5 rounded-full">
                          {count}x
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center gap-2 text-slate-400">
                  <Check className="w-8 h-8 text-emerald-400" />
                  <p className="text-xs font-semibold text-white">
                    No speech fillers detected!
                  </p>
                  <p className="text-[11px]">
                    Your subtitle cues are clean of "um", "uh", or "you know"
                    hesitations.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-white/10 bg-[#101320]">
          <span className="text-[11px] text-slate-400 font-mono">
            Ctrl+Z supported after any change
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Close
            </button>

            {activeTab === "search" ? (
              <button
                type="button"
                onClick={handleReplaceAll}
                disabled={totalMatchesCount === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-linear-to-r from-orange-400 to-amber-500 hover:brightness-110 text-black font-extrabold text-xs shadow-lg shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <Replace className="w-4 h-4" />
                <span>Replace All ({totalMatchesCount})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCleanFillers}
                disabled={totalFillersCount === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-linear-to-r from-pink-500 to-rose-500 hover:brightness-110 text-white font-extrabold text-xs shadow-lg shadow-pink-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clean All Fillers ({totalFillersCount})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

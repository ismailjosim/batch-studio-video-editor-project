"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type {
  HistorySnapshot,
  SubtitleCue,
  WordTiming,
} from "../subtitle-sync-types";
import {
  DEMO_SUBTITLE_CUES,
  formatDisplayTime,
  splitCueText,
} from "../subtitle-sync-utils";

export function useSubtitleCues(
  currentTime: number,
  duration: number,
  seekTo: (timeSec: number) => void,
  setStatusText: (text: string) => void,
) {
  const [cues, setCues] = useState<SubtitleCue[]>(DEMO_SUBTITLE_CUES);
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [history, setHistory] = useState<HistorySnapshot[]>([]);

  // Save state snapshot to undo stack
  const saveUndoState = useCallback(() => {
    setHistory((prev) => [
      ...prev.slice(-49), // retain up to 50 undo steps
      {
        cues: structuredClone(cues),
        selectedId,
      },
    ]);
  }, [cues, selectedId]);

  // Undo last change
  const handleUndo = useCallback(() => {
    if (history.length === 0) {
      toast.info("Nothing to undo");
      return;
    }
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCues(previous.cues);
    setSelectedId(previous.selectedId);
    setStatusText("Last change undone");
    toast.success("Undid last change");
  }, [history, setStatusText]);

  // Split Cue at Playhead
  const handleSplitAtPlayhead = useCallback(() => {
    const playheadMs = Math.round(currentTime * 1000);
    const targetCue =
      cues.find((c) => playheadMs >= c.startMs && playheadMs <= c.endMs) ||
      cues.find((c) => c.id === selectedId);

    if (!targetCue) {
      toast.warning(
        "Position the playhead needle inside a subtitle cue to split",
      );
      return;
    }

    const MIN_SPLIT_MARGIN = 200; // ms
    if (
      playheadMs < targetCue.startMs + MIN_SPLIT_MARGIN ||
      playheadMs > targetCue.endMs - MIN_SPLIT_MARGIN
    ) {
      toast.warning(
        "Move the needle at least 200ms inside the subtitle before splitting",
      );
      return;
    }

    saveUndoState();

    const { firstText, secondText } = splitCueText(
      targetCue.text,
      targetCue.startMs,
      targetCue.endMs,
      playheadMs,
    );

    const originalEndMs = targetCue.endMs;
    targetCue.endMs = playheadMs;
    targetCue.text = firstText;

    const newCueId = Math.max(0, ...cues.map((c) => c.id)) + 1;
    const secondCue: SubtitleCue = {
      id: newCueId,
      startMs: playheadMs,
      endMs: originalEndMs,
      text: secondText,
    };

    const targetIndex = cues.indexOf(targetCue);
    const nextCues = [...cues];
    nextCues.splice(targetIndex + 1, 0, secondCue);

    const renumbered = nextCues.map((c, idx) => ({ ...c, id: idx + 1 }));
    setCues(renumbered);
    setSelectedId(targetIndex + 2);

    setStatusText(
      `Split cue #${targetCue.id} at ${formatDisplayTime(currentTime, true)}`,
    );
    toast.success(`Split cue into #${targetCue.id} & #${targetIndex + 2}`);
  }, [currentTime, cues, selectedId, saveUndoState, setStatusText]);

  // Add Cue at Playhead
  const handleAddCue = useCallback(() => {
    saveUndoState();
    const playheadMs = Math.round(currentTime * 1000);
    const sorted = [...cues].sort((a, b) => a.startMs - b.startMs);

    const nextCue = sorted.find((c) => c.startMs > playheadMs);
    const maxEndMs = nextCue ? nextCue.startMs : duration * 1000;
    const defaultDuration = 2500; // 2.5s
    const endMs = Math.min(maxEndMs, playheadMs + defaultDuration);

    const newCue: SubtitleCue = {
      id: cues.length + 1,
      startMs: playheadMs,
      endMs: Math.max(playheadMs + 500, endMs),
      text: "New subtitle line",
    };

    const updated = [...cues, newCue]
      .sort((a, b) => a.startMs - b.startMs)
      .map((c, i) => ({ ...c, id: i + 1 }));

    setCues(updated);
    const addedIndex = updated.findIndex((c) => c.startMs === playheadMs);
    setSelectedId(addedIndex >= 0 ? updated[addedIndex].id : 1);

    setStatusText("New subtitle cue added on timeline");
    toast.success("Added new cue at playhead position");
  }, [cues, currentTime, duration, saveUndoState, setStatusText]);

  // Delete Selected Cue
  const handleDeleteSelected = useCallback(() => {
    if (selectedId === null) return;
    const index = cues.findIndex((c) => c.id === selectedId);
    if (index < 0) return;

    saveUndoState();
    const updated = cues
      .filter((c) => c.id !== selectedId)
      .map((c, i) => ({ ...c, id: i + 1 }));

    setCues(updated);
    const nextSelected = updated[index] || updated[index - 1] || null;
    setSelectedId(nextSelected ? nextSelected.id : null);

    setStatusText("Deleted subtitle cue");
    toast.info("Subtitle cue deleted");
  }, [cues, selectedId, saveUndoState, setStatusText]);

  // Update Timing of a Cue
  const handleUpdateCueTiming = useCallback(
    (id: number, startMs: number, endMs: number, shouldSaveHistory = false) => {
      if (shouldSaveHistory) saveUndoState();
      setCues((prev) =>
        prev.map((c) => (c.id === id ? { ...c, startMs, endMs } : c)),
      );
    },
    [saveUndoState],
  );

  // Update Text of Selected Cue
  const handleUpdateCueText = useCallback(
    (text: string) => {
      if (selectedId === null) return;
      setCues((prev) =>
        prev.map((c) => (c.id === selectedId ? { ...c, text } : c)),
      );
    },
    [selectedId],
  );

  // Update Cue Words (Word-level timing)
  const handleUpdateCueWords = useCallback(
    (cueId: number, words: WordTiming[]) => {
      saveUndoState();
      setCues((prev) =>
        prev.map((c) => (c.id === cueId ? { ...c, words } : c)),
      );
      toast.success("Updated word karaoke timing");
    },
    [saveUndoState],
  );

  // Next / Previous Navigation
  const handleSelectPrevCue = useCallback(() => {
    if (cues.length === 0) return;
    const idx = cues.findIndex((c) => c.id === selectedId);
    if (idx > 0) {
      const prev = cues[idx - 1];
      setSelectedId(prev.id);
      seekTo(prev.startMs / 1000);
    }
  }, [cues, selectedId, seekTo]);

  const handleSelectNextCue = useCallback(() => {
    if (cues.length === 0) return;
    const idx = cues.findIndex((c) => c.id === selectedId);
    if (idx >= 0 && idx < cues.length - 1) {
      const next = cues[idx + 1];
      setSelectedId(next.id);
      seekTo(next.startMs / 1000);
    }
  }, [cues, selectedId, seekTo]);

  return {
    cues,
    setCues,
    selectedId,
    setSelectedId,
    history,
    setHistory,
    saveUndoState,
    handleUndo,
    handleSplitAtPlayhead,
    handleAddCue,
    handleDeleteSelected,
    handleUpdateCueTiming,
    handleUpdateCueText,
    handleUpdateCueWords,
    handleSelectPrevCue,
    handleSelectNextCue,
  };
}

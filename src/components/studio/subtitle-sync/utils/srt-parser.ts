import type { SubtitleCue } from "../subtitle-sync-types";
import { formatTimecode, parseTimecode } from "./time-utils";

/**
 * Parses raw SRT text into SubtitleCue items.
 */
export function parseSrt(text: string): SubtitleCue[] {
  const normalized = text
    .replace(/\ufeff/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
  if (!normalized) return [];

  const rawBlocks = normalized.split(/\n\s*\n+/);
  const cues: SubtitleCue[] = [];

  for (const block of rawBlocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 2) continue;

    // Detect if first line is cue index number
    const timingLineIdx = lines[0].trim().match(/^\d+$/) ? 1 : 0;
    const timingLine = lines[timingLineIdx];
    if (!timingLine || !timingLine.includes("-->")) continue;

    const [startStr, endStr] = timingLine.split("-->").map((s) => s.trim());
    if (!startStr || !endStr) continue;

    const startMs = parseTimecode(startStr);
    const endMs = parseTimecode(endStr.split(" ")[0]);
    const textContent = lines
      .slice(timingLineIdx + 1)
      .join("\n")
      .trim();

    if (!Number.isNaN(startMs) && !Number.isNaN(endMs)) {
      cues.push({
        id: cues.length + 1,
        startMs,
        endMs: Math.max(endMs, startMs + 100),
        text: textContent,
      });
    }
  }

  // Ensure cues are sorted chronologically
  return cues.sort((a, b) => a.startMs - b.startMs);
}

/**
 * Serializes SubtitleCue items into standard SRT string.
 */
export function renderSrt(cues: SubtitleCue[]): string {
  const sorted = [...cues].sort((a, b) => a.startMs - b.startMs);
  const blocks = sorted.map((cue, index) => {
    const startMs = Math.max(0, cue.startMs);
    const endMs = Math.max(startMs + 50, cue.endMs);
    return `${index + 1}\n${formatTimecode(startMs)} --> ${formatTimecode(endMs)}\n${cue.text.trim()}`;
  });
  return blocks.join("\n\n") + (blocks.length ? "\n" : "");
}

/**
 * Splits cue text at word boundaries based on time split ratio.
 */
export function splitCueText(
  text: string,
  startMs: number,
  endMs: number,
  splitMs: number,
): { firstText: string; secondText: string } {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    return { firstText: text, secondText: text };
  }

  const totalDuration = Math.max(1, endMs - startMs);
  const ratio = Math.max(
    0.1,
    Math.min(0.9, (splitMs - startMs) / totalDuration),
  );
  const splitIndex = Math.max(
    1,
    Math.min(words.length - 1, Math.round(words.length * ratio)),
  );

  return {
    firstText: words.slice(0, splitIndex).join(" "),
    secondText: words.slice(splitIndex).join(" "),
  };
}

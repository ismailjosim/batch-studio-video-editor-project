import type { ParsedSubtitle, SplitBatch } from "./splitter-types";

export function timecodeToMs(tc: string): number {
  const parts = tc.trim().split(":");
  if (parts.length < 3) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const secParts = parts[2].split(",");
  const seconds = parseInt(secParts[0], 10) || 0;
  const millis = parseInt(secParts[1], 10) || 0;
  return hours * 3600000 + minutes * 60000 + seconds * 1000 + millis;
}

export function parseSrtRaw(content: string): ParsedSubtitle[] {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  const rawBlocks = normalized.split(/\n\n+/);
  const subtitles: ParsedSubtitle[] = [];

  for (const block of rawBlocks) {
    const lines = block.trim().split("\n");
    if (lines.length >= 2) {
      const id = parseInt(lines[0], 10);
      const timecode = lines[1];
      const text = lines.slice(2).join(" ").trim();
      if (!Number.isNaN(id) && timecode.includes("-->")) {
        const [startTime, endTime] = timecode.split("-->").map((s) => s.trim());
        const startMs = timecodeToMs(startTime);
        const endMs = timecodeToMs(endTime);
        subtitles.push({
          id,
          timecode,
          startTime,
          endTime,
          text,
          originalBlock: block.trim(),
          startMs,
          endMs,
        });
      }
    }
  }
  return subtitles;
}

export function calculateBatches(
  subs: ParsedSubtitle[],
  size: number,
): SplitBatch[] {
  if (!subs.length || size <= 0) return [];
  const batches: SplitBatch[] = [];
  const total = Math.ceil(subs.length / size);

  for (let b = 0; b < total; b++) {
    const start = b * size;
    const end = Math.min(start + size, subs.length);
    const slice = subs.slice(start, end);
    const first = slice[0];
    const last = slice[slice.length - 1];

    const durationMs = Math.max(0, last.endMs - first.startMs);
    const durSec = Math.round(durationMs / 1000);
    const durMins = Math.floor(durSec / 60);
    const durRemainSec = durSec % 60;
    const durationFormatted =
      durMins > 0 ? `${durMins}m ${durRemainSec}s` : `${durSec}s`;

    const srtContent = slice.map((s) => s.originalBlock).join("\n\n");
    const txtContent = slice.map((s) => s.text).join("\n");

    batches.push({
      batchNumber: b + 1,
      batchStr: String(b + 1).padStart(2, "0"),
      subtitles: slice,
      firstId: first.id,
      lastId: last.id,
      timeRange: `${first.startTime.split(",")[0]} ➔ ${last.endTime.split(",")[0]}`,
      durationFormatted,
      srtContent,
      txtContent,
    });
  }
  return batches;
}

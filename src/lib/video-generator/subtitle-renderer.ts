import type { Cue } from "./types";

interface DrawSubtitleOptions {
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  cue: Cue & {
    words?: Array<{ word: string; startMs: number; endMs: number }>;
  };
  currentTimeMs: number;
  canvasWidth: number;
  canvasHeight: number;
  preset?: "hormozi-pop" | "emerald-glow" | "classic-yellow" | "minimal-clean";
  isPortrait?: boolean;
}

/**
 * Renders high-impact burn-in animated subtitles onto the video canvas frame.
 */
export function drawSubtitleOverlay({
  ctx,
  cue,
  currentTimeMs,
  canvasWidth,
  canvasHeight,
  preset = "hormozi-pop",
  isPortrait = false,
}: DrawSubtitleOptions): void {
  if (!cue || !cue.text.trim()) return;

  // Only render if currently inside this cue's duration
  if (currentTimeMs < cue.startMs || currentTimeMs > cue.endMs) return;

  ctx.save();

  // Dynamic responsive font size
  const baseFontSize = isPortrait
    ? Math.round(canvasHeight * 0.042)
    : Math.round(canvasHeight * 0.054);
  const fontSize = Math.max(24, Math.min(120, baseFontSize));

  const fontFamily =
    preset === "hormozi-pop"
      ? "Impact, 'Montserrat', 'Inter', sans-serif"
      : "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

  ctx.font = `900 ${fontSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Vertical placement: 72% down in portrait (safe from UI overlays), 86% in landscape
  const targetY = isPortrait ? canvasHeight * 0.72 : canvasHeight * 0.86;

  // Split text into words for karaoke or word-level tracking
  const rawWords = cue.text.trim().split(/\s+/).filter(Boolean);
  if (rawWords.length === 0) {
    ctx.restore();
    return;
  }

  // Check word timings or interpolate
  const totalDuration = Math.max(100, cue.endMs - cue.startMs);
  const wordsWithTiming =
    cue.words && cue.words.length === rawWords.length
      ? cue.words
      : rawWords.map((word, idx) => {
          const wStart = cue.startMs + (idx / rawWords.length) * totalDuration;
          const wEnd =
            cue.startMs + ((idx + 1) / rawWords.length) * totalDuration;
          return { word, startMs: wStart, endMs: wEnd };
        });

  // Measure and wrap words into lines (max width 85% of canvas)
  const maxLineWidth = canvasWidth * 0.85;
  const lines: Array<typeof wordsWithTiming> = [];
  let currentLine: typeof wordsWithTiming = [];
  let currentLineWidth = 0;
  const spaceWidth = ctx.measureText(" ").width;

  for (const item of wordsWithTiming) {
    const wordWidth = ctx.measureText(
      preset === "hormozi-pop" ? item.word.toUpperCase() : item.word,
    ).width;

    if (
      currentLine.length > 0 &&
      currentLineWidth + spaceWidth + wordWidth > maxLineWidth
    ) {
      lines.push(currentLine);
      currentLine = [item];
      currentLineWidth = wordWidth;
    } else {
      currentLine.push(item);
      currentLineWidth += (currentLine.length > 1 ? spaceWidth : 0) + wordWidth;
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  const lineHeight = fontSize * 1.25;
  const totalBlockHeight = lines.length * lineHeight;
  const startY = targetY - totalBlockHeight / 2 + lineHeight / 2;

  // Render each line
  lines.forEach((lineWords, lineIdx) => {
    const lineY = startY + lineIdx * lineHeight;

    // Calculate total width of this line
    let totalLineW = 0;
    const measuredWords = lineWords.map((item) => {
      const displayWord =
        preset === "hormozi-pop" ? item.word.toUpperCase() : item.word;
      const w = ctx.measureText(displayWord).width;
      totalLineW += w;
      return { item, displayWord, width: w };
    });
    totalLineW += (lineWords.length - 1) * spaceWidth;

    let cursorX = canvasWidth / 2 - totalLineW / 2;

    for (const { item, displayWord, width } of measuredWords) {
      const isCurrentlySpoken =
        currentTimeMs >= item.startMs && currentTimeMs <= item.endMs;
      const isPast = currentTimeMs > item.endMs;

      ctx.save();

      // CapCut / Hormozi active word pop scale
      if (
        isCurrentlySpoken &&
        (preset === "hormozi-pop" || preset === "emerald-glow")
      ) {
        const wordCenterX = cursorX + width / 2;
        ctx.translate(wordCenterX, lineY);
        ctx.scale(1.12, 1.12);
        ctx.translate(-wordCenterX, -lineY);
      }

      // Configure stroke and fill colors based on style preset
      if (preset === "hormozi-pop") {
        ctx.lineWidth = Math.max(4, Math.round(fontSize * 0.18));
        ctx.strokeStyle = "rgba(0, 0, 0, 0.95)";
        ctx.lineJoin = "round";
        ctx.miterLimit = 2;
        ctx.strokeText(displayWord, cursorX + width / 2, lineY);

        if (isCurrentlySpoken) {
          ctx.fillStyle = "#FDE047"; // Vibrant yellow
          ctx.shadowColor = "rgba(253, 224, 71, 0.8)";
          ctx.shadowBlur = Math.round(fontSize * 0.3);
        } else if (isPast) {
          ctx.fillStyle = "#FFFFFF";
          ctx.shadowColor = "transparent";
        } else {
          ctx.fillStyle = "rgba(226, 232, 240, 0.85)";
          ctx.shadowColor = "transparent";
        }
        ctx.fillText(displayWord, cursorX + width / 2, lineY);
      } else if (preset === "emerald-glow") {
        ctx.lineWidth = Math.max(4, Math.round(fontSize * 0.16));
        ctx.strokeStyle = "rgba(10, 16, 20, 0.95)";
        ctx.lineJoin = "round";
        ctx.strokeText(displayWord, cursorX + width / 2, lineY);

        if (isCurrentlySpoken) {
          ctx.fillStyle = "#34D399";
          ctx.shadowColor = "rgba(52, 211, 153, 0.9)";
          ctx.shadowBlur = Math.round(fontSize * 0.35);
        } else if (isPast) {
          ctx.fillStyle = "#E6FFFA";
        } else {
          ctx.fillStyle = "rgba(203, 213, 225, 0.75)";
        }
        ctx.fillText(displayWord, cursorX + width / 2, lineY);
      } else if (preset === "classic-yellow") {
        ctx.lineWidth = Math.max(3, Math.round(fontSize * 0.14));
        ctx.strokeStyle = "rgba(0, 0, 0, 0.9)";
        ctx.lineJoin = "round";
        ctx.strokeText(displayWord, cursorX + width / 2, lineY);

        ctx.fillStyle = isCurrentlySpoken
          ? "#FFF500"
          : isPast
            ? "#FFFFFF"
            : "#E2E8F0";
        ctx.fillText(displayWord, cursorX + width / 2, lineY);
      } else {
        // minimal-clean
        ctx.lineWidth = Math.max(2, Math.round(fontSize * 0.1));
        ctx.strokeStyle = "rgba(0, 0, 0, 0.75)";
        ctx.strokeText(displayWord, cursorX + width / 2, lineY);
        ctx.fillStyle = isCurrentlySpoken
          ? "#FFFFFF"
          : "rgba(241, 245, 249, 0.85)";
        ctx.fillText(displayWord, cursorX + width / 2, lineY);
      }

      ctx.restore();
      cursorX += width + spaceWidth;
    }
  });

  ctx.restore();
}

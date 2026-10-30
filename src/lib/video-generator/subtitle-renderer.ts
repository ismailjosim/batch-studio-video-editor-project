import type {
  Cue,
  SubtitleAnimationOption,
  SubtitleFontOption,
  SubtitlePresetOption,
} from "./types";

export interface DrawSubtitleOptions {
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  cue: Cue & {
    words?: Array<{ word: string; startMs: number; endMs: number }>;
  };
  currentTimeMs: number;
  canvasWidth: number;
  canvasHeight: number;
  preset?: SubtitlePresetOption;
  font?: SubtitleFontOption;
  animation?: SubtitleAnimationOption;
  isPortrait?: boolean;
}

/**
 * Maps high-level font choices to CSS font-family stacks.
 */
export function getFontFamilyStack(font?: SubtitleFontOption): string {
  switch (font) {
    case "Montserrat":
      return "'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif";
    case "Inter":
      return "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    case "Anton":
      return "'Anton', 'Impact', sans-serif";
    case "Poppins":
      return "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif";
    case "Bangers":
      return "'Bangers', 'Impact', cursive, sans-serif";
    default:
      return "Impact, 'Anton', 'Montserrat', sans-serif";
  }
}

/**
 * Calculates in/out cue animation transformations (scale, offsetY, opacity).
 */
function calculateCueAnimation(
  animation: SubtitleAnimationOption,
  cueStartMs: number,
  cueEndMs: number,
  currentTimeMs: number,
): { scale: number; offsetY: number; opacity: number } {
  const cueDuration = Math.max(100, cueEndMs - cueStartMs);
  const timeIntoCue = Math.max(0, currentTimeMs - cueStartMs);
  const timeLeftInCue = Math.max(0, cueEndMs - currentTimeMs);

  if (animation === "none") {
    return { scale: 1.0, offsetY: 0, opacity: 1.0 };
  }

  // Smooth easing helper (cubic ease-out)
  const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
  const easeInCubic = (t: number) => t * t * t;

  let opacity = 1.0;
  let scale = 1.0;
  let offsetY = 0;

  const inDuration = Math.min(220, cueDuration * 0.25);
  const outDuration = Math.min(180, cueDuration * 0.22);

  if (animation === "fade-smooth") {
    if (timeIntoCue < inDuration) {
      opacity = easeOutCubic(timeIntoCue / inDuration);
    } else if (timeLeftInCue < outDuration) {
      opacity = easeInCubic(timeLeftInCue / outDuration);
    }
  } else if (animation === "pop-bounce") {
    if (timeIntoCue < inDuration) {
      const p = timeIntoCue / inDuration;
      opacity = Math.min(1.0, p * 1.5);
      // Spring overshoot: 0.70 -> 1.08 -> 1.0
      if (p < 0.7) {
        scale = 0.7 + (1.08 - 0.7) * (p / 0.7);
      } else {
        scale = 1.08 - 0.08 * ((p - 0.7) / 0.3);
      }
    } else if (timeLeftInCue < outDuration) {
      const p = timeLeftInCue / outDuration;
      opacity = easeInCubic(p);
      scale = 0.85 + 0.15 * p;
    }
  } else if (animation === "slide-up") {
    if (timeIntoCue < inDuration) {
      const p = easeOutCubic(timeIntoCue / inDuration);
      opacity = p;
      offsetY = (1 - p) * 24; // Slide up from +24px
    } else if (timeLeftInCue < outDuration) {
      const p = easeInCubic(timeLeftInCue / outDuration);
      opacity = p;
      offsetY = (1 - p) * -14; // Glides slightly up while fading
    }
  } else if (animation === "zoom-fade") {
    if (timeIntoCue < inDuration) {
      const p = easeOutCubic(timeIntoCue / inDuration);
      opacity = p;
      scale = 0.85 + 0.15 * p;
    } else if (timeLeftInCue < outDuration) {
      const p = easeInCubic(timeLeftInCue / outDuration);
      opacity = p;
      scale = 1.0 + (1 - p) * 0.08;
    }
  }

  return {
    scale: Math.max(0.01, scale),
    offsetY,
    opacity: Math.max(0, Math.min(1, opacity)),
  };
}

/**
 * Safely renders a rounded rectangle on Canvas/OffscreenCanvas.
 */
function drawBadgeRect(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, width, height);
  }
}

/**
 * Renders high-impact burn-in animated subtitles onto the video canvas frame.
 * Supports CapCut karaoke styling, multi-font typography, in/out animations, and live preview.
 */
export function drawSubtitleOverlay({
  ctx,
  cue,
  currentTimeMs,
  canvasWidth,
  canvasHeight,
  preset = "hormozi-pop",
  font = "Impact",
  animation = "pop-bounce",
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
  const fontSize = Math.max(22, Math.min(120, baseFontSize));

  const fontFamily = getFontFamilyStack(font);
  const isUppercase =
    preset === "hormozi-pop" ||
    preset === "beast-bold" ||
    preset === "dollar-doodles-brand";

  ctx.font = `900 ${fontSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Vertical placement: 72% down in portrait (safe from social UI), 86% in landscape
  const targetY = isPortrait ? canvasHeight * 0.72 : canvasHeight * 0.86;

  // Calculate cue In/Out animation state
  const {
    scale: cueScale,
    offsetY: cueOffsetY,
    opacity: cueOpacity,
  } = calculateCueAnimation(animation, cue.startMs, cue.endMs, currentTimeMs);

  if (cueOpacity <= 0) {
    ctx.restore();
    return;
  }

  // Split text into words for karaoke or word-level tracking
  const rawWords = cue.text.trim().split(/\s+/).filter(Boolean);
  if (rawWords.length === 0) {
    ctx.restore();
    return;
  }

  // Check word timings or interpolate smoothly
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

  // Measure and wrap words into lines (max width 86% of canvas)
  const maxLineWidth = canvasWidth * 0.86;
  const lines: Array<typeof wordsWithTiming> = [];
  let currentLine: typeof wordsWithTiming = [];
  let currentLineWidth = 0;
  const spaceWidth = ctx.measureText(" ").width;

  for (const item of wordsWithTiming) {
    const wordText = isUppercase ? item.word.toUpperCase() : item.word;
    const wordWidth = ctx.measureText(wordText).width;

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

  const lineHeight = fontSize * 1.28;
  const totalBlockHeight = lines.length * lineHeight;
  const startY = targetY - totalBlockHeight / 2 + lineHeight / 2;

  // Apply cue in/out animation transform around the center of the subtitle block
  ctx.globalAlpha = cueOpacity;
  if (cueScale !== 1.0 || cueOffsetY !== 0) {
    ctx.translate(canvasWidth / 2, targetY);
    ctx.scale(cueScale, cueScale);
    ctx.translate(-canvasWidth / 2, -targetY + cueOffsetY);
  }

  // Optional boxed-badge background behind each line or block
  if (preset === "boxed-badge") {
    ctx.save();
    ctx.fillStyle = "rgba(10, 12, 18, 0.78)";
    lines.forEach((lineWords, lineIdx) => {
      const lineY = startY + lineIdx * lineHeight;
      let lineW = 0;
      for (const item of lineWords) {
        const text = isUppercase ? item.word.toUpperCase() : item.word;
        lineW += ctx.measureText(text).width;
      }
      lineW += (lineWords.length - 1) * spaceWidth;
      const padX = Math.round(fontSize * 0.5);
      const padY = Math.round(fontSize * 0.22);
      const badgeX = canvasWidth / 2 - lineW / 2 - padX;
      const badgeY =
        lineY - lineHeight / 2 + (lineHeight - fontSize) / 2 - padY;
      const badgeW = lineW + padX * 2;
      const badgeH = fontSize + padY * 2;
      drawBadgeRect(
        ctx,
        badgeX,
        badgeY,
        badgeW,
        badgeH,
        Math.round(fontSize * 0.28),
      );
    });
    ctx.restore();
  }

  // Render each line and word
  lines.forEach((lineWords, lineIdx) => {
    const lineY = startY + lineIdx * lineHeight;

    // Calculate total width of this line
    let totalLineW = 0;
    const measuredWords = lineWords.map((item) => {
      const displayWord = isUppercase ? item.word.toUpperCase() : item.word;
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

      // CapCut / Hormozi active word bounce & scale pop
      if (
        isCurrentlySpoken &&
        preset !== "minimal-clean" &&
        preset !== "boxed-badge"
      ) {
        const wordCenterX = cursorX + width / 2;
        ctx.translate(wordCenterX, lineY);
        ctx.scale(1.14, 1.14);
        ctx.translate(-wordCenterX, -lineY);
      }

      // Configure stroke and fill colors based on style preset
      switch (preset) {
        case "hormozi-pop": {
          ctx.lineWidth = Math.max(4, Math.round(fontSize * 0.18));
          ctx.strokeStyle = "rgba(0, 0, 0, 0.95)";
          ctx.lineJoin = "round";
          ctx.miterLimit = 2;
          ctx.strokeText(displayWord, cursorX + width / 2, lineY);

          if (isCurrentlySpoken) {
            ctx.fillStyle = "#FDE047"; // Vibrant yellow
            ctx.shadowColor = "rgba(253, 224, 71, 0.85)";
            ctx.shadowBlur = Math.round(fontSize * 0.32);
          } else if (isPast) {
            ctx.fillStyle = "#FFFFFF";
            ctx.shadowColor = "transparent";
          } else {
            ctx.fillStyle = "rgba(226, 232, 240, 0.85)";
            ctx.shadowColor = "transparent";
          }
          ctx.fillText(displayWord, cursorX + width / 2, lineY);
          break;
        }

        case "capcut-karaoke": {
          ctx.lineWidth = Math.max(3, Math.round(fontSize * 0.14));
          ctx.strokeStyle = "rgba(0, 0, 0, 0.88)";
          ctx.lineJoin = "round";
          ctx.strokeText(displayWord, cursorX + width / 2, lineY);

          if (isCurrentlySpoken) {
            ctx.fillStyle = "#00F0FF"; // CapCut Electric Neon Blue
            ctx.shadowColor = "rgba(0, 240, 255, 0.9)";
            ctx.shadowBlur = Math.round(fontSize * 0.35);
          } else if (isPast) {
            ctx.fillStyle = "#FFFFFF";
            ctx.shadowColor = "transparent";
          } else {
            ctx.fillStyle = "rgba(203, 213, 225, 0.75)";
            ctx.shadowColor = "transparent";
          }
          ctx.fillText(displayWord, cursorX + width / 2, lineY);
          break;
        }

        case "dollar-doodles-brand": {
          ctx.lineWidth = Math.max(4, Math.round(fontSize * 0.18));
          ctx.strokeStyle = "rgba(10, 15, 20, 0.95)";
          ctx.lineJoin = "round";
          ctx.strokeText(displayWord, cursorX + width / 2, lineY);

          if (isCurrentlySpoken) {
            ctx.fillStyle = "#3DAA72"; // Signature Dollar Doodles Green
            ctx.shadowColor = "rgba(61, 170, 114, 0.95)";
            ctx.shadowBlur = Math.round(fontSize * 0.35);
          } else if (isPast) {
            ctx.fillStyle = "#FFFFFF";
            ctx.shadowColor = "transparent";
          } else {
            ctx.fillStyle = "rgba(240, 243, 246, 0.82)";
            ctx.shadowColor = "transparent";
          }
          ctx.fillText(displayWord, cursorX + width / 2, lineY);
          break;
        }

        case "beast-bold": {
          // Extra thick punchy border
          ctx.lineWidth = Math.max(5, Math.round(fontSize * 0.22));
          ctx.strokeStyle = "#000000";
          ctx.lineJoin = "round";
          ctx.strokeText(displayWord, cursorX + width / 2, lineY);

          if (isCurrentlySpoken) {
            ctx.fillStyle = "#FFEB3B"; // Punchy bright yellow
            ctx.shadowColor = "rgba(255, 235, 59, 0.9)";
            ctx.shadowBlur = Math.round(fontSize * 0.25);
          } else if (isPast) {
            ctx.fillStyle = "#FFFFFF";
          } else {
            ctx.fillStyle = "#E2E8F0";
          }
          ctx.fillText(displayWord, cursorX + width / 2, lineY);
          break;
        }

        case "jc-cyan-glow": {
          ctx.lineWidth = Math.max(4, Math.round(fontSize * 0.16));
          ctx.strokeStyle = "rgba(10, 16, 20, 0.95)";
          ctx.lineJoin = "round";
          ctx.strokeText(displayWord, cursorX + width / 2, lineY);

          if (isCurrentlySpoken) {
            ctx.fillStyle = "#00D2FF"; // Electric Cyan
            ctx.shadowColor = "rgba(0, 210, 255, 0.95)";
            ctx.shadowBlur = Math.round(fontSize * 0.35);
          } else if (isPast) {
            ctx.fillStyle = "#E0F7FF";
          } else {
            ctx.fillStyle = "rgba(203, 213, 225, 0.75)";
          }
          ctx.fillText(displayWord, cursorX + width / 2, lineY);
          break;
        }

        case "emerald-glow": {
          ctx.lineWidth = Math.max(4, Math.round(fontSize * 0.16));
          ctx.strokeStyle = "rgba(6, 20, 15, 0.95)";
          ctx.lineJoin = "round";
          ctx.strokeText(displayWord, cursorX + width / 2, lineY);

          if (isCurrentlySpoken) {
            ctx.fillStyle = "#10B981"; // Emerald
            ctx.shadowColor = "rgba(16, 185, 129, 0.95)";
            ctx.shadowBlur = Math.round(fontSize * 0.35);
          } else if (isPast) {
            ctx.fillStyle = "#ECFDF5";
          } else {
            ctx.fillStyle = "rgba(209, 250, 229, 0.75)";
          }
          ctx.fillText(displayWord, cursorX + width / 2, lineY);
          break;
        }

        case "neon-purple": {
          ctx.lineWidth = Math.max(4, Math.round(fontSize * 0.16));
          ctx.strokeStyle = "rgba(20, 5, 25, 0.95)";
          ctx.lineJoin = "round";
          ctx.strokeText(displayWord, cursorX + width / 2, lineY);

          if (isCurrentlySpoken) {
            ctx.fillStyle = "#D946EF"; // Neon Magenta/Purple
            ctx.shadowColor = "rgba(217, 70, 239, 0.95)";
            ctx.shadowBlur = Math.round(fontSize * 0.35);
          } else if (isPast) {
            ctx.fillStyle = "#FAF5FF";
          } else {
            ctx.fillStyle = "rgba(243, 232, 255, 0.75)";
          }
          ctx.fillText(displayWord, cursorX + width / 2, lineY);
          break;
        }

        case "classic-yellow": {
          ctx.lineWidth = Math.max(3, Math.round(fontSize * 0.14));
          ctx.strokeStyle = "rgba(0, 0, 0, 0.92)";
          ctx.lineJoin = "round";
          ctx.strokeText(displayWord, cursorX + width / 2, lineY);

          ctx.fillStyle = isCurrentlySpoken
            ? "#FFF500"
            : isPast
              ? "#FFFFFF"
              : "#E2E8F0";
          ctx.fillText(displayWord, cursorX + width / 2, lineY);
          break;
        }

        case "boxed-badge": {
          // Inside a dark pill, text is crisp white and active is golden yellow
          if (isCurrentlySpoken) {
            ctx.fillStyle = "#FACC15"; // Warm Gold
            ctx.shadowColor = "rgba(250, 204, 21, 0.6)";
            ctx.shadowBlur = Math.round(fontSize * 0.2);
          } else if (isPast) {
            ctx.fillStyle = "#FFFFFF";
          } else {
            ctx.fillStyle = "rgba(226, 232, 240, 0.85)";
          }
          ctx.fillText(displayWord, cursorX + width / 2, lineY);
          break;
        }

        default: {
          ctx.lineWidth = Math.max(2, Math.round(fontSize * 0.1));
          ctx.strokeStyle = "rgba(0, 0, 0, 0.75)";
          ctx.strokeText(displayWord, cursorX + width / 2, lineY);
          ctx.fillStyle = isCurrentlySpoken
            ? "#FFFFFF"
            : "rgba(241, 245, 249, 0.85)";
          ctx.fillText(displayWord, cursorX + width / 2, lineY);
          break;
        }
      }

      ctx.restore();
      cursorX += width + spaceWidth;
    }
  });

  ctx.restore();
}

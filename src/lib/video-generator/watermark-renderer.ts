import type { WatermarkPosition } from "./types";

interface DrawWatermarkOptions {
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  image: HTMLImageElement | HTMLCanvasElement;
  canvasW: number;
  canvasH: number;
  position?: WatermarkPosition;
  opacity?: number;
  scale?: number; // Relative to canvas width (e.g. 0.14 = 14%)
}

/**
 * Renders a brand watermark / logo overlay onto the video frame canvas.
 */
export function drawWatermarkOverlay({
  ctx,
  image,
  canvasW,
  canvasH,
  position = "top-right",
  opacity = 0.85,
  scale = 0.14,
}: DrawWatermarkOptions): void {
  if (!image || !image.width || !image.height) return;

  ctx.save();
  ctx.globalAlpha = Math.max(0.05, Math.min(1.0, opacity));

  // Compute watermark dimensions preserving natural aspect ratio
  const targetW = canvasW * Math.max(0.05, Math.min(0.35, scale));
  const targetH = targetW * (image.height / image.width);

  // Dynamic margin (3.5% of canvas width)
  const marginX = canvasW * 0.035;
  const marginY = canvasH * 0.045;

  let posX = 0;
  let posY = 0;

  switch (position) {
    case "top-left":
      posX = marginX;
      posY = marginY;
      break;

    case "top-right":
      posX = canvasW - targetW - marginX;
      posY = marginY;
      break;

    case "bottom-left":
      posX = marginX;
      posY = canvasH - targetH - marginY;
      break;

    case "bottom-right":
      posX = canvasW - targetW - marginX;
      posY = canvasH - targetH - marginY;
      break;

    case "center":
      posX = (canvasW - targetW) / 2;
      posY = (canvasH - targetH) / 2;
      break;

    default:
      posX = canvasW - targetW - marginX;
      posY = marginY;
  }

  // Draw logo image
  ctx.drawImage(image, posX, posY, targetW, targetH);
  ctx.restore();
}

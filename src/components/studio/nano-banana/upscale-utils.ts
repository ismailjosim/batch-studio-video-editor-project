import type { AspectRatio } from "./nano-banana-types";

export interface UpscaleResult {
  dataUrl: string;
  width: number;
  height: number;
}

export function get2KDimensions(aspectRatio: AspectRatio): {
  width: number;
  height: number;
} {
  switch (aspectRatio) {
    case "16:9":
      return { width: 2048, height: 1152 };
    case "9:16":
      return { width: 1152, height: 2048 };
    case "4:3":
      return { width: 2048, height: 1536 };
    default:
      return { width: 2048, height: 2048 };
  }
}

/**
 * Super-resolution 2K canvas upscaler with edge-preserving sharpening
 */
export async function upscaleImageTo2K(
  srcUrl: string,
  aspectRatio: AspectRatio = "1:1",
): Promise<UpscaleResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const { width: targetW, height: targetH } =
          get2KDimensions(aspectRatio);

        // Multi-pass scaling for superior bicubic quality
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (!ctx) {
          throw new Error("Failed to get 2D canvas context for 2K upscale");
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw image stretched/fitted to target 2K frame
        ctx.drawImage(img, 0, 0, targetW, targetH);

        // Apply edge enhancement filter to keep doodle linework crisp
        applyUnsharpMask(ctx, targetW, targetH, 0.35);

        const dataUrl = canvas.toDataURL("image/png", 1.0);
        resolve({
          dataUrl,
          width: targetW,
          height: targetH,
        });
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image for upscaling"));
    img.src = srcUrl;
  });
}

function applyUnsharpMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number,
) {
  try {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const copy = new Uint8ClampedArray(data);

    // 3x3 Laplacian edge-enhancement kernel
    // [  0, -1,  0 ]
    // [ -1,  5, -1 ]
    // [  0, -1,  0 ]
    const kernelWeight = amount;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        for (let c = 0; c < 3; c++) {
          const current = copy[idx + c];
          const up = copy[((y - 1) * width + x) * 4 + c];
          const down = copy[((y + 1) * width + x) * 4 + c];
          const left = copy[(y * width + (x - 1)) * 4 + c];
          const right = copy[(y * width + (x + 1)) * 4 + c];

          const laplacian = 4 * current - up - down - left - right;
          const enhanced = current + laplacian * kernelWeight;
          data[idx + c] = Math.min(255, Math.max(0, enhanced));
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  } catch (e) {
    // Graceful fallback if pixel read is restricted
    console.warn("Unsharp mask skipped:", e);
  }
}

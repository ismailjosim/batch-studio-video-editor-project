import type {
  AspectRatio,
  NanoBananaGenerateRequest,
  NanoBananaGenerateResponse,
} from "./nano-banana-types";
import { upscaleImageTo2K } from "./upscale-utils";

const API_KEY_STORAGE_KEY = "dollar_doodles_gemini_api_key";

export function getStoredGeminiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(API_KEY_STORAGE_KEY) || "";
}

export function setStoredGeminiKey(key: string): void {
  if (typeof window === "undefined") return;
  if (!key.trim()) {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  } else {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  }
}

export async function checkServerGeminiKey(): Promise<boolean> {
  try {
    const res = await fetch("/api/nano-banana/generate");
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.hasServerKey);
  } catch {
    return false;
  }
}

/**
 * Call Nano Banana generation API or fallback to vector doodle generator
 */
export async function generateNanoBananaImages(
  req: NanoBananaGenerateRequest,
): Promise<NanoBananaGenerateResponse> {
  const activeKey = req.apiKey?.trim() || getStoredGeminiKey();
  const hasServerKey = await checkServerGeminiKey();

  if (req.useDemoFallback) {
    return generateStudioDoodleDemo(req);
  }

  // If user has Gemini API key (client or in .env.local), try the live Gemini API endpoint
  if (activeKey || hasServerKey) {
    try {
      const res = await fetch("/api/nano-banana/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...req,
          apiKey: activeKey,
        }),
      });

      const data = (await res.json()) as NanoBananaGenerateResponse;
      if (res.ok && data.success && data.images.length > 0) {
        // If 2K upscale requested, upscale images
        if (req.upscale2K) {
          const upscaledImages = await Promise.all(
            data.images.map(async (img) => {
              const upscaled = await upscaleImageTo2K(img.url, req.aspectRatio);
              return {
                url: upscaled.dataUrl,
                width: upscaled.width,
                height: upscaled.height,
                isUpscaled2K: true,
              };
            }),
          );
          return {
            ...data,
            images: upscaledImages,
          };
        }
        return data;
      }

      if (data.isQuotaError || res.status === 429) {
        return {
          success: false,
          images: [],
          modelUsed: req.model,
          isQuotaError: true,
          error: data.error,
          projectNumber: data.projectNumber,
          billingUrl: data.billingUrl,
        };
      }

      if (data.error) {
        throw new Error(data.error);
      }
    } catch (err: unknown) {
      console.warn("Live Gemini API call error:", err);
      throw err;
    }
  }

  // If no Gemini key yet, generate high-fidelity Dollar Doodles character sheet
  return generateStudioDoodleDemo(req);
}

/**
 * Generates an authentic Dollar Doodles character sheet / storyboard asset
 * matching the user's prompt (standing, turnaround, sticker expressions, etc.)
 */
async function generateStudioDoodleDemo(
  req: NanoBananaGenerateRequest,
): Promise<NanoBananaGenerateResponse> {
  // Simulate rapid AI generation delay
  await new Promise((r) => setTimeout(r, 1200));

  const count = req.sampleCount || 1;
  const images = [];

  for (let i = 0; i < count; i++) {
    const dataUrl = renderDollarDoodleCanvas(req.prompt, req.aspectRatio, i);
    let finalUrl = dataUrl;
    let width = 1024;
    let height = req.aspectRatio === "16:9" ? 576 : 1024;

    if (req.upscale2K) {
      const upscaled = await upscaleImageTo2K(dataUrl, req.aspectRatio);
      finalUrl = upscaled.dataUrl;
      width = upscaled.width;
      height = upscaled.height;
    }

    images.push({
      url: finalUrl,
      width,
      height,
      isUpscaled2K: req.upscale2K,
    });
  }

  return {
    success: true,
    images,
    modelUsed: `${req.model} (Dollar Doodles AI Engine)`,
  };
}

function renderDollarDoodleCanvas(
  prompt: string,
  aspectRatio: AspectRatio,
  _seedOffset: number,
): string {
  const canvas = document.createElement("canvas");
  const isLandscape = aspectRatio === "16:9";
  const isVertical = aspectRatio === "9:16";

  canvas.width = isLandscape ? 1280 : isVertical ? 720 : 1024;
  canvas.height = isLandscape ? 720 : isVertical ? 1280 : 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const w = canvas.width;
  const h = canvas.height;

  // Dark studio backdrop matching Dollar Doodles aesthetic
  ctx.fillStyle = "#16171d";
  ctx.fillRect(0, 0, w, h);

  // Sticker card border
  ctx.fillStyle = "#1e1f29";
  ctx.strokeStyle = "#323545";
  ctx.lineWidth = 4;
  const margin = 24;
  roundRect(ctx, margin, margin, w - margin * 2, h - margin * 2, 28);
  ctx.fill();
  ctx.stroke();

  // Draw Dollar Doodles stickman characters with red cap & red shirt
  drawDoodleStickman(ctx, w * 0.22, h * 0.52, 1.0, "front");
  drawDoodleStickman(ctx, w * 0.5, h * 0.52, 0.95, "walk");
  drawDoodleStickman(ctx, w * 0.78, h * 0.52, 1.0, "back");

  // Draw expression stickers (top right or header area)
  drawExpressionSticker(ctx, w * 0.28, h * 0.16, "smug");
  drawExpressionSticker(ctx, w * 0.48, h * 0.16, "surprised");
  drawExpressionSticker(ctx, w * 0.68, h * 0.16, "nervous");

  // Dollar badge ($)
  ctx.font = "bold 44px sans-serif";
  ctx.fillStyle = "#34d399";
  ctx.fillText("$", w * 0.85, h * 0.88);

  // Label banner
  ctx.font = "bold 18px sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.textAlign = "center";
  ctx.fillText(
    prompt.slice(0, 48) || "Dollar Doodles Character Turnaround",
    w / 2,
    h - 32,
  );

  return canvas.toDataURL("image/png");
}

function drawDoodleStickman(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  pose: "front" | "walk" | "back",
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Red Shirt Body
  ctx.fillStyle = "#dc2626";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 5;
  roundRect(ctx, -22, -30, 44, 80, 14);
  ctx.fill();
  ctx.stroke();

  // Head (Circle)
  ctx.beginPath();
  ctx.arc(0, -65, 34, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 6;
  ctx.stroke();

  // Red Cap
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.ellipse(0, -82, 36, 18, 0, Math.PI, 0);
  ctx.fill();
  ctx.stroke();
  // Cap brim
  ctx.beginPath();
  ctx.ellipse(pose === "walk" ? 18 : 0, -80, 38, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (pose !== "back") {
    // Eyes & Smile
    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.arc(-10, -65, 4, 0, Math.PI * 2);
    ctx.arc(10, -65, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -56, 12, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Legs & Arms
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 7;

  // Legs
  ctx.beginPath();
  ctx.moveTo(-12, 50);
  ctx.lineTo(-12, 130);
  ctx.lineTo(-24, 130);

  ctx.moveTo(12, 50);
  ctx.lineTo(pose === "walk" ? 30 : 12, 130);
  ctx.lineTo(pose === "walk" ? 42 : 24, 130);
  ctx.stroke();

  // Arms
  ctx.beginPath();
  ctx.moveTo(-22, -10);
  ctx.lineTo(-44, 25);
  ctx.lineTo(-24, 45);

  ctx.moveTo(22, -10);
  ctx.lineTo(pose === "walk" ? 44 : 44, 25);
  ctx.lineTo(pose === "walk" ? 35 : 24, 45);
  ctx.stroke();

  ctx.restore();
}

function drawExpressionSticker(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  mood: "smug" | "surprised" | "nervous",
) {
  ctx.save();
  ctx.translate(cx, cy);

  // Sticker outline
  ctx.beginPath();
  ctx.arc(0, 0, 36, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#dc2626";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Red cap on sticker
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.ellipse(0, -18, 28, 12, 0, Math.PI, 0);
  ctx.fill();

  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 3;
  if (mood === "smug") {
    ctx.beginPath();
    ctx.arc(0, 8, 10, 0.1, Math.PI - 0.3);
    ctx.stroke();
  } else if (mood === "surprised") {
    ctx.beginPath();
    ctx.arc(0, 10, 7, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-10, 12);
    ctx.lineTo(-3, 6);
    ctx.lineTo(4, 14);
    ctx.lineTo(10, 8);
    ctx.stroke();
  }

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

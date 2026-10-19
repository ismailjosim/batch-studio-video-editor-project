import type { AnimationItem, SfxItem } from "./types";

export const ANIMATIONS_LIST: AnimationItem[] = [
  {
    id: "push",
    name: "Push (Slide Left/Right)",
    desc: "Incoming slide pushes previous slide off frame",
  },
  {
    id: "fade",
    name: "Fade / Cross-Dissolve",
    desc: "Active slide smoothly dissolves into next",
  },
  {
    id: "slide_in",
    name: "Smooth Slide-In (Gliding)",
    desc: "Incoming slide glides over stationary background",
  },
  {
    id: "wipe",
    name: "Wipe (Edge Travel)",
    desc: "A clean edge travels across revealing next slide",
  },
  {
    id: "zoom",
    name: "Zoom In / Scale Out",
    desc: "Expands forward into view or pulls back",
  },
  {
    id: "pan",
    name: "Pan / Drift",
    desc: "Subtle horizontal camera drift focusing on scene",
  },
  {
    id: "cover",
    name: "Cover / Uncover",
    desc: "Slides over or pulls away like paper sheet",
  },
  {
    id: "split",
    name: "Split (Curtain / Barn Door)",
    desc: "Screen parts from center outward",
  },
  {
    id: "iris",
    name: "Iris / Circle Reveal",
    desc: "Expanding circle reveals the incoming slide",
  },
  {
    id: "morph",
    name: "Morph / Smart Match",
    desc: "Dynamic scale and cross-zoom transformation",
  },
];

export const SFX_LIST: SfxItem[] = [
  {
    id: "whoosh",
    name: "Clean Air Whoosh",
    file: "/sfx/whoosh.wav",
    leadTime: 0.15,
  },
  {
    id: "air_woosh",
    name: "Air Whoosh (Long Swell)",
    file: "/sfx/air-woosh.wav",
    leadTime: 0.35,
  },
  {
    id: "arrow_whoosh",
    name: "Arrow Whoosh (Fast Glide)",
    file: "/sfx/arrow-whoosh.wav",
    leadTime: 0.15,
  },
  {
    id: "page_turn",
    name: "Page Turn (Single Sheet)",
    file: "/sfx/page-turn-single.wav",
    leadTime: 0.05,
  },
  {
    id: "page_forward",
    name: "Page Forward Swish",
    file: "/sfx/page-forward-single.wav",
    leadTime: 0.1,
  },
  {
    id: "paper",
    name: "Paper Swish / Shuffle",
    file: "/sfx/paper.wav",
    leadTime: 0.05,
  },
  {
    id: "page_back_chime",
    name: "Page Back Chime (Glass Ping)",
    file: "/sfx/page-back-chime.wav",
    leadTime: 0.0,
  },
  {
    id: "click",
    name: "Crisp UI Click",
    file: "/sfx/click.wav",
    leadTime: 0.0,
  },
  {
    id: "select_click",
    name: "Select Click",
    file: "/sfx/select-click.wav",
    leadTime: 0.0,
  },
  {
    id: "fast_double_click",
    name: "Fast Double Click",
    file: "/sfx/fast-double-click-on-mouse.wav",
    leadTime: 0.0,
  },
  {
    id: "mouse_click_close",
    name: "Mouse Click (Close Mic)",
    file: "/sfx/mouse-click-close.wav",
    leadTime: 0.0,
  },
  {
    id: "interface_click",
    name: "Interface Click Tone",
    file: "/sfx/cool-interface-click-tone.wav",
    leadTime: 0.0,
  },
  { id: "camera", name: "Camera Snap", file: "/sfx/camera.wav", leadTime: 0.0 },
  {
    id: "camera_shutter",
    name: "Camera Shutter Click",
    file: "/sfx/camera-shutter-click.wav",
    leadTime: 0.0,
  },
  { id: "wood", name: "Wood Block Pop", file: "/sfx/wood.wav", leadTime: 0.0 },
  {
    id: "whip",
    name: "Whip Crack / Snap",
    file: "/sfx/whip.wav",
    leadTime: 0.0,
  },
  {
    id: "boom",
    name: "Low Cinematic Boom",
    file: "/sfx/boom.wav",
    leadTime: 0.0,
  },
  {
    id: "small_glitch",
    name: "Small Electric Glitch",
    file: "/sfx/small-electric-glitch.wav",
    leadTime: 0.0,
  },
  {
    id: "glitch_roar",
    name: "Glitch Roar (Heavy Zap)",
    file: "/sfx/glitch-roar.wav",
    leadTime: 0.05,
  },
  {
    id: "modern_tech",
    name: "Modern Tech Accent",
    file: "/sfx/modern-technology.wav",
    leadTime: 0.0,
  },
];

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function drawFitImage(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement | null | undefined,
  canvasW: number,
  canvasH: number,
  scaleMultiplier = 1.0,
  offsetX = 0,
  offsetY = 0,
  alpha = 1.0,
): void {
  if (!img) return;
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  const scaleW = canvasW / img.width;
  const scaleH = canvasH / img.height;
  const baseScale = Math.max(scaleW, scaleH);
  const finalScale = baseScale * scaleMultiplier;

  const drawW = img.width * finalScale;
  const drawH = img.height * finalScale;
  const drawX = (canvasW - drawW) / 2 + offsetX;
  const drawY = (canvasH - drawH) / 2 + offsetY;

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();
}

export function renderTransition(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  animType: string,
  prevImg: HTMLImageElement | HTMLCanvasElement | null | undefined,
  currImg: HTMLImageElement | HTMLCanvasElement | null | undefined,
  progress: number,
  aspectW: number,
  aspectH: number,
): void {
  const p = easeInOutQuad(progress);

  switch (animType) {
    case "push": {
      const offset = aspectW * p;
      drawFitImage(ctx, prevImg, aspectW, aspectH, 1.0, -offset, 0);
      drawFitImage(ctx, currImg, aspectW, aspectH, 1.0, aspectW - offset, 0);
      break;
    }

    case "fade": {
      drawFitImage(ctx, prevImg, aspectW, aspectH, 1.0, 0, 0, 1.0);
      drawFitImage(ctx, currImg, aspectW, aspectH, 1.0, 0, 0, p);
      break;
    }

    case "slide_in": {
      drawFitImage(ctx, prevImg, aspectW, aspectH, 1.0, 0, 0);
      const offsetX = aspectW * (1.0 - p);
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 24;
      drawFitImage(ctx, currImg, aspectW, aspectH, 1.0, offsetX, 0);
      ctx.restore();
      break;
    }

    case "wipe": {
      drawFitImage(ctx, prevImg, aspectW, aspectH, 1.0, 0, 0);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, aspectW * p, aspectH);
      ctx.clip();
      drawFitImage(ctx, currImg, aspectW, aspectH, 1.0, 0, 0);
      ctx.restore();
      break;
    }

    case "zoom": {
      const prevScale = 1.0 + 0.15 * p;
      const currScale = 0.85 + 0.15 * p;
      drawFitImage(ctx, prevImg, aspectW, aspectH, prevScale, 0, 0, 1.0 - p);
      drawFitImage(ctx, currImg, aspectW, aspectH, currScale, 0, 0, p);
      break;
    }

    case "pan": {
      const panOffset = aspectW * 0.08 * p;
      drawFitImage(
        ctx,
        prevImg,
        aspectW,
        aspectH,
        1.08,
        -panOffset,
        0,
        1.0 - p,
      );
      drawFitImage(
        ctx,
        currImg,
        aspectW,
        aspectH,
        1.08,
        aspectW * 0.08 - panOffset,
        0,
        p,
      );
      break;
    }

    case "cover": {
      drawFitImage(ctx, prevImg, aspectW, aspectH, 1.0, 0, 0);
      const offsetY = aspectH * (1.0 - p);
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
      ctx.shadowBlur = 30;
      drawFitImage(ctx, currImg, aspectW, aspectH, 1.0, 0, offsetY);
      ctx.restore();
      break;
    }

    case "split": {
      drawFitImage(ctx, currImg, aspectW, aspectH, 1.0, 0, 0);
      const splitDist = (aspectW / 2) * p;

      // Left curtain
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, aspectW / 2 - splitDist, aspectH);
      ctx.clip();
      drawFitImage(ctx, prevImg, aspectW, aspectH, 1.0, -splitDist, 0);
      ctx.restore();

      // Right curtain
      ctx.save();
      ctx.beginPath();
      ctx.rect(aspectW / 2 + splitDist, 0, aspectW / 2, aspectH);
      ctx.clip();
      drawFitImage(ctx, prevImg, aspectW, aspectH, 1.0, splitDist, 0);
      ctx.restore();
      break;
    }

    case "iris": {
      drawFitImage(ctx, prevImg, aspectW, aspectH, 1.0, 0, 0);
      const maxRadius = Math.hypot(aspectW / 2, aspectH / 2);
      const radius = maxRadius * p;

      ctx.save();
      ctx.beginPath();
      ctx.arc(aspectW / 2, aspectH / 2, radius, 0, Math.PI * 2);
      ctx.clip();
      drawFitImage(ctx, currImg, aspectW, aspectH, 1.0, 0, 0);
      ctx.restore();
      break;
    }

    case "morph": {
      const scaleOut = 1.0 + 0.25 * p;
      const scaleIn = 1.25 - 0.25 * p;
      drawFitImage(ctx, prevImg, aspectW, aspectH, scaleOut, 0, 0, 1.0 - p);
      drawFitImage(ctx, currImg, aspectW, aspectH, scaleIn, 0, 0, p);
      break;
    }

    default:
      drawFitImage(ctx, currImg, aspectW, aspectH, 1.0, 0, 0);
  }
}

export function createDemoSlide(
  number: number,
  title: string,
  subtitle: string,
  bgColor: string,
  accentColor: string,
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 960;
  const ctx = c.getContext("2d");
  if (!ctx) return c;

  const grad = ctx.createRadialGradient(480, 270, 40, 480, 270, 520);
  grad.addColorStop(0, bgColor);
  grad.addColorStop(1, "#07070a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 960, 540);

  // Background decorative grid
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  for (let x = 30; x < 960; x += 40) {
    for (let y = 30; y < 540; y += 40) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Outer border frame
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, 904, 484);

  // Accent pill badge
  ctx.save();
  ctx.fillStyle = accentColor;
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.roundRect(480 - 110, 150, 220, 36, 18);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(480 - 110, 150, 220, 36, 18);
  ctx.stroke();

  ctx.fillStyle = accentColor;
  ctx.font = "bold 13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`SCENE 0${number} • STORYBOARD`, 480, 168);

  // Headline
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 44px system-ui, sans-serif";
  ctx.fillText(title, 480, 245);

  // Subtitle
  ctx.fillStyle = "#9B9BAE";
  ctx.font = "500 17px system-ui, sans-serif";
  ctx.fillText(subtitle, 480, 305);

  // Bottom bar indicator
  ctx.fillStyle = accentColor;
  ctx.fillRect(480 - 40, 350, 80, 4);

  return c;
}

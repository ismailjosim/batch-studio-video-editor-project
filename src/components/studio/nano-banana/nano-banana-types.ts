export type NanoBananaModel =
  | "nano-banana-pro"
  | "nano-banana-2.1"
  | "nano-banana-2-lite";

export interface ModelConfig {
  id: NanoBananaModel;
  name: string;
  badge: string;
  description: string;
  geminiModel: string;
  supportsReference: boolean;
  maxResolution: string;
  recommendedFor: string;
}

export const NANO_BANANA_MODELS: ModelConfig[] = [
  {
    id: "nano-banana-pro",
    name: "Nano Banana Pro",
    badge: "2K Studio",
    description: "Highest fidelity, studio-grade consistency & 2K resolution",
    geminiModel: "imagen-3.0-generate-002",
    supportsReference: true,
    maxResolution: "2048x1152 (2K)",
    recommendedFor: "Final high-res storyboard panels & detailed art",
  },
  {
    id: "nano-banana-2.1",
    name: "Nano Banana 2.1",
    badge: "Multi-Ref",
    description:
      "Consistent character turnarounds & multi-reference style transfer",
    geminiModel: "gemini-2.0-flash",
    supportsReference: true,
    maxResolution: "1024x1024 / 2K",
    recommendedFor: "Character sheets, turnarounds & expressive stickmen",
  },
  {
    id: "nano-banana-2-lite",
    name: "Nano Banana 2 Lite",
    badge: "Fast Draft",
    description: "Ultra-fast concept generation & rapid storyboard ideation",
    geminiModel: "gemini-2.0-flash",
    supportsReference: false,
    maxResolution: "1024x1024",
    recommendedFor: "Rapid storyboard drafting & quick concept sketches",
  },
];

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3";

export interface ReferenceImage {
  id: string;
  name: string;
  dataUrl: string; // base64 data url
  mimeType: string;
  base64Data: string;
}

export interface GeneratedAsset {
  id: string;
  url: string; // base64 or object URL
  prompt: string;
  model: NanoBananaModel;
  aspectRatio: AspectRatio;
  isUpscaled2K: boolean;
  width: number;
  height: number;
  createdAt: number;
  referenceImageCount: number;
}

export interface NanoBananaGenerateRequest {
  prompt: string;
  model: NanoBananaModel;
  aspectRatio: AspectRatio;
  sampleCount: number;
  upscale2K: boolean;
  referenceImages?: Array<{
    mimeType: string;
    base64Data: string;
  }>;
  apiKey?: string;
}

export interface NanoBananaGenerateResponse {
  success: boolean;
  images: Array<{
    url: string;
    width: number;
    height: number;
    isUpscaled2K: boolean;
  }>;
  modelUsed: string;
  error?: string;
}

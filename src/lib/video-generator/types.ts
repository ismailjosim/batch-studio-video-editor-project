export interface Cue {
  id: number;
  startMs: number;
  endMs: number;
  text: string;
}

export interface SRTData {
  cues: Cue[];
  fileName: string;
}

export interface AnimationItem {
  id: string;
  name: string;
  desc: string;
}

export interface SfxItem {
  id: string;
  name: string;
  file: string;
  leadTime: number;
}

export type ResolutionOption = "1440" | "1080" | "720";
export type AspectRatioOption = "16:9" | "9:16";

export type WatermarkPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "center";

export interface VideoSettings {
  resolution: ResolutionOption;
  aspectRatio: AspectRatioOption;
  fps: number;
  bitrate: number;
  isSfxEnabled: boolean;
  animMode: "random" | "custom";
  selectedAnims: Set<string>;
  sfxMode: "random" | "custom";
  selectedSfx: Set<string>;
  isSubtitleBurnInEnabled?: boolean;
  subtitlePreset?:
    | "hormozi-pop"
    | "jc-cyan-glow"
    | "emerald-glow"
    | "classic-yellow"
    | "minimal-clean";
  // Brand Watermark Overlay
  isWatermarkEnabled?: boolean;
  watermarkImage?: HTMLImageElement | null;
  watermarkPosition?: WatermarkPosition;
  watermarkOpacity?: number; // 0.1 to 1.0
  watermarkScale?: number; // 0.05 to 0.30
  // Visual Storyboard Cue Mapping: maps cue index -> image index
  cueAssetMap?: Record<number, number>;
}

export interface RenderProgress {
  status:
    | "idle"
    | "preparing"
    | "encoding_audio"
    | "encoding_video"
    | "finalizing"
    | "completed"
    | "canceled"
    | "error";
  statusText: string;
  percent: number;
  currentFrame: number;
  totalFrames: number;
  fpsSpeed: number;
  remainingSec: number;
  currentScene: number;
  totalScenes: number;
  currentAnim: string;
  errorMessage?: string;
  outputBlobUrl?: string;
}

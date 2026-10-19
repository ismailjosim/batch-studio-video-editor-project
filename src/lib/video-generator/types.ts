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

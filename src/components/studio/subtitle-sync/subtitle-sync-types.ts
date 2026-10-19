import type { Cue } from "@/lib/video-generator/types";

export interface WordTiming {
  word: string;
  startMs: number;
  endMs: number;
}

export interface SubtitleCue extends Cue {
  id: number;
  startMs: number;
  endMs: number;
  text: string;
  words?: WordTiming[];
}

export interface BgmTrackSettings {
  url: string | null;
  fileName: string;
  volume: number; // 0.0 - 1.0
  isDuckingEnabled: boolean;
  duckingAmount: number; // 0.0 - 1.0 (how much to attenuate during voiceover)
}

export interface HistorySnapshot {
  cues: SubtitleCue[];
  selectedId: number | null;
}

export interface AudioMetadata {
  name: string;
  duration: number; // in seconds
  sampleRate?: number;
  channels?: number;
  fileSize?: number;
}

export type TimelineZoom = number; // percentage (50% to 600%)

export interface SubtitleSyncState {
  cues: SubtitleCue[];
  selectedId: number | null;
  audioFile: File | null;
  audioUrl: string | null;
  audioDuration: number; // seconds
  waveformPeaks: number[];
  isPlaying: boolean;
  currentTime: number; // seconds
  zoom: TimelineZoom;
  fileName: string;
  isAudioLoading: boolean;
  statusMessage: string;
}

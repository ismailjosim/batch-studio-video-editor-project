import type { SRTData } from "@/lib/video-generator/types";

export interface ParsedSubtitle {
  id: number;
  timecode: string;
  startTime: string;
  endTime: string;
  text: string;
  originalBlock: string;
  startMs: number;
  endMs: number;
}

export interface SplitBatch {
  batchNumber: number;
  batchStr: string;
  subtitles: ParsedSubtitle[];
  firstId: number;
  lastId: number;
  timeRange: string;
  durationFormatted: string;
  srtContent: string;
  txtContent: string;
}

export interface SrtBatchSplitterProps {
  onSendToGenerator?: (batchData: SRTData) => void;
}

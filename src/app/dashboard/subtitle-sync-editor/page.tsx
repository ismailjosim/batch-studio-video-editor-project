import type { Metadata } from "next";
import { SubtitleSyncClient } from "@/components/dashboard/subtitle-sync-editor/SubtitleSyncClient";

export const metadata: Metadata = {
  title: "Subtitle Studio & Sync Editor — Audio Waveform Precision Tool",
  description:
    "Interactive subtitle synchronization editor with decoded audio waveform, cue edge resizing, playhead needle splitting, and SRT export.",
};

export default function SubtitleSyncEditorPage() {
  return <SubtitleSyncClient />;
}

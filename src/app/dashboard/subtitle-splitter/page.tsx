import type { Metadata } from "next";
import { SubtitleSplitterClient } from "@/components/dashboard/subtitle-splitter/SubtitleSplitterClient";

export const metadata: Metadata = {
  title: "SRT Batch Splitter — Smart Subtitle Packager & ZIP Exporter",
  description:
    "Split large .srt subtitle files into 4, 9, 12, or 16-cue batches with one-click ZIP download and direct Video Generator transfer.",
};

export default function SubtitleSplitterPage() {
  return <SubtitleSplitterClient />;
}

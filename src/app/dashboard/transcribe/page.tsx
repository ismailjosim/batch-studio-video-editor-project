import type { Metadata } from "next";
import { TranscribeStudioClient } from "@/components/dashboard/transcribe/TranscribeStudioClient";

export const metadata: Metadata = {
  title: "AI Audio Transcriber & Subtitle Generator — Whisper Large-v3",
  description:
    "Convert voiceover audio into sentence-level and word-by-word SRT subtitles or raw text scripts using Whisper AI with instant studio sync.",
};

export default function TranscribePage() {
  return <TranscribeStudioClient />;
}

import type { Metadata } from "next";
import { AudioStudioClient } from "@/components/dashboard/audio-studio/AudioStudioClient";

export const metadata: Metadata = {
  title: "Audio & Voice Studio — AI Voiceover & TTS Speech Synthesis",
  description:
    "Generate studio-quality voiceovers from text scripts with speech synthesis, audio visualizer, and 1-click transfer across the Dollar Doodles Suite.",
};

export default function AudioStudioPage() {
  return <AudioStudioClient />;
}

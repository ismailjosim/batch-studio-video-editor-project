import type { Metadata } from "next";
import { ImageGeneratorClient } from "@/components/dashboard/image-generator/ImageGeneratorClient";

export const metadata: Metadata = {
  title: "AI Image Generator — FLUX.1 & Gemini 2K Studio",
  description:
    "Generate consistent Dollar Doodles character turnarounds, sticker packs, and 2K storyboards using FLUX.1, Google Gemini Pro, and multi-model AI.",
};

export default function ImageGeneratorPage() {
  return <ImageGeneratorClient />;
}

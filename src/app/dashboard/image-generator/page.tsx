import type { Metadata } from "next";
import { ImageGeneratorClient } from "@/components/dashboard/image-generator/ImageGeneratorClient";

export const metadata: Metadata = {
  title:
    "Nano Banana AI Studio — Gemini Pro 2K Storyboard & Character Generator",
  description:
    "Generate multi-perspective character turnarounds and 2K storyboards using Google Gemini Pro with reference conditioning.",
};

export default function ImageGeneratorPage() {
  return <ImageGeneratorClient />;
}

import type { Metadata } from "next";
import { PromptStudioClient } from "@/components/dashboard/prompt-studio/PromptStudioClient";

export const metadata: Metadata = {
  title: "Dollar Doodles AI Director — Prompts 2 & 3 Studio",
  description:
    "Generate consistent 2D Stickman scene prompts for Google Flow (02-Style.txt, 02-Scene-Prompts.txt) and viral YouTube metadata packaging (03-Metadata.txt) powered by Google Gemini.",
};

export default function PromptStudioPage() {
  return <PromptStudioClient />;
}

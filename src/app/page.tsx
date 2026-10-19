import type { Metadata } from "next";
import { StudioDashboard } from "@/components/dashboard/StudioDashboard";

export const metadata: Metadata = {
  title:
    "Dollar Doodles Studio Suite — 2K SRT Video Generator & Batch Splitter",
  description:
    "Hardware-accelerated 2K/1080p MP4 video generator, transition engine, and batch SRT splitter built for creators.",
};

export default function Page() {
  return <StudioDashboard />;
}

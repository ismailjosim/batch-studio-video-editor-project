import type { Metadata } from "next";
import { VideoEditorClient } from "@/components/dashboard/video-editor/VideoEditorClient";

export const metadata: Metadata = {
  title: "SRT Video Generator — 2K Hardware GPU MP4 Studio",
  description:
    "Generate hardware-accelerated 2K/1080p MP4 videos with subtitle sync, transitions, and audio SFX.",
};

export default function VideoEditorPage() {
  return <VideoEditorClient />;
}

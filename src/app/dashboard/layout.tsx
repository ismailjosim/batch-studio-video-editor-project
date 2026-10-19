import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: "Dashboard — Batch Studio Suite (by JC Design)",
  description:
    "Production suite featuring 2K SRT Video Generator, Whisper AI Transcriber, Subtitle Precision Studio, and AI Voiceover.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}

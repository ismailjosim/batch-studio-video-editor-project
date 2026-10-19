import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: "Dashboard — Dollar Doodles Studio Suite",
  description:
    "Production suite featuring 2K SRT Video Generator, SRT Batch Splitter, and Nano Banana Gemini Pro AI.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}

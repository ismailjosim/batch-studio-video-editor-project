"use client";

import {
  Film,
  FolderGit2,
  LayoutDashboard,
  Menu,
  Scissors,
  Sparkles,
  Wand2,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AuthGate } from "@/components/studio/AuthGate";
import { ProjectsHistoryModal } from "@/components/studio/ProjectsHistoryModal";
import { useSession } from "@/lib/auth-client";
import { DashboardSidebar } from "./DashboardSidebar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { data: session, isPending: isSessionPending } = useSession();
  const pathname = usePathname();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [projectsModalOpen, setProjectsModalOpen] = useState(false);

  if (isSessionPending) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-[#0a0b10]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/25 animate-pulse">
            <Sparkles className="w-6 h-6 text-black" />
          </div>
          <span className="text-xs font-semibold text-slate-300">
            Checking studio access...
          </span>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return <AuthGate />;
  }

  const isOverview =
    pathname === "/dashboard/overview" || pathname === "/dashboard";
  const isVideoEditor = pathname.startsWith("/dashboard/video-editor");
  const isSplitter = pathname.startsWith("/dashboard/subtitle-splitter");
  const isImageGen = pathname.startsWith("/dashboard/image-generator");

  return (
    <div className="min-h-screen bg-[#0a0b10] text-slate-100 flex">
      {/* 1. Dashboard Sidebar */}
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenProjectsModal={() => setProjectsModalOpen(true)}
      />

      {/* 2. Main Right Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        {/* Top Navigation & Status Bar */}
        <header className="sticky top-0 z-30 w-full flex items-center justify-between gap-4 py-3 px-4 md:px-8 bg-[#0c0d14]/80 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 hidden sm:inline">Suite</span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <span className="font-bold text-white flex items-center gap-1.5">
                {isOverview && (
                  <>
                    <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Studio Overview & Metrics</span>
                  </>
                )}
                {isVideoEditor && (
                  <>
                    <Film className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SRT Video Generator</span>
                  </>
                )}
                {isSplitter && (
                  <>
                    <Scissors className="w-3.5 h-3.5 text-teal-400" />
                    <span>SRT Batch Splitter</span>
                  </>
                )}
                {isImageGen && (
                  <>
                    <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>AI Image Generator Studio</span>
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setProjectsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Cloud Projects</span>
            </button>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-6">
          {children}

          <footer className="text-center text-slate-500 text-xs py-4 mt-auto border-t border-white/5">
            Dollar Doodles Studio Suite • Hardware WebCodecs Video, SRT Batch
            Splitter & Gemini Pro Nano Banana
          </footer>
        </main>
      </div>

      {projectsModalOpen && (
        <ProjectsHistoryModal onClose={() => setProjectsModalOpen(false)} />
      )}
    </div>
  );
}

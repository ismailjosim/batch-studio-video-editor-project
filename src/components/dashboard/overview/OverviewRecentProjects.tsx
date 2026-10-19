"use client";

import { ArrowRight, Clock, Film, FolderGit2, Plus } from "lucide-react";
import Link from "next/link";

export interface RecentProjectItem {
  _id?: string;
  title: string;
  resolution: string;
  aspectRatio: string;
  cuesCount?: number;
  imagesCount?: number;
  updatedAt?: string;
}

interface OverviewRecentProjectsProps {
  projects: RecentProjectItem[];
  onOpenProjectsModal?: () => void;
}

export function OverviewRecentProjects({
  projects,
  onOpenProjectsModal,
}: OverviewRecentProjectsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-cyan-400" />
          <span>Recent Cloud Projects</span>
        </h3>
        {onOpenProjectsModal && (
          <button
            type="button"
            onClick={onOpenProjectsModal}
            className="text-xs text-cyan-400 hover:underline font-semibold cursor-pointer"
          >
            View All ({projects.length})
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="p-8 rounded-3xl border border-white/10 bg-[#0e1018]/60 backdrop-blur-md flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-200">
              No saved projects yet
            </span>
            <span className="text-xs text-slate-500 max-w-sm mt-0.5">
              Create your first project in the SRT Video Generator to save
              configurations and animation presets.
            </span>
          </div>
          <Link
            href="/dashboard/video-editor"
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#00d2ff] via-[#38bdf8] to-[#0284c7] hover:brightness-110 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Video Project</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {projects.map((p) => {
            const formattedDate = p.updatedAt
              ? new Date(p.updatedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Recently";

            return (
              <div
                key={p._id || p.title}
                className="group p-4 rounded-2xl border border-white/10 bg-[#0e1018]/80 hover:bg-white/5 transition-all flex items-center justify-between gap-3 shadow-md"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                    <Film className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                      {p.title}
                    </span>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-300 font-mono text-[10px]">
                        {p.resolution}p • {p.aspectRatio}
                      </span>
                      <span>•</span>
                      <span>{p.cuesCount ?? 0} cues</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-500 items-center gap-1 hidden sm:flex">
                    <Clock className="w-3 h-3" />
                    {formattedDate}
                  </span>
                  <Link
                    href="/dashboard/video-editor"
                    className="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 border border-white/10 transition-all cursor-pointer"
                    title="Open in Video Editor"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

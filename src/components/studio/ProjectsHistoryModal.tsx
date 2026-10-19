"use client";

import { Film, FolderGit2, History, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { IGenerationHistory, IVideoProject } from "@/lib/models";
import type { VideoSettings } from "@/lib/video-generator/types";

interface ProjectsHistoryModalProps {
  onClose: () => void;
  onLoadProjectSettings?: (settings: Partial<VideoSettings>) => void;
}

export function ProjectsHistoryModal({
  onClose,
  onLoadProjectSettings,
}: ProjectsHistoryModalProps) {
  const [activeTab, setActiveTab] = useState<"projects" | "history">(
    "projects",
  );
  const [projects, setProjects] = useState<IVideoProject[]>([]);
  const [history, setHistory] = useState<IGenerationHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [projRes, histRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/history"),
      ]);
      const projData = await projRes.json();
      const histData = await histRes.json();

      if (projData.success) setProjects(projData.projects || []);
      if (histData.success) setHistory(histData.history || []);
    } catch (err) {
      console.error("Error fetching projects data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApplySettings = (proj: IVideoProject) => {
    if (onLoadProjectSettings) {
      onLoadProjectSettings({
        resolution: proj.resolution,
        aspectRatio: proj.aspectRatio,
        fps: proj.fps,
        bitrate: proj.bitrate,
        animMode: proj.animMode,
        selectedAnims: new Set(proj.selectedAnims),
        sfxMode: proj.sfxMode,
        selectedSfx: new Set(proj.selectedSfx),
        isSfxEnabled: proj.isSfxEnabled,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-[#121218] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/2">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">
              MongoDB Cloud Projects & History
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchData}
              title="Refresh"
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-black/40 px-4">
          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "projects"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Saved Projects ({projects.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "history"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Render Logs ({history.length})</span>
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-500">
              Loading data from MongoDB...
            </div>
          ) : activeTab === "projects" ? (
            projects.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">
                No saved projects yet. Click &apos;Save Project in DB&apos;
                after generating a video!
              </div>
            ) : (
              projects.map((proj, idx) => (
                <div
                  key={proj.title ? `${proj.title}-${idx}` : idx}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-white/2 hover:bg-white/5 transition-all"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {proj.title}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono text-[10px]">
                        {proj.resolution === "1440"
                          ? "2K 1440p"
                          : proj.resolution === "1080"
                            ? "1080p"
                            : "720p"}
                      </span>
                      <span>{proj.aspectRatio}</span>
                      <span>•</span>
                      <span>{proj.cuesCount} cues</span>
                      <span>•</span>
                      <span>{proj.imagesCount} images</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplySettings(proj)}
                    className="px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold shrink-0 cursor-pointer transition-all ml-3"
                  >
                    Load Settings
                  </button>
                </div>
              ))
            )
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              No generation logs recorded yet.
            </div>
          ) : (
            history.map((item, idx) => (
              <div
                key={item.title ? `${item.title}-${idx}` : idx}
                className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-white/2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <Film className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{item.resolution}</span>
                      <span>•</span>
                      <span>{item.durationSec}s</span>
                      {item.encodingSpeedFps && (
                        <span>• {item.encodingSpeedFps} FPS</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold shrink-0">
                  <span>Completed</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

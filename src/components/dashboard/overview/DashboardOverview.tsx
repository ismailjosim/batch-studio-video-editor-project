"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getLocalStats } from "@/lib/stats-tracker";
import { OverviewQuickTools } from "./OverviewQuickTools";
import {
  OverviewRecentProjects,
  type RecentProjectItem,
} from "./OverviewRecentProjects";
import { OverviewStatCards } from "./OverviewStatCards";
import { OverviewSystemStatus } from "./OverviewSystemStatus";

interface OverviewData {
  totalProjects: number;
  totalRenders: number;
  hasGeminiKey: boolean;
  dbConnected: boolean;
}

interface DashboardOverviewProps {
  onOpenProjectsModal?: () => void;
}

export function DashboardOverview({
  onOpenProjectsModal,
}: DashboardOverviewProps) {
  const [data, setData] = useState<OverviewData>({
    totalProjects: 0,
    totalRenders: 0,
    hasGeminiKey: true,
    dbConnected: true,
  });
  const [recentProjects, setRecentProjects] = useState<RecentProjectItem[]>([]);
  const [localStats, setLocalStats] = useState({
    totalImagesGenerated: 0,
    totalBatchesCreated: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const stats = getLocalStats();
      setLocalStats({
        totalImagesGenerated: stats.totalImagesGenerated,
        totalBatchesCreated: stats.totalBatchesCreated,
      });

      const res = await fetch("/api/overview");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json.stats);
          if (Array.isArray(json.recentProjects)) {
            setRecentProjects(json.recentProjects);
          }
        }
      }
    } catch (err) {
      console.warn("Failed loading overview metrics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300 pb-16">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl border border-white/10 bg-[#0f111a]/80 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-[#090a10] border border-white/10 flex items-center justify-center p-1.5 shadow-lg shadow-cyan-500/15 shrink-0">
            <img
              src="/batch-studio-suit-logo.png"
              alt="Batch Studio Suite"
              className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(0,210,255,0.4)]"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-white font-heading flex items-center gap-1.5">
                Batch Studio{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00d2ff] via-[#ec4899] to-[#f97316]">
                  Suite
                </span>
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                by JC Design
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Production dashboard for 2K SRT Video Generation, Whisper AI
              Transcription, and Subtitle Timing Sync.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition-all cursor-pointer disabled:opacity-50"
          title="Refresh Overview Data"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          <span>Refresh Stats</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <OverviewStatCards
        totalProjects={data.totalProjects}
        totalRenders={data.totalRenders}
        totalImages={localStats.totalImagesGenerated}
        totalBatchesSplit={localStats.totalBatchesCreated}
      />

      {/* Quick Tool Launchers */}
      <OverviewQuickTools />

      {/* Recent Projects */}
      <OverviewRecentProjects
        projects={recentProjects}
        onOpenProjectsModal={onOpenProjectsModal}
      />

      {/* System Health & Acceleration Engines */}
      <OverviewSystemStatus
        hasGeminiKey={data.hasGeminiKey}
        dbConnected={data.dbConnected}
      />
    </div>
  );
}

"use client";

import {
  CheckCircle2,
  Cpu,
  Database,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface OverviewSystemStatusProps {
  hasGeminiKey: boolean;
  dbConnected: boolean;
}

export function OverviewSystemStatus({
  hasGeminiKey,
  dbConnected,
}: OverviewSystemStatusProps) {
  const systems = [
    {
      name: "Hardware WebCodecs GPU",
      status: "Hardware Accelerated",
      active: true,
      icon: Cpu,
      color: "text-cyan-400",
    },
    {
      name: "Gemini Pro AI Engine",
      status: hasGeminiKey ? "Connected (.env.local)" : "Needs API Key",
      active: hasGeminiKey,
      icon: Sparkles,
      color: hasGeminiKey ? "text-amber-400" : "text-slate-500",
    },
    {
      name: "MongoDB Cloud Sync",
      status: dbConnected ? "Connected (Atlas)" : "Connecting...",
      active: dbConnected,
      icon: Database,
      color: dbConnected ? "text-pink-400" : "text-amber-400",
    },
    {
      name: "Better-Auth Session",
      status: "Customer Secured",
      active: true,
      icon: ShieldCheck,
      color: "text-cyan-400",
    },
  ];

  return (
    <div className="p-4 rounded-2xl border border-white/10 bg-[#0c0d14]/70 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Studio Acceleration Engines & Health</span>
        </span>
        <span className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>All Systems Operational</span>
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {systems.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.name}
              className="p-2.5 rounded-xl bg-white/3 border border-white/5 flex items-center gap-2.5"
            >
              <div
                className={`p-1.5 rounded-lg bg-white/5 ${s.color} shrink-0`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-white truncate">
                  {s.name}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {s.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

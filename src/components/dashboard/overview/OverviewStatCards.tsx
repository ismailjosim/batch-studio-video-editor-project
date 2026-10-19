"use client";

import { Film, FolderGit2, Scissors, Wand2 } from "lucide-react";
import Link from "next/link";

interface OverviewStatCardsProps {
  totalProjects: number;
  totalRenders: number;
  totalImages: number;
  totalBatchesSplit: number;
}

export function OverviewStatCards({
  totalProjects,
  totalRenders,
  totalImages,
  totalBatchesSplit,
}: OverviewStatCardsProps) {
  const cards = [
    {
      title: "Saved Projects",
      value: totalProjects,
      description: "Database backed video projects",
      icon: FolderGit2,
      gradient: "from-emerald-500/15 via-emerald-500/5 to-transparent",
      borderColor: "border-emerald-500/30",
      iconColor: "text-emerald-400 bg-emerald-500/10",
      href: "/dashboard/video-editor",
      badgeText: "MongoDB",
    },
    {
      title: "2K Videos Rendered",
      value: totalRenders,
      description: "Hardware GPU WebCodecs exports",
      icon: Film,
      gradient: "from-teal-500/15 via-teal-500/5 to-transparent",
      borderColor: "border-teal-500/30",
      iconColor: "text-teal-400 bg-teal-500/10",
      href: "/dashboard/video-editor",
      badgeText: "2K MP4",
    },
    {
      title: "AI Images Generated",
      value: totalImages,
      description: "Gemini Pro 2K character assets",
      icon: Wand2,
      gradient: "from-amber-500/15 via-amber-500/5 to-transparent",
      borderColor: "border-amber-500/30",
      iconColor: "text-amber-400 bg-amber-500/10",
      href: "/dashboard/image-generator",
      badgeText: "Gemini Pro",
    },
    {
      title: "Subtitle Batches",
      value: totalBatchesSplit,
      description: "Multi-ratio parsed SRT batches",
      icon: Scissors,
      gradient: "from-cyan-500/15 via-cyan-500/5 to-transparent",
      borderColor: "border-cyan-500/30",
      iconColor: "text-cyan-400 bg-cyan-500/10",
      href: "/dashboard/subtitle-splitter",
      badgeText: "4/9/12/16",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.title}
            href={card.href}
            className={`group relative p-5 rounded-2xl border ${card.borderColor} bg-linear-to-b ${card.gradient} bg-[#0e1018]/90 backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-white/30`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`p-2.5 rounded-xl ${card.iconColor} border border-white/10 group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                {card.badgeText}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-3xl font-black font-heading text-white tracking-tight">
                {card.value.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-300 mt-1">
                {card.title}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                {card.description}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

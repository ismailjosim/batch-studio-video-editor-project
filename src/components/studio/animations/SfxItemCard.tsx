"use client";

import { Check, Play, Volume2 } from "lucide-react";
import type { SfxItem } from "@/lib/video-generator/types";

interface SfxItemCardProps {
  sfx: SfxItem;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onPlayPreview: (id: string) => void;
}

export function SfxItemCard({
  sfx,
  isSelected,
  onToggle,
  onPlayPreview,
}: SfxItemCardProps) {
  return (
    <div
      onClick={() => onToggle(sfx.id)}
      className={`group relative flex flex-col justify-between p-3 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? "border-pink-500/60 bg-pink-500/10 shadow-md shadow-pink-500/10"
          : "border-white/5 bg-white/2 hover:border-white/15 hover:bg-white/5 opacity-70"
      }`}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <span className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-pink-400" />
          <span className="truncate">{sfx.name}</span>
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPlayPreview(sfx.id);
          }}
          title="Play Sound Preview"
          className="p-1 rounded-md text-slate-400 hover:text-pink-400 hover:bg-pink-500/10 transition-all cursor-pointer"
        >
          <Play className="w-3 h-3 fill-current" />
        </button>
      </div>

      <span className="text-[10px] text-slate-400 font-mono truncate">
        Lead time: {sfx.leadTime}ms
      </span>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[9px]">
        <span className="font-mono text-slate-500">{sfx.id}</span>
        <div
          className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
            isSelected
              ? "border-pink-500 bg-pink-500 text-white"
              : "border-white/20 bg-transparent text-transparent"
          }`}
        >
          <Check className="w-2.5 h-2.5 stroke-3" />
        </div>
      </div>
    </div>
  );
}

"use client";

import { Check, Eye } from "lucide-react";
import type { AnimationItem } from "@/lib/video-generator/types";

interface AnimationItemCardProps {
  anim: AnimationItem;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onPreview: (id: string) => void;
}

export function AnimationItemCard({
  anim,
  isSelected,
  onToggle,
  onPreview,
}: AnimationItemCardProps) {
  return (
    <div
      onClick={() => onToggle(anim.id)}
      className={`group relative flex flex-col justify-between p-3 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? "border-cyan-500/60 bg-cyan-500/10 shadow-md shadow-cyan-500/10"
          : "border-white/5 bg-white/2 hover:border-white/15 hover:bg-white/5 opacity-70"
      }`}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
          {anim.name}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPreview(anim.id);
          }}
          title="Preview this animation"
          className="p-1 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      <span className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
        {anim.desc}
      </span>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[9px]">
        <span className="font-mono text-slate-500">{anim.id}</span>
        <div
          className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
            isSelected
              ? "border-cyan-400 bg-cyan-400 text-black"
              : "border-white/20 bg-transparent text-transparent"
          }`}
        >
          <Check className="w-2.5 h-2.5 stroke-3" />
        </div>
      </div>
    </div>
  );
}

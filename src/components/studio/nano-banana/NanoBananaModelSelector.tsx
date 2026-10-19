"use client";

import { ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";
import {
  type AspectRatio,
  NANO_BANANA_MODELS,
  type NanoBananaModel,
} from "./nano-banana-types";

interface NanoBananaModelSelectorProps {
  selectedModel: NanoBananaModel;
  onSelectModel: (model: NanoBananaModel) => void;
  aspectRatio: AspectRatio;
  onSelectAspectRatio: (ratio: AspectRatio) => void;
  sampleCount: number;
  onSelectSampleCount: (count: number) => void;
  upscale2K: boolean;
  onToggleUpscale2K: (val: boolean) => void;
}

export function NanoBananaModelSelector({
  selectedModel,
  onSelectModel,
  aspectRatio,
  onSelectAspectRatio,
  sampleCount,
  onSelectSampleCount,
  upscale2K,
  onToggleUpscale2K,
}: NanoBananaModelSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeModelConfig =
    NANO_BANANA_MODELS.find((m) => m.id === selectedModel) ||
    NANO_BANANA_MODELS[1];

  return (
    <div className="relative flex items-center gap-1.5 flex-wrap">
      {/* Model Pill Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
      >
        <span>🍌</span>
        <span>{activeModelConfig.name}</span>
        <span className="text-[10px] text-amber-300 font-normal px-1 py-0.2 rounded bg-amber-500/20">
          {activeModelConfig.badge}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {/* Sample Count Pill */}
      <div className="flex items-center rounded-full bg-black/40 border border-white/10 p-0.5 text-[11px] font-mono">
        {[1, 2, 4].map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => onSelectSampleCount(count)}
            className={`px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
              sampleCount === count
                ? "bg-amber-400 text-black shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            x{count}
          </button>
        ))}
      </div>

      {/* Aspect Ratio Pill */}
      <div className="flex items-center rounded-full bg-black/40 border border-white/10 p-0.5 text-[11px] font-mono">
        {(["1:1", "16:9", "9:16", "4:3"] as AspectRatio[]).map((ratio) => (
          <button
            key={ratio}
            type="button"
            onClick={() => onSelectAspectRatio(ratio)}
            className={`px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
              aspectRatio === ratio
                ? "bg-amber-400 text-black shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
            title={`Aspect ratio ${ratio}`}
          >
            {ratio}
          </button>
        ))}
      </div>

      {/* 2K Upscale Toggle Pill */}
      <button
        type="button"
        onClick={() => onToggleUpscale2K(!upscale2K)}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
          upscale2K
            ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-xs shadow-emerald-500/20"
            : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
        }`}
      >
        <Sparkles className="w-3 h-3 text-emerald-400" />
        <span>2K Ultra</span>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="absolute bottom-full mb-2 left-0 z-50 w-72 rounded-2xl border border-white/15 bg-[#141520] p-2 shadow-2xl backdrop-blur-xl flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5">
              Select Nano Banana Generator
            </div>
            {NANO_BANANA_MODELS.map((m) => {
              const isSelected = m.id === selectedModel;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onSelectModel(m.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`flex flex-col text-left p-2.5 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/15 border border-amber-500/30 text-white"
                      : "hover:bg-white/5 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5 text-white">
                      <span>🍌</span>
                      <span>{m.name}</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-amber-300 font-semibold">
                      {m.badge}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {m.description}
                  </span>
                  <span className="text-[10px] text-teal-400 mt-1">
                    Max: {m.maxResolution} • {m.recommendedFor}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

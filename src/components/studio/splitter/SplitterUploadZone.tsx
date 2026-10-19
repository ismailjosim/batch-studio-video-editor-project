"use client";

import {
  FileCheck,
  Layers,
  SlidersHorizontal,
  UploadCloud,
} from "lucide-react";
import { type ChangeEvent, useRef } from "react";
import type { ParsedSubtitle } from "./splitter-types";

interface SplitterUploadZoneProps {
  fileName: string;
  parsedSubs: ParsedSubtitle[];
  batchSize: number;
  onBatchSizeChange: (size: number) => void;
  onFileUpload: (file: File) => void;
}

const PRESET_BATCH_SIZES = [
  { size: 4, label: "4", ratio: "2×2", desc: "4 subs per batch (2×2 grid)" },
  {
    size: 9,
    label: "9 ★",
    ratio: "3×3",
    desc: "9 subs per batch (Dollar Doodles 3×3 standard)",
  },
  {
    size: 12,
    label: "12",
    ratio: "3×4",
    desc: "12 subs per batch (3×4 storyboard)",
  },
  { size: 16, label: "16", ratio: "4×4", desc: "16 subs per batch (4×4 grid)" },
];

export function SplitterUploadZone({
  fileName,
  parsedSubs,
  batchSize,
  onBatchSizeChange,
  onFileUpload,
}: SplitterUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const numberInputRef = useRef<HTMLInputElement | null>(null);

  const isCustom = !PRESET_BATCH_SIZES.some((p) => p.size === batchSize);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
  };

  const handleCustomClick = () => {
    numberInputRef.current?.focus();
    numberInputRef.current?.select();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="md:col-span-2 rounded-3xl border border-white/10 bg-[#12131b]/80 backdrop-blur-md p-6 shadow-xl flex flex-col gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".srt"
          className="hidden"
          onChange={handleInputChange}
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) onFileUpload(file);
          }}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
            parsedSubs.length > 0
              ? "border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/10"
              : "border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-500/60"
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            {parsedSubs.length > 0 ? (
              <FileCheck className="w-6 h-6 text-cyan-400" />
            ) : (
              <UploadCloud className="w-6 h-6 text-cyan-400" />
            )}
          </div>
          <div className="text-center">
            <span className="text-sm font-bold text-white block">
              {parsedSubs.length > 0
                ? `Loaded: ${fileName}.srt`
                : "Click or Drag & Drop .srt File Here"}
            </span>
            <span className="text-xs text-slate-400">
              {parsedSubs.length > 0
                ? `${parsedSubs.length} subtitles parsed successfully`
                : "Supports standard SubRip (.srt) subtitle files"}
            </span>
          </div>
        </div>
      </div>

      {/* Batch Configuration Card */}
      <div className="rounded-3xl border border-white/10 bg-[#12131b]/80 backdrop-blur-md p-6 shadow-xl flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Batch Size (Subtitles/Batch)</span>
          </span>

          <div className="flex items-center gap-2">
            <input
              ref={numberInputRef}
              type="number"
              min={1}
              max={200}
              value={batchSize}
              onChange={(e) => {
                const val = Number.parseInt(e.target.value, 10);
                if (val > 0) onBatchSizeChange(val);
              }}
              className={`w-20 rounded-xl border bg-black/50 px-3 py-2 text-sm font-bold text-white text-center focus:outline-none transition-all ${
                isCustom
                  ? "border-cyan-400 ring-2 ring-cyan-500/20 shadow-md shadow-cyan-500/10"
                  : "border-white/20 focus:border-cyan-400"
              }`}
            />
            <span className="text-xs text-slate-400">subtitles per batch</span>
          </div>

          {/* Ratio Buttons: 4, 9, 12, 16, Custom */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {PRESET_BATCH_SIZES.map((preset) => {
              const isSelected = batchSize === preset.size;
              return (
                <button
                  key={preset.size}
                  type="button"
                  onClick={() => onBatchSizeChange(preset.size)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-linear-to-r from-[#00d2ff] via-[#38bdf8] to-[#0284c7] text-black shadow-md shadow-cyan-500/25 ring-1 ring-cyan-400"
                      : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                  title={preset.desc}
                >
                  <span>{preset.label}</span>
                  <span
                    className={`text-[10px] font-mono opacity-80 ${
                      isSelected ? "text-black/80 font-bold" : "text-slate-400"
                    }`}
                  >
                    ({preset.ratio})
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleCustomClick}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isCustom
                  ? "bg-linear-to-r from-[#00d2ff] via-[#38bdf8] to-[#0284c7] text-black shadow-md shadow-cyan-500/25 ring-1 ring-cyan-400"
                  : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
              title="Enter any custom batch size"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Custom</span>
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-black/30 p-2.5 text-[11px] text-slate-400 leading-relaxed">
          {batchSize === 9 ? (
            <>
              <strong className="text-cyan-300">Recommendation:</strong> 9
              subtitles (3×3) matches the standard Dollar Doodles 9-slide
              storyboard workflow!
            </>
          ) : batchSize === 4 ? (
            <>
              <strong className="text-cyan-300">2×2 Grid Ratio:</strong> 4
              subtitles per batch — ideal for high-impact 4-panel shorts.
            </>
          ) : batchSize === 12 ? (
            <>
              <strong className="text-cyan-300">3×4 Grid Ratio:</strong> 12
              subtitles per batch — standard for 12-slide extended scenes.
            </>
          ) : batchSize === 16 ? (
            <>
              <strong className="text-cyan-300">4×4 Grid Ratio:</strong> 16
              subtitles per batch — great for 16-panel storyboard contacts.
            </>
          ) : (
            <>
              <strong className="text-cyan-300">Custom Ratio:</strong>{" "}
              {batchSize} subtitles per batch script split.
            </>
          )}
        </div>
      </div>
    </div>
  );
}

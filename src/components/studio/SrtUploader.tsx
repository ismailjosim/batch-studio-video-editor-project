"use client";

import { CheckCircle2, FileCode, FileText } from "lucide-react";
import { useRef, useState } from "react";
import type { Cue, SRTData } from "@/lib/video-generator/types";

interface SrtUploaderProps {
  srtData: SRTData | null;
  onSrtLoaded: (data: SRTData) => void;
}

function parseTimecode(tc: string): number {
  const parts = tc.trim().split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const secParts = parts[2].split(/[,.]/);
  const seconds = parseInt(secParts[0], 10);
  const ms = parseInt(secParts[1].padEnd(3, "0").slice(0, 3), 10);
  return (hours * 3600 + minutes * 60 + seconds) * 1000 + ms;
}

export function SrtUploader({ srtData, onSrtLoaded }: SrtUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const blocks = text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trim()
        .split(/\n\n+/);
      const cues: Cue[] = [];

      for (const block of blocks) {
        const lines = block.trim().split("\n");
        if (lines.length >= 2 && lines[1].includes("-->")) {
          const [startStr, endStr] = lines[1].split("-->").map((s) => s.trim());
          const startMs = parseTimecode(startStr);
          const endMs = parseTimecode(endStr);
          cues.push({
            id: cues.length + 1,
            startMs,
            endMs,
            text: lines.slice(2).join(" "),
          });
        }
      }

      if (cues.length === 0) {
        alert("Could not find valid cues in the SRT file.");
        return;
      }

      onSrtLoaded({
        cues,
        fileName: file.name.replace(/\.[^/.]+$/, ""),
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#10121a]/70 backdrop-blur-md p-5 shadow-xl">
      <div className="flex items-center gap-2 border-b border-white/5 pb-3 text-sm font-bold text-white tracking-wide">
        <FileText className="w-4 h-4 text-emerald-400" />
        <span>Step 1: Subtitles (.srt)</span>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files.length) {
            processFile(e.dataTransfer.files[0]);
          }
        }}
        className={`group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? "border-emerald-500 bg-emerald-500/10 scale-[0.99]"
            : srtData
              ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60"
              : "border-white/15 hover:border-emerald-500/50 hover:bg-white/2"
        }`}
      >
        <div className="text-3xl text-slate-400 group-hover:text-emerald-400 group-hover:scale-110 transition-all">
          <FileCode className="w-8 h-8" />
        </div>
        <div className="text-sm font-semibold text-slate-200">
          {srtData ? "Replace .srt Subtitle File" : "Upload .srt Subtitle File"}
        </div>
        <div className="text-xs text-slate-400">
          Drag & drop or click to browse
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".srt"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              processFile(e.target.files[0]);
            }
          }}
        />
      </div>

      {srtData && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 shadow-inner">
          <div className="flex items-center gap-1.5 truncate max-w-50">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{srtData.fileName}.srt</span>
          </div>
          <span className="font-mono text-slate-400">
            {srtData.cues.length} cues
          </span>
        </div>
      )}
    </div>
  );
}

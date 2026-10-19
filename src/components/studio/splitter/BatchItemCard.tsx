"use client";

import {
  ChevronDown,
  ChevronUp,
  Clock,
  FileDown,
  FileText,
  Sparkles,
} from "lucide-react";
import type { SplitBatch } from "./splitter-types";

interface BatchItemCardProps {
  batch: SplitBatch;
  isExpanded: boolean;
  onToggleExpand: (batchNumber: number) => void;
  onSendToGenerator?: (batch: SplitBatch) => void;
  onDownloadFile: (content: string, filename: string, type: string) => void;
}

export function BatchItemCard({
  batch,
  isExpanded,
  onToggleExpand,
  onSendToGenerator,
  onDownloadFile,
}: BatchItemCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#12131b]/90 overflow-hidden shadow-lg transition-all">
      {/* Batch Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white/2 hover:bg-white/4 transition-all">
        <div
          onClick={() => onToggleExpand(batch.batchNumber)}
          className="flex items-center gap-3 cursor-pointer flex-1"
        >
          <button
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            aria-label="Toggle batch details"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-xs">
              Batch {batch.batchStr}
            </span>
            <span className="text-xs font-semibold text-slate-200">
              Subs {batch.firstId} – {batch.lastId}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
              {batch.subtitles.length} cues
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{batch.timeRange}</span>
            <span className="text-slate-600">•</span>
            <span>({batch.durationFormatted})</span>
          </div>
        </div>

        {/* Batch Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {onSendToGenerator && (
            <button
              type="button"
              onClick={() => onSendToGenerator(batch)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-pink-500/15 border border-pink-500/30 hover:bg-pink-500 hover:text-white text-pink-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="Load this batch directly into Video Generator"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Send to Generator</span>
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              onDownloadFile(
                batch.srtContent,
                `batch-${batch.batchStr}.srt`,
                "text/plain",
              )
            }
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Download .srt"
          >
            <FileDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>.SRT</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onDownloadFile(
                batch.txtContent,
                `batch-${batch.batchStr}.txt`,
                "text/plain",
              )
            }
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Download .txt sentences"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>.TXT</span>
          </button>
        </div>
      </div>

      {/* Expanded Subtitles List */}
      {isExpanded && (
        <div className="border-t border-white/5 p-4 bg-black/40 flex flex-col gap-2 animate-in slide-in-from-top-1 duration-200">
          {batch.subtitles.map((sub) => (
            <div
              key={sub.id}
              className="flex items-start gap-3 p-2 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 text-xs transition-all"
            >
              <span className="font-mono text-cyan-400 font-bold w-7 shrink-0 text-right">
                {sub.id}.
              </span>
              <span className="font-mono text-slate-400 text-[11px] shrink-0">
                {sub.timecode}
              </span>
              <span className="text-slate-200 font-medium leading-relaxed">
                {sub.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

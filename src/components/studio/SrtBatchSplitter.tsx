"use client";

import { AlertCircle, RotateCcw, Scissors } from "lucide-react";
import { useState } from "react";
import { recordSubtitleSplit } from "@/lib/stats-tracker";
import type { Cue } from "@/lib/video-generator/types";
import { BatchItemCard } from "./splitter/BatchItemCard";
import { SplitterStatsGrid } from "./splitter/SplitterStatsGrid";
import { SplitterToolbar } from "./splitter/SplitterToolbar";
import { SplitterUploadZone } from "./splitter/SplitterUploadZone";
import type {
  ParsedSubtitle,
  SplitBatch,
  SrtBatchSplitterProps,
} from "./splitter/splitter-types";
import { calculateBatches, parseSrtRaw } from "./splitter/splitter-utils";
import { createAndSaveBatchesZip } from "./splitter/splitter-zip";

export function SrtBatchSplitter({ onSendToGenerator }: SrtBatchSplitterProps) {
  const [fileName, setFileName] = useState("");
  const [parsedSubs, setParsedSubs] = useState<ParsedSubtitle[]>([]);
  const [batchSize, setBatchSize] = useState<number>(9);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBatches, setExpandedBatches] = useState<Set<number>>(
    new Set([1]),
  );

  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const batches = calculateBatches(parsedSubs, batchSize);

  const handleFileUpload = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".srt")) {
      setErrorMsg("Please upload a valid .srt subtitle file.");
      return;
    }
    setErrorMsg("");
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || "";
      const subs = parseSrtRaw(text);
      if (subs.length === 0) {
        setErrorMsg(
          "No valid subtitle blocks found in the uploaded .srt file.",
        );
        return;
      }
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      setFileName(cleanName);
      setParsedSubs(subs);
      setExpandedBatches(new Set([1]));
    };
    reader.readAsText(file);
  };

  const toggleBatchExpand = (batchNum: number) => {
    setExpandedBatches((prev) => {
      const next = new Set(prev);
      if (next.has(batchNum)) next.delete(batchNum);
      else next.add(batchNum);
      return next;
    });
  };

  const handleDownloadSingleFile = (
    content: string,
    filename: string,
    type: string,
  ) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    if (!batches.length) return;
    setIsZipping(true);
    try {
      const saved = await createAndSaveBatchesZip(
        fileName,
        parsedSubs,
        batchSize,
        batches,
      );
      setIsZipping(false);
      if (saved) {
        recordSubtitleSplit(batches.length, parsedSubs.length);
        setZipSuccess(true);
        setTimeout(() => setZipSuccess(false), 4000);
      }
    } catch (err) {
      console.error("ZIP creation failed:", err);
      setIsZipping(false);
    }
  };

  const handleCopySummary = () => {
    if (!batches.length) return;
    let summaryText = `BATCH BREAKDOWN TABLE (${fileName}.srt):\n`;
    for (const b of batches) {
      summaryText += `Batch ${b.batchStr} | Subs ${b.firstId} - ${b.lastId} (${b.subtitles.length} cues) | ${b.timeRange}\n`;
    }
    navigator.clipboard.writeText(summaryText).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    });
  };

  const handleSendBatchToGenerator = (batch: SplitBatch) => {
    if (!onSendToGenerator) return;
    const cues: Cue[] = batch.subtitles.map((s) => ({
      id: s.id,
      startMs: s.startMs,
      endMs: s.endMs,
      text: s.text,
    }));

    onSendToGenerator({
      fileName: `${fileName}_batch_${batch.batchStr}`,
      cues,
    });
  };

  const handleReset = () => {
    setFileName("");
    setParsedSubs([]);
    setExpandedBatches(new Set([1]));
    setSearchQuery("");
  };

  const filteredBatches = batches.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.batchStr.includes(q) ||
      b.subtitles.some((s) => s.text.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      {/* Tool Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl border border-white/10 bg-[#0f111a]/80 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#00d2ff] via-[#38bdf8] to-[#0284c7] flex items-center justify-center text-black font-extrabold shadow-lg shadow-cyan-500/20">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-white font-heading">
                SRT Batch Splitter
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Batch Mode
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Split large subtitle scripts into manageable batches (e.g. 9
              subtitles each) with instant ZIP & TXT export.
            </p>
          </div>
        </div>

        {parsedSubs.length > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-rose-500/30 bg-white/5 hover:bg-rose-500/10 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset File</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Zone & Batch Settings */}
      <SplitterUploadZone
        fileName={fileName}
        parsedSubs={parsedSubs}
        batchSize={batchSize}
        onBatchSizeChange={setBatchSize}
        onFileUpload={handleFileUpload}
      />

      {/* Summary Statistics */}
      <SplitterStatsGrid
        parsedSubs={parsedSubs}
        batches={batches}
        batchSize={batchSize}
      />

      {/* Action Toolbar */}
      {parsedSubs.length > 0 && (
        <SplitterToolbar
          batchesCount={batches.length}
          isZipping={isZipping}
          zipSuccess={zipSuccess}
          copiedSummary={copiedSummary}
          searchQuery={searchQuery}
          onDownloadZip={handleDownloadZip}
          onCopySummary={handleCopySummary}
          onSearchChange={setSearchQuery}
        />
      )}

      {/* Batches List */}
      {parsedSubs.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Generated Batches Breakdown ({filteredBatches.length} of{" "}
              {batches.length})
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setExpandedBatches(new Set(batches.map((b) => b.batchNumber)))
                }
                className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
              >
                Expand All
              </button>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={() => setExpandedBatches(new Set())}
                className="text-[11px] text-slate-400 hover:underline cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {filteredBatches.map((batch) => (
              <BatchItemCard
                key={batch.batchNumber}
                batch={batch}
                isExpanded={expandedBatches.has(batch.batchNumber)}
                onToggleExpand={toggleBatchExpand}
                onSendToGenerator={handleSendBatchToGenerator}
                onDownloadFile={handleDownloadSingleFile}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

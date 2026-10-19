"use client";

import JSZip from "jszip";
import {
  AlertCircle,
  Archive,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  FileCheck,
  FileDown,
  FileText,
  Layers,
  RotateCcw,
  Scissors,
  Search,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { Cue, SRTData } from "@/lib/video-generator/types";

interface ParsedSubtitle {
  id: number;
  timecode: string;
  startTime: string;
  endTime: string;
  text: string;
  originalBlock: string;
  startMs: number;
  endMs: number;
}

interface SplitBatch {
  batchNumber: number;
  batchStr: string;
  subtitles: ParsedSubtitle[];
  firstId: number;
  lastId: number;
  timeRange: string;
  durationFormatted: string;
  srtContent: string;
  txtContent: string;
}

interface SrtBatchSplitterProps {
  onSendToGenerator?: (batchData: SRTData) => void;
}

function timecodeToMs(tc: string): number {
  const parts = tc.trim().split(":");
  if (parts.length < 3) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const secParts = parts[2].split(",");
  const seconds = parseInt(secParts[0], 10) || 0;
  const millis = parseInt(secParts[1], 10) || 0;
  return hours * 3600000 + minutes * 60000 + seconds * 1000 + millis;
}

function parseSrtRaw(content: string): ParsedSubtitle[] {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  const rawBlocks = normalized.split(/\n\n+/);
  const subtitles: ParsedSubtitle[] = [];

  for (const block of rawBlocks) {
    const lines = block.trim().split("\n");
    if (lines.length >= 2) {
      const id = parseInt(lines[0], 10);
      const timecode = lines[1];
      const text = lines.slice(2).join(" ").trim();
      if (!Number.isNaN(id) && timecode.includes("-->")) {
        const [startTime, endTime] = timecode.split("-->").map((s) => s.trim());
        const startMs = timecodeToMs(startTime);
        const endMs = timecodeToMs(endTime);
        subtitles.push({
          id,
          timecode,
          startTime,
          endTime,
          text,
          originalBlock: block.trim(),
          startMs,
          endMs,
        });
      }
    }
  }
  return subtitles;
}

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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const calculateBatches = useCallback(
    (subs: ParsedSubtitle[], size: number): SplitBatch[] => {
      if (!subs.length || size <= 0) return [];
      const batches: SplitBatch[] = [];
      const total = Math.ceil(subs.length / size);

      for (let b = 0; b < total; b++) {
        const start = b * size;
        const end = Math.min(start + size, subs.length);
        const slice = subs.slice(start, end);
        const first = slice[0];
        const last = slice[slice.length - 1];

        const durationMs = Math.max(0, last.endMs - first.startMs);
        const durSec = Math.round(durationMs / 1000);
        const durMins = Math.floor(durSec / 60);
        const durRemainSec = durSec % 60;
        const durationFormatted =
          durMins > 0 ? `${durMins}m ${durRemainSec}s` : `${durSec}s`;

        const srtContent = slice.map((s) => s.originalBlock).join("\n\n");
        const txtContent = slice.map((s) => s.text).join("\n");

        batches.push({
          batchNumber: b + 1,
          batchStr: String(b + 1).padStart(2, "0"),
          subtitles: slice,
          firstId: first.id,
          lastId: last.id,
          timeRange: `${first.startTime.split(",")[0]} ➔ ${last.endTime.split(",")[0]}`,
          durationFormatted,
          srtContent,
          txtContent,
        });
      }
      return batches;
    },
    [],
  );

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
      const zip = new JSZip();
      const folderName = `${fileName || "SRT"}_Batches`;
      const baseFolder = zip.folder(folderName);

      let summaryText = `DOLLAR DOODLES - SRT BATCH SPLITTER SUMMARY\n`;
      summaryText += `==========================================\n`;
      summaryText += `File: ${fileName}.srt\n`;
      summaryText += `Total Subtitles: ${parsedSubs.length}\n`;
      summaryText += `Batch Size: ${batchSize} subtitles per batch\n`;
      summaryText += `Total Batches: ${batches.length}\n`;
      summaryText += `Generated At: ${new Date().toLocaleString()}\n`;
      summaryText += `==========================================\n\n`;
      summaryText += `BATCH BREAKDOWN TABLE:\n`;
      summaryText += `------------------------------------------------------------------------------------------------\n`;

      for (const batch of batches) {
        baseFolder?.file(`batch-${batch.batchStr}.srt`, batch.srtContent);
        baseFolder?.file(`batch-${batch.batchStr}.txt`, batch.txtContent);
        summaryText += `Batch ${batch.batchStr} | Subs ${String(batch.firstId).padStart(3, "0")} - ${String(batch.lastId).padStart(3, "0")} (${batch.subtitles.length} subs) | Time: ${batch.timeRange}\n`;
      }

      summaryText += `------------------------------------------------------------------------------------------------\n`;
      baseFolder?.file("summary.txt", summaryText);

      const content = await zip.generateAsync({ type: "blob" });
      const zipFileName = `${folderName}.zip`;

      // Try modern File System Access API
      type SaveFilePickerWindow = Window & {
        showSaveFilePicker?: (options: {
          suggestedName: string;
          types: Array<{
            description: string;
            accept: Record<string, string[]>;
          }>;
        }) => Promise<FileSystemFileHandle>;
      };

      const win = window as SaveFilePickerWindow;
      if (win.showSaveFilePicker) {
        try {
          const handle = await win.showSaveFilePicker({
            suggestedName: zipFileName,
            types: [
              {
                description: "ZIP Archive (*.zip)",
                accept: { "application/zip": [".zip"] },
              },
            ],
          });
          const writable = await handle.createWritable();
          await writable.write(content);
          await writable.close();
          setIsZipping(false);
          setZipSuccess(true);
          setTimeout(() => setZipSuccess(false), 4000);
          return;
        } catch (err: unknown) {
          const error = err as Error;
          if (error.name === "AbortError") {
            setIsZipping(false);
            return;
          }
        }
      }

      // Fallback download
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = zipFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsZipping(false);
      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 4000);
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
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-black font-extrabold shadow-lg shadow-teal-500/20">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-white font-heading">
                SRT Batch Splitter
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Upload Card */}
        <div className="md:col-span-2 rounded-3xl border border-white/10 bg-[#12131b]/80 backdrop-blur-md p-6 shadow-xl flex flex-col gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".srt"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
              parsedSubs.length > 0
                ? "border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10"
                : "border-teal-500/30 bg-teal-500/5 hover:bg-teal-500/10 hover:border-teal-500/60"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center">
              {parsedSubs.length > 0 ? (
                <FileCheck className="w-6 h-6 text-emerald-400" />
              ) : (
                <UploadCloud className="w-6 h-6 text-teal-400" />
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
              <Layers className="w-4 h-4 text-teal-400" />
              <span>Batch Size (Subtitles/Batch)</span>
            </span>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={100}
                value={batchSize}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (val > 0) setBatchSize(val);
                }}
                className="w-20 rounded-xl border border-white/20 bg-black/50 px-3 py-2 text-sm font-bold text-white text-center focus:border-teal-400 focus:outline-none"
              />
              <span className="text-xs text-slate-400">
                subtitles per batch
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mt-1">
              {[5, 8, 9, 10, 12, 15].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setBatchSize(size)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    batchSize === size
                      ? "bg-teal-500 text-black shadow-md shadow-teal-500/20"
                      : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {size} {size === 9 ? "★" : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-black/30 p-2.5 text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-teal-300">Recommendation:</strong> 9
            subtitles per batch matches the standard Dollar Doodles 9-slide
            storyboard workflow!
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      {parsedSubs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#12131b]/80 p-4 shadow-lg flex flex-col gap-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">
              Total Subtitles
            </span>
            <span className="text-2xl font-black text-white font-heading">
              {parsedSubs.length}
            </span>
          </div>

          <div className="rounded-2xl border border-teal-500/25 bg-[#12131b]/80 p-4 shadow-lg flex flex-col gap-1">
            <span className="text-[11px] uppercase font-bold text-teal-400">
              Total Batches
            </span>
            <span className="text-2xl font-black text-teal-400 font-heading">
              {batches.length}
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#12131b]/80 p-4 shadow-lg flex flex-col gap-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">
              Batch Size
            </span>
            <span className="text-2xl font-black text-white font-heading">
              {batchSize} / batch
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#12131b]/80 p-4 shadow-lg flex flex-col gap-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">
              Full Duration
            </span>
            <span className="text-2xl font-black text-emerald-400 font-heading">
              {parsedSubs[parsedSubs.length - 1]?.endTime.split(",")[0] ||
                "0:00"}
            </span>
          </div>
        </div>
      )}

      {/* Action Toolbar */}
      {parsedSubs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl border border-white/10 bg-[#10121a]/90 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-extrabold text-xs font-heading shadow-lg shadow-teal-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isZipping ? (
                <>
                  <Archive className="w-4 h-4 animate-spin" />
                  <span>Packing ZIP...</span>
                </>
              ) : zipSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>ZIP Downloaded!</span>
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4" />
                  <span>
                    Download All Batches ZIP ({batches.length} Batches)
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-4 h-4 text-teal-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Summary Table</span>
                </>
              )}
            </button>
          </div>

          {/* Search within batches */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subtitles..."
              className="w-full rounded-xl border border-white/15 bg-black/40 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Batches Accordion List */}
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
                className="text-[11px] text-teal-400 hover:underline cursor-pointer"
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
            {filteredBatches.map((batch) => {
              const isExpanded = expandedBatches.has(batch.batchNumber);
              return (
                <div
                  key={batch.batchNumber}
                  className="rounded-2xl border border-white/10 bg-[#12131b]/90 overflow-hidden shadow-lg transition-all"
                >
                  {/* Batch Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white/2 hover:bg-white/4 transition-all">
                    <div
                      onClick={() => toggleBatchExpand(batch.batchNumber)}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <button
                        type="button"
                        className="p-1 rounded-lg text-slate-400 hover:text-white"
                        aria-label="Toggle batch details"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 font-mono font-bold text-xs">
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
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
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
                          onClick={() => handleSendBatchToGenerator(batch)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black text-emerald-300 text-xs font-bold transition-all cursor-pointer"
                          title="Load this batch directly into Video Generator"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Send to Generator</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadSingleFile(
                            batch.srtContent,
                            `batch-${batch.batchStr}.srt`,
                            "text/plain",
                          )
                        }
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
                        title="Download .srt"
                      >
                        <FileDown className="w-3.5 h-3.5 text-teal-400" />
                        <span>.SRT</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadSingleFile(
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
                          <span className="font-mono text-teal-400 font-bold w-7 shrink-0 text-right">
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
            })}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { Check, Copy, Download, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { TranscribeFormat } from "./TranscribeFormatSelector";

interface TranscribeResultPreviewProps {
  resultText: string;
  format: TranscribeFormat;
  wordsCount: number;
  cuesCount: number;
  durationSec: number;
  audioFileName: string;
}

export function TranscribeResultPreview({
  resultText,
  format,
  wordsCount,
  cuesCount,
  durationSec,
  audioFileName,
}: TranscribeResultPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    toast.success("Copied transcription to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!resultText) return;
    const isSrt = format !== "txt";
    const extension = isSrt ? ".srt" : ".txt";
    const baseName = (audioFileName || "transcription").replace(/\.[^.]+$/, "");
    const fileName = `${baseName}_${format === "word_srt" ? "word_synced" : "synced"}${extension}`;

    const blob = new Blob([resultText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${fileName}`);
  };

  return (
    <div className="flex flex-col gap-3 p-5 bg-[#0e1018]/90 border border-white/10 rounded-3xl shadow-xl backdrop-blur-xl h-full">
      {/* Header with stats */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Transcription Preview
          </span>
        </div>

        {resultText && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400">
              {wordsCount} words · {durationSec.toFixed(1)}s
              {cuesCount > 0 && ` · ${cuesCount} cues`}
            </span>

            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 text-violet-300 text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        )}
      </div>

      {/* Preview Box */}
      <div className="flex-1 min-h-75 max-h-115 rounded-2xl bg-[#0a0b10] border border-white/10 p-4 overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {resultText ? (
          <pre className="whitespace-pre-wrap font-mono text-slate-300">
            {resultText}
          </pre>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-16">
            <FileText className="w-8 h-8 text-slate-600 mb-2 opacity-50" />
            <span className="text-xs font-semibold text-slate-400">
              No transcription generated yet
            </span>
            <span className="text-[10px] text-slate-600 max-w-xs mt-1">
              Upload an audio file and click "Transcribe Audio" to preview and
              export your subtitles.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

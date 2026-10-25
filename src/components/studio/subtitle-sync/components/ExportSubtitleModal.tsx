"use client";

import { Check, Copy, Download, FileText, Layers, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { SubtitleCue } from "../subtitle-sync-types";
import {
  renderAss,
  renderJson,
  renderSrt,
  renderTxt,
  renderVtt,
} from "../subtitle-sync-utils";

export type ExportFormat = "srt" | "vtt" | "ass" | "txt" | "json";

interface ExportSubtitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  cues: SubtitleCue[];
  baseFileName: string;
}

export function ExportSubtitleModal({
  isOpen,
  onClose,
  cues,
  baseFileName,
}: ExportSubtitleModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("srt");
  const [includeTxtTimestamps, setIncludeTxtTimestamps] = useState(false);
  const [copied, setCopied] = useState(false);

  const cleanBaseName = useMemo(() => {
    return (baseFileName || "subtitles").replace(/\.[^.]+$/, "");
  }, [baseFileName]);

  const renderedContent = useMemo(() => {
    if (!cues.length) return "";
    switch (selectedFormat) {
      case "srt":
        return renderSrt(cues);
      case "vtt":
        return renderVtt(cues);
      case "ass":
        return renderAss(cues, cleanBaseName);
      case "txt":
        return renderTxt(cues, includeTxtTimestamps);
      case "json":
        return renderJson(cues);
      default:
        return renderSrt(cues);
    }
  }, [cues, selectedFormat, cleanBaseName, includeTxtTimestamps]);

  const fileExtension = selectedFormat;
  const fileName = `${cleanBaseName}_synced.${fileExtension}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(renderedContent);
      setCopied(true);
      toast.success(`Copied ${selectedFormat.toUpperCase()} to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleDownload = () => {
    if (!renderedContent) {
      toast.warning("No content to export");
      return;
    }
    const mimeTypes: Record<ExportFormat, string> = {
      srt: "text/plain;charset=utf-8",
      vtt: "text/vtt;charset=utf-8",
      ass: "text/x-ssa;charset=utf-8",
      txt: "text/plain;charset=utf-8",
      json: "application/json;charset=utf-8",
    };

    const blob = new Blob([renderedContent], {
      type: mimeTypes[selectedFormat],
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${fileName}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl flex flex-col max-h-[90vh] bg-[#0c0e16] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#101320]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white font-heading">
                Multi-Format Subtitle Exporter
              </h2>
              <p className="text-xs text-slate-400">
                Export {cues.length} subtitles to industry standard formats
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Pills */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {[
              {
                id: "srt" as ExportFormat,
                label: "SubRip (.srt)",
                badge: "Universal",
                desc: "Premiere, DaVinci, CapCut, YouTube",
              },
              {
                id: "vtt" as ExportFormat,
                label: "WebVTT (.vtt)",
                badge: "Web Players",
                desc: "HTML5 video, Safari, modern web apps",
              },
              {
                id: "ass" as ExportFormat,
                label: "SSA / ASS (.ass)",
                badge: "Styled Fonts",
                desc: "Aegisub, VLC styled karaoke captions",
              },
              {
                id: "txt" as ExportFormat,
                label: "Text (.txt)",
                badge: "Transcript",
                desc: "Clean transcript for articles or notes",
              },
              {
                id: "json" as ExportFormat,
                label: "JSON (.json)",
                badge: "Developer",
                desc: "Full cue objects with timing metadata",
              },
            ].map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => setSelectedFormat(fmt.id)}
                className={`flex-1 min-w-[130px] p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  selectedFormat === fmt.id
                    ? "bg-cyan-500/15 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                    : "bg-[#131624] border-white/5 hover:border-white/10 hover:bg-[#181c2d]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      selectedFormat === fmt.id ? "text-cyan-400" : "text-white"
                    }`}
                  >
                    {fmt.label}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-slate-400 border border-white/5">
                    {fmt.badge}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 leading-tight">
                  {fmt.desc}
                </span>
              </button>
            ))}
          </div>

          {/* TXT options */}
          {selectedFormat === "txt" && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/2 border border-white/5">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTxtTimestamps}
                  onChange={(e) => setIncludeTxtTimestamps(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400 cursor-pointer"
                />
                <span>Include timecodes in plain text transcript</span>
              </label>
            </div>
          )}

          {/* Preview Window */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="flex items-center gap-1.5 font-medium">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live File Preview: {fileName}</span>
              </span>
              <span className="font-mono text-[11px]">
                {renderedContent.length} chars
              </span>
            </div>
            <pre className="p-4 rounded-2xl bg-black/60 border border-white/10 text-slate-300 font-mono text-[11px] leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap select-all">
              {renderedContent || "// No subtitle cues loaded to preview"}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-white/10 bg-[#101320]">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ready for export: {cues.length} cues</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Content</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-linear-to-r from-cyan-400 to-blue-500 hover:brightness-110 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download {selectedFormat.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

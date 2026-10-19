"use client";

import {
  Check,
  CheckCircle2,
  CloudUpload,
  FileVideo,
  HardDriveDownload,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import type { SRTData, VideoSettings } from "@/lib/video-generator/types";

interface OutputVideoCardProps {
  outputBlobUrl: string;
  srtData: SRTData | null;
  audioFileName: string;
  loadedImagesCount: number;
  settings: VideoSettings;
}

export function OutputVideoCard({
  outputBlobUrl,
  srtData,
  audioFileName,
  loadedImagesCount,
  settings,
}: OutputVideoCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const cleanBase = (srtData?.fileName || "batch_studio_video")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_");
  const downloadFileName = cleanBase.endsWith(".mp4")
    ? cleanBase
    : `${cleanBase}_animated.mp4`;

  // Trigger browser download via File System Access API (Save As dialog)
  // or native anchor fallback.
  const handleSaveAs = async () => {
    // 1. Try Windows native File System Access API (showSaveFilePicker)
    // This explicitly prompts the user with the exact filename and .mp4 extension,
    // completely bypassing IDM and browser UUID-based fallback download issues.
    if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
      try {
        setIsExporting(true);
        const res = await fetch(outputBlobUrl);

        // TypeScript cast for window.showSaveFilePicker
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
          const fileHandle = await win.showSaveFilePicker({
            suggestedName: downloadFileName,
            types: [
              {
                description: "MP4 Video (*.mp4)",
                accept: { "video/mp4": [".mp4"] },
              },
            ],
          });

          const writable = await fileHandle.createWritable();
          if (res.body) {
            await res.body.pipeTo(writable);
          } else {
            const blob = await res.blob();
            await writable.write(blob);
            await writable.close();
          }

          setIsExporting(false);
          setExportSuccess(true);
          setTimeout(() => setExportSuccess(false), 5000);
          return;
        }
      } catch (err: unknown) {
        setIsExporting(false);
        const error = err as Error;
        if (error.name === "AbortError") {
          // User clicked "Cancel" on the file dialog
          return;
        }
        console.warn(
          "showSaveFilePicker failed, falling back to anchor download",
          error,
        );
      }
    }

    // 2. Fallback to anchor click
    triggerAnchorDownload();
  };

  const triggerAnchorDownload = () => {
    const a = document.createElement("a");
    a.href = outputBlobUrl;
    a.download = downloadFileName;
    a.setAttribute("download", downloadFileName);
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      }),
    );
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
    }, 1000);
  };

  const handleSaveProject = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: srtData?.fileName || "Untitled Video Project",
          srtFileName: srtData?.fileName
            ? `${srtData.fileName}.srt`
            : undefined,
          audioFileName: audioFileName || undefined,
          resolution: settings.resolution,
          aspectRatio: settings.aspectRatio,
          fps: settings.fps,
          bitrate: settings.bitrate,
          cuesCount: srtData?.cues.length || 0,
          imagesCount: loadedImagesCount,
          durationSec: srtData?.cues.length
            ? Math.round(srtData.cues[srtData.cues.length - 1].endMs / 1000)
            : 0,
          animMode: settings.animMode,
          selectedAnims: Array.from(settings.selectedAnims),
          sfxMode: settings.sfxMode,
          selectedSfx: Array.from(settings.selectedSfx),
          isSfxEnabled: settings.isSfxEnabled,
          status: "completed",
        }),
      });

      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 4000);
      }
    } catch (err) {
      console.error("Failed to save project:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-emerald-500/30 bg-[#10121a]/80 backdrop-blur-md p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 text-base font-bold text-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Video Generated Successfully!</span>
        </div>
        <button
          type="button"
          onClick={handleSaveProject}
          disabled={isSaving || isSaved}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-60"
        >
          {isSaved ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Project Saved in DB</span>
            </>
          ) : (
            <>
              <CloudUpload className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Project in DB"}</span>
            </>
          )}
        </button>
      </div>

      <div className="relative">
        <video
          src={outputBlobUrl}
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          playsInline
          className="w-full max-h-120 rounded-xl border border-white/15 bg-black shadow-2xl"
        />
      </div>

      <div className="mt-1">
        {/* Primary Save As Dialog Button (guarantees .mp4 extension via Windows Save dialog) */}
        <button
          type="button"
          onClick={handleSaveAs}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 px-6 font-extrabold text-sm text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 hover:shadow-emerald-500/40 transition-all cursor-pointer disabled:opacity-60"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Video to PC...</span>
            </>
          ) : exportSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Video Saved Successfully as .MP4!</span>
            </>
          ) : (
            <>
              <HardDriveDownload className="w-4 h-4" />
              <span>Download MP4 Video ({downloadFileName})</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-slate-300">
        <FileVideo className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5 leading-relaxed">
          <span className="font-semibold text-white">Save Note:</span>
          <span className="text-slate-400">
            Clicking <strong className="text-white">Download MP4 Video</strong>{" "}
            above uses the Windows File System dialog to guarantee your video is
            saved with the proper <code className="text-emerald-300">.mp4</code>{" "}
            format and can be opened in any media player.
          </span>
        </div>
      </div>
    </div>
  );
}

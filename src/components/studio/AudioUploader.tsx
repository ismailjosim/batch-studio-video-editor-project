"use client";

import { CheckCircle2, Mic, Music } from "lucide-react";
import { useRef, useState } from "react";
import { getAudioContext } from "@/lib/video-generator/sfx-loader";

interface AudioUploaderProps {
  audioBuffer: AudioBuffer | null;
  audioFileName: string;
  onAudioLoaded: (buffer: AudioBuffer, fileName: string) => void;
}

export function AudioUploader({
  audioBuffer,
  audioFileName,
  onAudioLoaded,
}: AudioUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arr = e.target?.result as ArrayBuffer;
        const audioCtx = getAudioContext();
        if (audioCtx.state === "suspended") {
          await audioCtx.resume();
        }
        const decoded = await audioCtx.decodeAudioData(arr.slice(0));
        onAudioLoaded(decoded, file.name);
      } catch (err: unknown) {
        const error = err as Error;
        alert(`Could not decode audio file: ${error.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#10121a]/70 backdrop-blur-md p-5 shadow-xl">
      <div className="flex items-center gap-2 border-b border-white/5 pb-3 text-sm font-bold text-white tracking-wide">
        <Mic className="w-4 h-4 text-pink-400" />
        <span>Step 2: Voiceover / Music (Optional)</span>
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
            ? "border-pink-500 bg-pink-500/10 scale-[0.99]"
            : audioBuffer
              ? "border-pink-500/40 bg-pink-500/5 hover:border-pink-500/60"
              : "border-white/15 hover:border-pink-500/50 hover:bg-white/2"
        }`}
      >
        <div className="text-3xl text-slate-400 group-hover:text-pink-400 group-hover:scale-110 transition-all">
          <Music className="w-8 h-8" />
        </div>
        <div className="text-sm font-semibold text-slate-200">
          {audioBuffer ? "Replace Audio Track" : "Upload Audio Track"}
        </div>
        <div className="text-xs text-slate-400">
          MP3, WAV, M4A, AAC, OGG (Optional)
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              processFile(e.target.files[0]);
            }
          }}
        />
      </div>

      {audioBuffer && (
        <div className="flex items-center justify-between rounded-lg border border-pink-500/30 bg-pink-500/10 px-3 py-2 text-xs font-semibold text-pink-300 shadow-inner">
          <div className="flex items-center gap-1.5 truncate max-w-50">
            <CheckCircle2 className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <span className="truncate">{audioFileName}</span>
          </div>
          <span className="font-mono text-slate-400">
            {formatDuration(audioBuffer.duration)}
          </span>
        </div>
      )}
    </div>
  );
}

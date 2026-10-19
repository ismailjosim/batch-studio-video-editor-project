"use client";

import { FileAudio, Music, Sparkles, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

interface TranscribeAudioDropzoneProps {
  audioFile: File | null;
  audioUrl: string | null;
  onSelectFile: (file: File) => void;
  onLoadDemoAudio: () => void;
}

export function TranscribeAudioDropzone({
  audioFile,
  audioUrl,
  onSelectFile,
  onLoadDemoAudio,
}: TranscribeAudioDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("audio/")) {
      onSelectFile(file);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
          <Music className="w-3.5 h-3.5 text-violet-400" />
          <span>Upload Audio File</span>
        </span>
        <button
          type="button"
          onClick={onLoadDemoAudio}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 text-[10px] font-semibold transition-all cursor-pointer"
          title="Load public/demo.wav sample"
        >
          <Sparkles className="w-3 h-3 text-violet-400" />
          <span>Use Sample (demo.wav)</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.wav,.mp3,.m4a,.aac,.flac,.ogg,.opus,.webm"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelectFile(file);
        }}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
          isDragging
            ? "border-violet-400 bg-violet-500/15"
            : audioFile
              ? "border-cyan-500/40 bg-cyan-500/5 hover:border-cyan-400"
              : "border-white/10 bg-[#0a0b10] hover:border-violet-500/40 hover:bg-[#121420]"
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-400 mb-2">
          {audioFile ? (
            <FileAudio className="w-6 h-6 text-cyan-400" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>

        {audioFile ? (
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-100 max-w-xs truncate">
              {audioFile.name}
            </span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
              {(audioFile.size / 1024 / 1024).toFixed(2)} MB · Click to replace
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-200">
              Drop your voiceover audio here or click to browse
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">
              Supports .wav, .mp3, .m4a, .aac, .ogg, .flac
            </span>
          </div>
        )}
      </div>

      {/* Audio playback preview */}
      {audioUrl && (
        <div className="p-2.5 rounded-xl bg-[#0a0b10] border border-white/10 flex items-center gap-2">
          <audio
            controls
            src={audioUrl}
            className="w-full h-8 outline-hidden"
          />
        </div>
      )}
    </div>
  );
}

"use client";

import { Wand2 } from "lucide-react";
import { TranscribeAudioDropzone } from "./components/TranscribeAudioDropzone";
import { TranscribeFormatSelector } from "./components/TranscribeFormatSelector";
import { TranscribeResultPreview } from "./components/TranscribeResultPreview";
import { TranscribeSuiteBridges } from "./components/TranscribeSuiteBridges";
import { useTranscribeStudio } from "./hooks/useTranscribeStudio";

export function TranscribeStudioClient() {
  const {
    audioFile,
    audioUrl,
    format,
    setFormat,
    engine,
    setEngine,
    colabUrl,
    setColabUrl,
    isTranscribing,
    statusMessage,
    resultText,
    wordsCount,
    cuesCount,
    durationSec,
    handleSelectFile,
    handleLoadDemoAudio,
    handleTranscribe,
    handleOpenInSubtitleStudio,
    handleSendToVideoGenerator,
  } = useTranscribeStudio();

  return (
    <div className="flex flex-col gap-5 w-full max-w-full min-w-0 overflow-x-hidden animate-in fade-in duration-300 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl border border-white/10 bg-[#0e1018]/90 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-[#00d2ff] via-[#ec4899] to-[#f97316] text-black flex items-center justify-center font-black text-lg shadow-lg shadow-cyan-500/20">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white font-heading">
                AI Audio Transcriber & Subtitle Generator
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400 font-bold">
                Whisper Large-v3
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate sentence-level or word-by-word SRT subtitles and raw
              transcripts from voiceover audio in sub-seconds.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131622] border border-white/10 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-slate-200 font-bold">
            {engine === "groq" ? "Groq Cloud" : "Colab Link"}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-cyan-400 font-bold">~0.5s Turbo</span>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-start">
        {/* Left Column: Input & Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 p-5 bg-[#0e1018]/90 border border-white/10 rounded-3xl shadow-xl backdrop-blur-xl">
          <TranscribeAudioDropzone
            audioFile={audioFile}
            audioUrl={audioUrl}
            onSelectFile={handleSelectFile}
            onLoadDemoAudio={handleLoadDemoAudio}
          />

          <div className="border-t border-white/10" />

          <TranscribeFormatSelector
            format={format}
            onChangeFormat={setFormat}
            engine={engine}
            onChangeEngine={setEngine}
            colabUrl={colabUrl}
            onChangeColabUrl={setColabUrl}
            isTranscribing={isTranscribing}
            canTranscribe={Boolean(audioFile)}
            onTranscribe={handleTranscribe}
          />
        </div>

        {/* Right Column: Output & Studio Bridges (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <TranscribeResultPreview
            resultText={resultText}
            format={format}
            wordsCount={wordsCount}
            cuesCount={cuesCount}
            durationSec={durationSec}
            audioFileName={audioFile?.name || "audio.wav"}
          />

          <TranscribeSuiteBridges
            hasResult={Boolean(resultText)}
            onOpenInSubtitleStudio={handleOpenInSubtitleStudio}
            onSendToVideoGenerator={handleSendToVideoGenerator}
          />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#0e1018]/90 border border-white/10 text-xs font-mono text-slate-400 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{statusMessage}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-cyan-400 font-semibold">
            Batch Studio Suite • by JC Design
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Mic } from "lucide-react";
import { useState } from "react";
import {
  AudioScriptEditor,
  SAMPLE_SCRIPTS,
} from "./components/AudioScriptEditor";
import { AudioSuiteBridges } from "./components/AudioSuiteBridges";
import { AudioWaveformPlayer } from "./components/AudioWaveformPlayer";
import { VoiceControlsCard } from "./components/VoiceControlsCard";
import { useAudioSynthesis } from "./hooks/useAudioSynthesis";

export function AudioStudioClient() {
  const [scriptText, setScriptText] = useState(SAMPLE_SCRIPTS[0].text);

  const synth = useAudioSynthesis(scriptText);

  const wordCount = scriptText.trim().split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.round((wordCount / (145 * synth.rate)) * 60);

  return (
    <div className="flex flex-col gap-5 w-full max-w-full min-w-0 overflow-x-hidden animate-in fade-in duration-300 pb-16">
      {/* Hidden Audio Element */}
      <audio
        ref={synth.audioRef}
        src={synth.audioUrl || undefined}
        onPlay={() => synth.setIsPlayingAudio(true)}
        onPause={() => synth.setIsPlayingAudio(false)}
        onEnded={() => synth.setIsPlayingAudio(false)}
      />

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl border border-white/10 bg-[#0e1018]/90 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-violet-500 to-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-violet-500/20">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white font-heading">
                Audio & Voice Studio
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400 font-bold">
                AI Voice Synthesis
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Transform written scripts into rich voiceovers with custom pitch,
              speed, and 1-click studio transfer.
            </p>
          </div>
        </div>

        {/* Quick Stat */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131622] border border-white/10 text-xs font-mono text-slate-400">
          <span className="text-slate-200 font-bold">{wordCount}</span>
          <span>words</span>
          <span className="text-slate-600">·</span>
          <span className="text-violet-400 font-bold">
            ~{estimatedSeconds}s
          </span>
        </div>
      </div>

      {/* Main Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-start">
        {/* Left Column: Script & Voice Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 p-5 bg-[#0e1018]/90 border border-white/10 rounded-3xl shadow-xl backdrop-blur-xl">
          <AudioScriptEditor
            scriptText={scriptText}
            onScriptChange={setScriptText}
          />

          <VoiceControlsCard
            persona={synth.persona}
            onSelectPersona={synth.handleSelectPersona}
            voices={synth.voices}
            selectedVoiceURI={synth.selectedVoiceURI}
            onSelectVoiceURI={synth.setSelectedVoiceURI}
            rate={synth.rate}
            onRateChange={synth.setRate}
            pitch={synth.pitch}
            onPitchChange={synth.setPitch}
            isSpeaking={synth.isSpeaking}
            isSynthesizing={synth.isSynthesizing}
            onSpeakPreview={synth.handleSpeakPreview}
            onSynthesizeAudio={synth.handleSynthesizeAudio}
          />
        </div>

        {/* Right Column: Audio Output & Studio Bridge (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <AudioWaveformPlayer
            canvasRef={synth.canvasRef}
            audioBlob={synth.audioBlob}
            audioUrl={synth.audioUrl}
            isPlayingAudio={synth.isPlayingAudio}
            isSpeaking={synth.isSpeaking}
            onTogglePlayAudio={synth.handleTogglePlayAudio}
          />

          <AudioSuiteBridges
            audioBlob={synth.audioBlob}
            onSendToSubtitleStudio={synth.handleSendToSubtitleStudio}
            onSendToVideoGenerator={synth.handleSendToVideoGenerator}
            onSendToTranscriber={synth.handleSendToTranscriber}
          />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#0e1018]/90 border border-white/10 text-xs font-mono text-slate-400 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <span>{synth.statusMessage}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-violet-400 font-semibold">
            Web Audio Formant Synthesizer
          </span>
        </div>
      </div>
    </div>
  );
}

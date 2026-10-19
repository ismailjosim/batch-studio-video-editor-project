"use client";

import { Pause, Volume2, Wand2 } from "lucide-react";

export type VoicePersona =
  | "deep-narrator"
  | "casual"
  | "energetic"
  | "cinematic";

interface VoiceControlsCardProps {
  persona: VoicePersona;
  onSelectPersona: (p: VoicePersona) => void;
  voices: SpeechSynthesisVoice[];
  selectedVoiceURI: string;
  onSelectVoiceURI: (uri: string) => void;
  rate: number;
  onRateChange: (rate: number) => void;
  pitch: number;
  onPitchChange: (pitch: number) => void;
  isSpeaking: boolean;
  isSynthesizing: boolean;
  onSpeakPreview: () => void;
  onSynthesizeAudio: () => void;
}

export function VoiceControlsCard({
  persona,
  onSelectPersona,
  voices,
  selectedVoiceURI,
  onSelectVoiceURI,
  rate,
  onRateChange,
  pitch,
  onPitchChange,
  isSpeaking,
  isSynthesizing,
  onSpeakPreview,
  onSynthesizeAudio,
}: VoiceControlsCardProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Persona Presets */}
      <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
          Voice Persona Style
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            {
              id: "deep-narrator",
              label: "Deep Narrator",
              desc: "Low & Bold",
            },
            { id: "casual", label: "Storyteller", desc: "Natural Tone" },
            { id: "energetic", label: "Explainer", desc: "Fast & Punchy" },
            { id: "cinematic", label: "Trailer", desc: "Epic Drama" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPersona(item.id as VoicePersona)}
              className={`flex flex-col items-start p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                persona === item.id
                  ? "bg-violet-500/15 border-violet-500/50 text-violet-300 shadow-sm"
                  : "bg-[#131622]/90 border-white/10 text-slate-300 hover:border-white/20"
              }`}
            >
              <span className="text-xs font-bold">{item.label}</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {item.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Engine & Tuning */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {/* System Voice Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Voice Accent
          </label>
          <select
            value={selectedVoiceURI}
            onChange={(e) => onSelectVoiceURI(e.target.value)}
            className="w-full p-2 rounded-xl bg-[#0a0b10] border border-white/10 text-xs text-slate-200 outline-hidden cursor-pointer"
          >
            {voices.map((v) => (
              <option
                key={v.voiceURI}
                value={v.voiceURI}
                className="bg-[#10121a]"
              >
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>

        {/* Speed Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold uppercase">
            <span>Speed</span>
            <span className="text-violet-400">{rate.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={2.0}
            step={0.05}
            value={rate}
            onChange={(e) => onRateChange(parseFloat(e.target.value))}
            className="h-1.5 bg-[#141724] rounded-lg appearance-none cursor-pointer accent-violet-400 mt-2"
          />
        </div>

        {/* Pitch Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold uppercase">
            <span>Pitch</span>
            <span className="text-violet-400">{pitch.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.05}
            value={pitch}
            onChange={(e) => onPitchChange(parseFloat(e.target.value))}
            className="h-1.5 bg-[#141724] rounded-lg appearance-none cursor-pointer accent-violet-400 mt-2"
          />
        </div>
      </div>

      {/* Action Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-white/10">
        <button
          type="button"
          onClick={onSpeakPreview}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            isSpeaking
              ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
              : "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10"
          }`}
        >
          {isSpeaking ? (
            <>
              <Pause className="w-4 h-4 text-rose-400" />
              <span>Stop Speaking</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-violet-400" />
              <span>Audition Speech</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onSynthesizeAudio}
          disabled={isSynthesizing}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-linear-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 text-white font-extrabold text-xs shadow-lg shadow-violet-500/25 transition-all cursor-pointer disabled:opacity-40"
        >
          <Wand2 className="w-4 h-4" />
          <span>{isSynthesizing ? "Synthesizing..." : "Synthesize Audio"}</span>
        </button>
      </div>
    </div>
  );
}

"use client";

import { Sparkles } from "lucide-react";

export const SAMPLE_SCRIPTS = [
  {
    title: "Dollar Doodles Hook",
    text: "Every economics textbook on earth starts with the exact same campfire story. You own a cow. Your neighbor makes leather shoes. One day you need boots, so you walk your cow over to his workshop. But there's just one problem: a single pair of boots is not worth an entire cow.",
  },
  {
    title: "YouTube Tech Explainer",
    text: "Artificial intelligence isn't just changing how we write code. It's revolutionizing video production, real-time subtitle synthesis, and automated creative workflows. Today, we're testing the fastest browser-native 2K rendering engine ever built.",
  },
  {
    title: "Motivation & Focus",
    text: "The greatest hurdle between where you are and where you want to be isn't talent or luck. It's the relentless discipline to show up every single morning and build brick by brick until the vision is real.",
  },
];

interface AudioScriptEditorProps {
  scriptText: string;
  onScriptChange: (text: string) => void;
}

export function AudioScriptEditor({
  scriptText,
  onScriptChange,
}: AudioScriptEditorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            1. Voiceover Script
          </span>
        </div>

        {/* Quick Templates */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500">Sample:</span>
          {SAMPLE_SCRIPTS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onScriptChange(s.text)}
              className="px-2 py-0.5 rounded-lg border border-white/10 hover:border-violet-500/30 bg-white/5 hover:bg-violet-500/10 text-[10px] text-slate-300 hover:text-violet-300 font-mono transition-all cursor-pointer"
            >
              {s.title.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={scriptText}
        onChange={(e) => onScriptChange(e.target.value)}
        rows={6}
        placeholder="Write or paste your narration script here..."
        className="w-full p-4 rounded-2xl bg-[#0a0b10] border border-white/10 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 text-sm text-slate-100 placeholder-slate-600 outline-hidden transition-all resize-none leading-relaxed"
      />
    </div>
  );
}

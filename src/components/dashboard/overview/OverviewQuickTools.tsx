"use client";

import {
  ArrowRight,
  AudioLines,
  Film,
  Scissors,
  Sparkles,
  Wand2,
} from "lucide-react";
import Link from "next/link";

export function OverviewQuickTools() {
  const tools = [
    {
      title: "Subtitle Studio",
      tagline: "Waveform & Timing Sync",
      description:
        "Precision timeline subtitle editor with decoded audio waveform, cue edge resizing, needle splitting, playhead snapping, and instant SRT export.",
      icon: AudioLines,
      href: "/dashboard/subtitle-sync-editor",
      badge: "Sync Studio",
      color: "cyan",
      bgGradient: "from-cyan-500/10 via-cyan-950/20 to-transparent",
      borderColor: "border-cyan-500/30 hover:border-cyan-400/60",
      accentBg: "bg-cyan-500",
      accentText: "text-cyan-400",
      buttonText: "Open Subtitle Studio",
    },
    {
      title: "SRT Video Generator",
      tagline: "2K Hardware GPU Renderer",
      description:
        "Assemble synced SRT subtitles, audio tracks, and images into high-framerate 2K MP4 video with 10+ smooth animations & sound effects.",
      icon: Film,
      href: "/dashboard/video-editor",
      badge: "2K GPU",
      color: "orange",
      bgGradient: "from-orange-500/10 via-orange-950/20 to-transparent",
      borderColor: "border-orange-500/30 hover:border-orange-400/60",
      accentBg: "bg-orange-500",
      accentText: "text-orange-400",
      buttonText: "Open Video Editor",
    },
    {
      title: "SRT Batch Splitter",
      tagline: "Smart Subtitle Packager",
      description:
        "Divide large voiceover subtitle files into consistent 4, 9★, 12, or 16-cue blocks. Generates clean batch SRTs and instant downloadable ZIP archives.",
      icon: Scissors,
      href: "/dashboard/subtitle-splitter",
      badge: "Batch ZIP",
      color: "pink",
      bgGradient: "from-pink-500/10 via-pink-950/20 to-transparent",
      borderColor: "border-pink-500/30 hover:border-pink-400/60",
      accentBg: "bg-pink-500",
      accentText: "text-pink-400",
      buttonText: "Open Batch Splitter",
    },
    {
      title: "AI Image Generator",
      tagline: "FLUX.1 & Gemini Pro Studio",
      description:
        "Generate multi-view character designs, turnarounds, and 2K storyboards using FLUX.1 (Free Unlimited) and Google Gemini Pro.",
      icon: Wand2,
      href: "/dashboard/image-generator",
      badge: "Multi-AI 2K",
      color: "amber",
      bgGradient: "from-amber-500/10 via-amber-950/20 to-transparent",
      borderColor: "border-amber-500/30 hover:border-amber-400/60",
      accentBg: "bg-amber-500",
      accentText: "text-amber-400",
      buttonText: "Open Image Generator",
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Creative Studio Tools</span>
        </h3>
        <span className="text-xs text-slate-500">
          Select any tool to start creating
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.title}
              className={`flex flex-col justify-between p-6 rounded-3xl border ${tool.borderColor} bg-linear-to-b ${tool.bgGradient} bg-[#0e1018]/90 backdrop-blur-xl shadow-xl transition-all duration-300 hover:scale-[1.01]`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl ${tool.accentBg}/15 border border-${tool.color}-500/30 flex items-center justify-center ${tool.accentText} shadow-md`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                    {tool.badge}
                  </span>
                </div>

                <h4 className="text-lg font-black font-heading text-white tracking-tight">
                  {tool.title}
                </h4>
                <p className={`text-xs font-bold ${tool.accentText} mt-0.5`}>
                  {tool.tagline}
                </p>
                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-white/5">
                <Link
                  href={tool.href}
                  className={`group inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all`}
                >
                  <span>{tool.buttonText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { ArrowRight, Bot, Loader2, Plus, X } from "lucide-react";
import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import { NanoBananaModelSelector } from "./NanoBananaModelSelector";
import type {
  AspectRatio,
  NanoBananaModel,
  ReferenceImage,
} from "./nano-banana-types";

interface NanoBananaPromptBarProps {
  onGenerate: (params: {
    prompt: string;
    model: NanoBananaModel;
    aspectRatio: AspectRatio;
    sampleCount: number;
    upscale2K: boolean;
    referenceImages: ReferenceImage[];
  }) => void;
  isGenerating: boolean;
  selectedModel: NanoBananaModel;
  onSelectModel: (model: NanoBananaModel) => void;
}

const STYLE_PRESETS = [
  "Dollar Doodles Character Sheet: front, walk, back view, red cap, red shirt",
  "Dollar Doodles 4-expression sticker pack (smug, surprised, nervous, grin)",
  "Dollar Doodles 2K Storyboard panel: stickman discovering gold coins",
  "Dollar Doodles character pointing excitedly at financial graph banner",
];

export function NanoBananaPromptBar({
  onGenerate,
  isGenerating,
  selectedModel,
  onSelectModel,
}: NanoBananaPromptBarProps) {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [sampleCount, setSampleCount] = useState<number>(1);
  const [upscale2K, setUpscale2K] = useState<boolean>(true);
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setReferenceImages((prev) => [
          ...prev,
          {
            id: `ref-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: file.name,
            dataUrl,
            mimeType: file.type,
            base64Data: dataUrl,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReference = (id: string) => {
    setReferenceImages((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    onGenerate({
      prompt: prompt.trim(),
      model: selectedModel,
      aspectRatio,
      sampleCount,
      upscale2K,
      referenceImages,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-2">
      {/* Active Reference Images Strip */}
      {referenceImages.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md overflow-x-auto">
          <span className="text-[11px] font-bold text-teal-400 shrink-0">
            Reference Images ({referenceImages.length}):
          </span>
          {referenceImages.map((ref) => (
            <div
              key={ref.id}
              className="relative flex items-center gap-1.5 px-2 py-1 rounded-xl bg-black/50 border border-white/15 text-xs text-white shrink-0 group"
            >
              <img
                src={ref.dataUrl}
                alt={ref.name}
                className="w-5 h-5 rounded object-cover"
              />
              <span className="text-[11px] max-w-25 truncate text-slate-300">
                {ref.name}
              </span>
              <button
                type="button"
                onClick={() => removeReference(ref.id)}
                className="text-slate-400 hover:text-rose-400 cursor-pointer ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Floating Prompt Bar container */}
      <form
        onSubmit={handleSubmit}
        className="relative rounded-3xl border border-white/15 bg-[#141520]/95 backdrop-blur-2xl shadow-2xl p-2.5 flex flex-col gap-2.5 transition-all focus-within:border-amber-400/50 focus-within:ring-2 focus-within:ring-amber-500/20"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Text Input Row */}
        <div className="flex items-center gap-2 px-2 pt-1">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What do you want to create? (e.g. Dollar Doodles character turnaround, 2K storyboard...)"
            disabled={isGenerating}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Bottom Toolbar: Attachments + Selector + Submit */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-white/5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Add Reference Image Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Upload reference character sheet or storyboard style"
            >
              <Plus className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-[11px]">Reference</span>
            </button>

            {/* Agent / Quick Prompt Presets */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPresetsMenu(!showPresetsMenu)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">Presets</span>
              </button>

              {showPresetsMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowPresetsMenu(false)}
                  />
                  <div className="absolute bottom-full mb-2 left-0 z-50 w-80 rounded-2xl border border-white/15 bg-[#161724] p-2 shadow-2xl backdrop-blur-xl flex flex-col gap-1 text-xs">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5">
                      Dollar Doodles Quick Prompts
                    </div>
                    {STYLE_PRESETS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setPrompt(p);
                          setShowPresetsMenu(false);
                        }}
                        className="text-left p-2 rounded-xl text-[11px] text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Model Selector & Submit Button */}
          <div className="flex items-center gap-2">
            <NanoBananaModelSelector
              selectedModel={selectedModel}
              onSelectModel={onSelectModel}
              aspectRatio={aspectRatio}
              onSelectAspectRatio={setAspectRatio}
              sampleCount={sampleCount}
              onSelectSampleCount={setSampleCount}
              upscale2K={upscale2K}
              onToggleUpscale2K={setUpscale2K}
            />

            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="w-9 h-9 rounded-full bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-amber-500/20"
              title="Generate with Nano Banana"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 font-bold" />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

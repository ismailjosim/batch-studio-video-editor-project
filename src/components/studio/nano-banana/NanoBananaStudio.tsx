"use client";

import { AlertCircle, Key, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { NanoBananaGallery } from "./NanoBananaGallery";
import { NanoBananaKeyModal } from "./NanoBananaKeyModal";
import { NanoBananaPromptBar } from "./NanoBananaPromptBar";
import {
  generateNanoBananaImages,
  getStoredGeminiKey,
} from "./nano-banana-api";
import type {
  AspectRatio,
  GeneratedAsset,
  NanoBananaModel,
  ReferenceImage,
} from "./nano-banana-types";

interface NanoBananaStudioProps {
  onSendToVideoGenerator?: (images: HTMLImageElement[]) => void;
}

export function NanoBananaStudio({
  onSendToVideoGenerator,
}: NanoBananaStudioProps) {
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [selectedModel, setSelectedModel] =
    useState<NanoBananaModel>("nano-banana-2.1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    setHasApiKey(Boolean(getStoredGeminiKey()));
  }, []);

  const handleGenerate = async (params: {
    prompt: string;
    model: NanoBananaModel;
    aspectRatio: AspectRatio;
    sampleCount: number;
    upscale2K: boolean;
    referenceImages: ReferenceImage[];
  }) => {
    setIsGenerating(true);
    setErrorMsg("");

    try {
      const response = await generateNanoBananaImages({
        prompt: params.prompt,
        model: params.model,
        aspectRatio: params.aspectRatio,
        sampleCount: params.sampleCount,
        upscale2K: params.upscale2K,
        referenceImages: params.referenceImages.map((r) => ({
          mimeType: r.mimeType,
          base64Data: r.base64Data,
        })),
      });

      if (!response.success || !response.images.length) {
        throw new Error(response.error || "No images returned by generator");
      }

      const newAssets: GeneratedAsset[] = response.images.map((img) => ({
        id: `nb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        url: img.url,
        prompt: params.prompt,
        model: params.model,
        aspectRatio: params.aspectRatio,
        isUpscaled2K: img.isUpscaled2K,
        width: img.width,
        height: img.height,
        createdAt: Date.now(),
        referenceImageCount: params.referenceImages.length,
      }));

      setAssets((prev) => [...newAssets, ...prev]);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Failed to generate images");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpscaleAsset = (id: string, upscaledUrl: string) => {
    setAssets((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              url: upscaledUrl,
              isUpscaled2K: true,
              width: a.aspectRatio === "16:9" ? 2048 : 2048,
              height: a.aspectRatio === "16:9" ? 1152 : 2048,
            }
          : a,
      ),
    );
  };

  const handleDeleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSendToGenerator = (asset: GeneratedAsset) => {
    if (!onSendToVideoGenerator) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      onSendToVideoGenerator([img]);
    };
    img.src = asset.url;
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300 pb-16">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl border border-white/10 bg-[#0f111a]/80 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
            🍌
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-white font-heading">
                Nano Banana AI Studio
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Gemini Pro 2K
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Generate consistent Dollar Doodles character sheets, 2K storyboard
              frames & turnaround stickers with multi-reference conditioning.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsKeyModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              hasApiKey
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>
              {hasApiKey ? "Gemini Key Active" : "Add Gemini API Key"}
            </span>
          </button>

          {assets.length > 0 && (
            <button
              type="button"
              onClick={() => setAssets([])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-rose-500/30 bg-white/5 hover:bg-rose-500/10 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Gallery</span>
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Gallery of Generated Assets */}
      <NanoBananaGallery
        assets={assets}
        onUpscaleAsset={handleUpscaleAsset}
        onSendToGenerator={handleSendToGenerator}
        onDeleteAsset={handleDeleteAsset}
        onUseAsReference={() => {}}
        onQuickGenerate={(p) =>
          handleGenerate({
            prompt: p,
            model: selectedModel,
            aspectRatio: "1:1",
            sampleCount: 1,
            upscale2K: true,
            referenceImages: [],
          })
        }
      />

      {/* Bottom Floating Prompt Bar */}
      <div className="sticky bottom-4 z-30 w-full pt-2">
        <NanoBananaPromptBar
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
        />
      </div>

      {/* API Key Modal */}
      <NanoBananaKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeySaved={(k) => setHasApiKey(Boolean(k))}
      />
    </div>
  );
}

"use client";

import {
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  Key,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { recordImageGeneration } from "@/lib/stats-tracker";
import { NanoBananaGallery } from "./NanoBananaGallery";
import { NanoBananaKeyModal } from "./NanoBananaKeyModal";
import { NanoBananaPromptBar } from "./NanoBananaPromptBar";
import {
  checkServerGeminiKey,
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
    useState<NanoBananaModel>("flux-schnell");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [quotaInfo, setQuotaInfo] = useState<{
    isQuotaError: boolean;
    message: string;
    billingUrl: string;
    projectNumber?: string;
    lastPrompt?: string;
  } | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    if (getStoredGeminiKey()) {
      setHasApiKey(true);
    } else {
      checkServerGeminiKey().then((has) => {
        if (has) setHasApiKey(true);
      });
    }
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
    setQuotaInfo(null);

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

      if (!response.success) {
        if (response.isQuotaError) {
          setQuotaInfo({
            isQuotaError: true,
            message:
              response.error ||
              "Google Gemini Image Quota Limit: 0 (Billing Required).",
            billingUrl:
              response.billingUrl || "https://console.cloud.google.com/billing",
            projectNumber: response.projectNumber || "349945349831",
            lastPrompt: params.prompt,
          });
          return;
        }
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
      recordImageGeneration(newAssets.length);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Failed to generate images");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDemo = async (promptToUse?: string) => {
    setIsGenerating(true);
    setErrorMsg("");
    setQuotaInfo(null);

    try {
      const p =
        promptToUse ||
        "Dollar Doodles minimalist stickman character with red cap and red shirt";
      const response = await generateNanoBananaImages({
        prompt: p,
        model: selectedModel,
        aspectRatio: "1:1",
        sampleCount: 1,
        upscale2K: true,
        useDemoFallback: true,
      });

      if (response.success && response.images.length > 0) {
        const newAssets: GeneratedAsset[] = response.images.map((img) => ({
          id: `nb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          url: img.url,
          prompt: p,
          model: selectedModel,
          aspectRatio: "1:1",
          isUpscaled2K: img.isUpscaled2K,
          width: img.width,
          height: img.height,
          createdAt: Date.now(),
          referenceImageCount: 0,
        }));

        setAssets((prev) => [...newAssets, ...prev]);
        recordImageGeneration(newAssets.length);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Failed to generate demo doodle");
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
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-white font-heading">
                AI Image Generator Studio
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {selectedModel === "flux-schnell"
                  ? "FLUX.1 Schnell • Free"
                  : selectedModel.startsWith("nano-banana")
                    ? "Gemini Pro 2K"
                    : "Multi-Model 2K"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Generate consistent Dollar Doodles character sheets, 2K storyboard
              frames & turnaround stickers with multi-model AI.
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
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>
              {hasApiKey ? "Gemini Key Active" : "Provider Keys (Optional)"}
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

      {quotaInfo && (
        <div className="flex flex-col gap-3.5 p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-200 shadow-2xl backdrop-blur-xl animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white font-heading">
                    Gemini Image Quota: Free Tier Limit is 0 (Billing Required)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    HTTP 429
                  </span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed max-w-3xl">
                  Your Gemini API key is connected and verified. However, Google
                  assigns <strong>0 free requests (limit: 0)</strong> for Gemini
                  Image Generation models (<code>gemini-nano-banana-2.1</code>,{" "}
                  <code>gemini-3-pro-image</code>). To generate live images
                  using Gemini AI, link a{" "}
                  <strong>Billing Account (Pay-As-You-Go)</strong> on Google
                  Cloud Project{" "}
                  <strong>#{quotaInfo.projectNumber || "349945349831"}</strong>.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setQuotaInfo(null)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Dismiss Warning"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-amber-500/20">
            <button
              type="button"
              onClick={() => {
                setSelectedModel("flux-schnell");
                setQuotaInfo(null);
                handleGenerate({
                  prompt:
                    quotaInfo.lastPrompt ||
                    "Dollar Doodles minimalist stickman character with red cap and red shirt, character sheet turnaround",
                  model: "flux-schnell",
                  aspectRatio: "1:1",
                  sampleCount: 1,
                  upscale2K: true,
                  referenceImages: [],
                });
              }}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Switch to FLUX.1 (Free Unlimited AI)</span>
            </button>

            <a
              href={quotaInfo.billingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Link Google Billing</span>
            </a>

            <button
              type="button"
              onClick={() => handleGenerateDemo(quotaInfo.lastPrompt)}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <span>Studio Doodle (Offline SVG)</span>
            </button>
          </div>
        </div>
      )}

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

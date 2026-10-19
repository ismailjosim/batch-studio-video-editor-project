"use client";

import {
  Download,
  Film,
  Maximize2,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { useState } from "react";
import type { GeneratedAsset } from "./nano-banana-types";
import { upscaleImageTo2K } from "./upscale-utils";

interface NanoBananaGalleryProps {
  assets: GeneratedAsset[];
  onUpscaleAsset: (id: string, upscaledUrl: string) => void;
  onSendToGenerator: (asset: GeneratedAsset) => void;
  onDeleteAsset: (id: string) => void;
  onUseAsReference: (asset: GeneratedAsset) => void;
  onQuickGenerate: (prompt: string) => void;
}

export function NanoBananaGallery({
  assets,
  onUpscaleAsset,
  onSendToGenerator,
  onDeleteAsset,
  onUseAsReference,
  onQuickGenerate,
}: NanoBananaGalleryProps) {
  const [upscalingId, setUpscalingId] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<GeneratedAsset | null>(null);

  const handleUpscale = async (asset: GeneratedAsset) => {
    try {
      setUpscalingId(asset.id);
      const res = await upscaleImageTo2K(asset.url, asset.aspectRatio);
      onUpscaleAsset(asset.id, res.dataUrl);
    } catch (err) {
      console.error("Manual 2K upscale failed:", err);
    } finally {
      setUpscalingId(null);
    }
  };

  const handleDownload = (asset: GeneratedAsset) => {
    const a = document.createElement("a");
    a.href = asset.url;
    a.download = `nano-banana-${asset.isUpscaled2K ? "2k-" : ""}${asset.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (assets.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-dashed border-white/10 bg-[#0d0e14]/60 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/10">
          🍌
        </div>
        <div>
          <h3 className="text-base font-bold text-white font-heading">
            Nano Banana Studio Workspace
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Generate consistent Dollar Doodles character turnarounds, sticker
            packs, and 2K storyboard scenes using Gemini Pro.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          <button
            type="button"
            onClick={() =>
              onQuickGenerate(
                "Dollar Doodles Character Turnaround Sheet: front, walk, back view, red cap, red shirt",
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Generate Character Sheet</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onQuickGenerate(
                "Dollar Doodles 4-expression sticker pack (smug, surprised, nervous, grin)",
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Generate Sticker Pack</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {assets.map((asset) => {
          const isUpscaling = upscalingId === asset.id;
          return (
            <div
              key={asset.id}
              className="group relative rounded-3xl border border-white/10 bg-[#12131d]/90 backdrop-blur-md overflow-hidden shadow-xl hover:border-amber-500/40 transition-all flex flex-col"
            >
              {/* Image Preview Container */}
              <div className="relative aspect-square w-full bg-black/60 overflow-hidden flex items-center justify-center">
                <img
                  src={asset.url}
                  alt={asset.prompt}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-102"
                />

                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/15">
                    {asset.aspectRatio}
                  </span>
                  {asset.isUpscaled2K && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/90 text-black shadow-md flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>2K ULTRA</span>
                    </span>
                  )}
                </div>

                {/* Top Action Buttons */}
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => setModalImage(asset)}
                    className="p-1.5 rounded-xl bg-black/70 hover:bg-black text-slate-200 hover:text-white border border-white/15 cursor-pointer backdrop-blur-md"
                    title="View Full Size"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteAsset(asset.id)}
                    className="p-1.5 rounded-xl bg-black/70 hover:bg-rose-500/80 text-slate-200 hover:text-white border border-white/15 cursor-pointer backdrop-blur-md"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
                <div>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-medium">
                    {asset.prompt}
                  </p>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {asset.width} × {asset.height} px • {asset.model}
                  </span>
                </div>

                {/* Action Toolbar */}
                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => onSendToGenerator(asset)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold font-heading shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                    title="Send image to 2K Video Generator as Storyboard Image"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Send to Video</span>
                  </button>

                  {!asset.isUpscaled2K && (
                    <button
                      type="button"
                      disabled={isUpscaling}
                      onClick={() => handleUpscale(asset)}
                      className="flex items-center gap-1 px-2.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-amber-400/20 hover:border-amber-400/40 text-amber-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                      title="Upscale up to 2K resolution"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isUpscaling ? "Upscaling..." : "2K"}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDownload(asset)}
                    className="p-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="Download High-Res PNG"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onUseAsReference(asset)}
                    className="p-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-teal-400 hover:text-teal-300 transition-all cursor-pointer"
                    title="Use this image as reference for next generation"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] rounded-3xl border border-white/20 bg-[#12131b] p-3 flex flex-col gap-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={modalImage.url}
              alt={modalImage.prompt}
              className="max-h-[75vh] w-auto object-contain rounded-2xl mx-auto"
            />
            <div className="flex items-center justify-between gap-4 px-2">
              <span className="text-xs text-slate-300 font-medium">
                {modalImage.prompt} ({modalImage.width}×{modalImage.height})
              </span>
              <button
                type="button"
                onClick={() => handleDownload(modalImage)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-400 text-black text-xs font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

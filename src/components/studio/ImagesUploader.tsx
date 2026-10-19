"use client";

import { AlertTriangle, CheckCircle2, Images } from "lucide-react";
import { useRef, useState } from "react";
import type { SRTData } from "@/lib/video-generator/types";

interface ImagesUploaderProps {
  srtData: SRTData | null;
  loadedImages: HTMLImageElement[];
  onImagesLoaded: (images: HTMLImageElement[]) => void;
}

function naturalSort(a: File, b: File): number {
  return a.name.localeCompare(b.name, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function ImagesUploader({
  srtData,
  loadedImages,
  onImagesLoaded,
}: ImagesUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: File[]) => {
    const imgFiles = files.filter(
      (f) =>
        f.type.startsWith("image/") ||
        /\.(jpg|jpeg|png|webp|bmp)$/i.test(f.name),
    );
    if (imgFiles.length === 0) {
      alert("Please select valid image files (JPG, PNG, WEBP).");
      return;
    }

    imgFiles.sort(naturalSort);
    setIsLoading(true);

    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    imgFiles.forEach((file) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      (img as HTMLImageElement & { fileName?: string }).fileName = file.name;

      img.onload = () => {
        loadedCount++;
        if (loadedCount === imgFiles.length) {
          setIsLoading(false);
          onImagesLoaded(images);
        }
      };

      img.onerror = () => {
        loadedCount++;
        if (loadedCount === imgFiles.length) {
          setIsLoading(false);
          onImagesLoaded(images);
        }
      };

      images.push(img);
    });
  };

  const cueCount = srtData ? srtData.cues.length : 0;
  const imageCount = loadedImages.length;
  const isMatch = cueCount > 0 && imageCount >= cueCount;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#10121a]/70 backdrop-blur-md p-5 shadow-xl">
      <div className="flex items-center gap-2 border-b border-white/5 pb-3 text-sm font-bold text-white tracking-wide">
        <Images className="w-4 h-4 text-orange-400" />
        <span>Step 3: Storyboard Images</span>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files.length) {
            processFiles(Array.from(e.dataTransfer.files));
          }
        }}
        className={`group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? "border-orange-500 bg-orange-500/10 scale-[0.99]"
            : loadedImages.length > 0
              ? "border-orange-500/40 bg-orange-500/5 hover:border-orange-500/60"
              : "border-white/15 hover:border-orange-500/50 hover:bg-white/2"
        }`}
      >
        <div className="text-3xl text-slate-400 group-hover:text-orange-400 group-hover:scale-110 transition-all">
          <Images className="w-8 h-8" />
        </div>
        <div className="text-sm font-semibold text-slate-200">
          {isLoading
            ? "Loading and sorting images..."
            : loadedImages.length > 0
              ? "Upload / Replace All Storyboard Images"
              : "Upload All Storyboard Images"}
        </div>
        <div className="text-xs text-slate-400">
          Select all split images (PNG, JPG, WEBP) — Automatically sorted
          naturally (1, 2, 3...)
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              processFiles(Array.from(e.target.files));
            }
          }}
        />
      </div>

      {loadedImages.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-xs font-semibold shadow-inner">
            <span className="text-orange-300">
              {loadedImages.length} images loaded
            </span>
            {cueCount > 0 && (
              <span
                className={`flex items-center gap-1 ${
                  isMatch ? "text-cyan-400" : "text-amber-400"
                }`}
              >
                {isMatch ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      Perfect: {imageCount} images for {cueCount} cues
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>
                      Need {cueCount - imageCount} more images ({imageCount}/
                      {cueCount})
                    </span>
                  </>
                )}
              </span>
            )}
          </div>

          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1 rounded-xl bg-black/40 border border-white/5 scrollbar-thin">
            {loadedImages.slice(0, 48).map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black shadow-md group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={`Slide ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all"
                />
                <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[9px] font-mono font-bold text-white shadow">
                  {idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

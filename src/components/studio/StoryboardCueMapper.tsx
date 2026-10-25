"use client";

import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Grid,
  Image as ImageIcon,
  Repeat,
  RotateCcw,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { SRTData } from "@/lib/video-generator/types";

interface StoryboardCueMapperProps {
  srtData: SRTData | null;
  loadedImages: HTMLImageElement[];
  cueAssetMap: Record<number, number> | undefined;
  onChange: (updatedMap: Record<number, number>) => void;
}

export function StoryboardCueMapper({
  srtData,
  loadedImages,
  cueAssetMap = {},
  onChange,
}: StoryboardCueMapperProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [activePickerCueIdx, setActivePickerCueIdx] = useState<number | null>(
    null,
  );

  const cues = srtData?.cues || [];
  const totalCues = cues.length;
  const totalImages = loadedImages.length;

  // Filtered cues based on search
  const filteredCues = useMemo(() => {
    if (!searchQuery.trim()) return cues;
    const q = searchQuery.toLowerCase().trim();
    return cues.filter(
      (c, idx) =>
        `scene ${idx + 1}`.includes(q) ||
        String(idx + 1) === q ||
        c.text.toLowerCase().includes(q),
    );
  }, [cues, searchQuery]);

  // Actions
  const handleMapSequential = () => {
    const nextMap: Record<number, number> = {};
    for (let i = 0; i < totalCues; i++) {
      nextMap[i] = i % totalImages;
    }
    onChange(nextMap);
  };

  const handleClearCustom = () => {
    onChange({});
  };

  const handleAssignImage = (cueIdx: number, imgIdx: number) => {
    const nextMap = { ...cueAssetMap, [cueIdx]: imgIdx };
    onChange(nextMap);
    setActivePickerCueIdx(null);
  };

  const handleSpanImage = (
    startCueIdx: number,
    imgIdx: number,
    count: number,
  ) => {
    const nextMap = { ...cueAssetMap };
    for (let i = 0; i < count; i++) {
      const targetIdx = startCueIdx + i;
      if (targetIdx < totalCues) {
        nextMap[targetIdx] = imgIdx;
      }
    }
    onChange(nextMap);
  };

  const formatMs = (ms: number) => {
    const totalSec = ms / 1000;
    const mins = Math.floor(totalSec / 60);
    const secs = (totalSec % 60).toFixed(1);
    return `${String(mins).padStart(2, "0")}:${secs.padStart(4, "0")}`;
  };

  if (totalCues === 0 || totalImages === 0) {
    return null;
  }

  const customCount = Object.keys(cueAssetMap).length;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#10121a]/70 backdrop-blur-md p-5 shadow-xl animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400">
            <Grid className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white font-heading tracking-wide">
                Visual Storyboard Cue Mapper
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                {customCount > 0
                  ? `${customCount} Custom Mapped`
                  : "Auto-Mapped (1:1 / Modulo)"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Assign, swap, and hold specific images on exact subtitle scenes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={handleMapSequential}
            title="Map each scene sequentially to corresponding image"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <Repeat className="w-3.5 h-3.5 text-cyan-400" />
            <span>Auto 1:1</span>
          </button>

          {customCount > 0 && (
            <button
              type="button"
              onClick={handleClearCustom}
              title="Reset all scenes back to default loop"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 text-xs transition-all cursor-pointer"
          >
            {isExpanded ? (
              <>
                <span>Collapse</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Expand Grid</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Search bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scene by text or number (e.g. 'golden arches', 'Scene 12')..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 bg-[#13141f] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Showing {filteredCues.length} of {totalCues} scenes
            </span>
          </div>

          {/* Storyboard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 max-h-[480px] overflow-y-auto pr-1 select-none">
            {filteredCues.map((cue) => {
              const cueIdx = cues.findIndex((c) => c.id === cue.id);
              const assignedImgIdx =
                cueAssetMap[cueIdx] !== undefined
                  ? cueAssetMap[cueIdx]
                  : cueIdx % totalImages;
              const activeImg = loadedImages[assignedImgIdx];
              const isCustom = cueAssetMap[cueIdx] !== undefined;
              const durationSec = ((cue.endMs - cue.startMs) / 1000).toFixed(1);
              const isPickerOpen = activePickerCueIdx === cueIdx;

              return (
                <div
                  key={cue.id}
                  className={`flex flex-col rounded-xl border p-3 transition-all relative ${
                    isCustom
                      ? "border-orange-500/40 bg-orange-950/10 shadow-lg shadow-orange-500/5"
                      : "border-white/10 bg-white/3 hover:border-white/20"
                  }`}
                >
                  {/* Scene header */}
                  <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
                    <span className="font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                      Scene #{cueIdx + 1}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{durationSec}s</span>
                    </span>
                  </div>

                  {/* Thumbnail / Image Selector Preview */}
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black group mb-2">
                    {activeImg ? (
                      <img
                        src={activeImg.src}
                        alt={`Scene ${cueIdx + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}

                    {/* Change overlay button */}
                    <button
                      type="button"
                      onClick={() =>
                        setActivePickerCueIdx(isPickerOpen ? null : cueIdx)
                      }
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-white text-xs font-semibold backdrop-blur-xs transition-opacity cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-cyan-400" />
                      <span>Change Image</span>
                    </button>

                    {/* Image index badge */}
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-slate-300 border border-white/10">
                      Img #{assignedImgIdx + 1}
                    </span>
                  </div>

                  {/* Subtitle text snippet */}
                  <p className="text-[11px] text-slate-300 font-medium line-clamp-2 leading-relaxed flex-1">
                    "{cue.text}"
                  </p>

                  {/* Bottom quick actions */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px]">
                    <span className="text-slate-500 font-mono">
                      {formatMs(cue.startMs)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleSpanImage(cueIdx, assignedImgIdx, 2)
                        }
                        title="Hold this image for next scene too"
                        className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-300 border border-white/5 font-mono cursor-pointer transition-all"
                      >
                        Span +2
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleSpanImage(cueIdx, assignedImgIdx, 3)
                        }
                        title="Hold this image for next 2 scenes"
                        className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-300 border border-white/5 font-mono cursor-pointer transition-all"
                      >
                        Span +3
                      </button>
                    </div>
                  </div>

                  {/* Popover Thumbnail Picker */}
                  {isPickerOpen && (
                    <div className="absolute top-12 left-0 right-0 z-30 p-3 rounded-xl border border-cyan-500/40 bg-[#121422] shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
                        <span className="font-bold text-white">
                          Select Image for Scene #{cueIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActivePickerCueIdx(null)}
                          className="text-slate-400 hover:text-white cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                        {loadedImages.map((img, imgI) => (
                          <div
                            key={imgI}
                            onClick={() => handleAssignImage(cueIdx, imgI)}
                            className={`relative aspect-video rounded-lg overflow-hidden border cursor-pointer group transition-all ${
                              imgI === assignedImgIdx
                                ? "border-cyan-400 ring-2 ring-cyan-400/50"
                                : "border-white/10 hover:border-white/40"
                            }`}
                          >
                            <img
                              src={img.src}
                              alt={`Option ${imgI + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/80 text-[9px] font-mono text-white">
                              #{imgI + 1}
                            </span>
                            {imgI === assignedImgIdx && (
                              <div className="absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-cyan-400 flex items-center justify-center text-black">
                                <Check className="w-2.5 h-2.5 stroke-3" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

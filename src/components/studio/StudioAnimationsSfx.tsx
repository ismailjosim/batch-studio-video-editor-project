"use client";

import { Eye, Shuffle, SlidersHorizontal, Wand2 } from "lucide-react";
import type { AnimSfxPreset } from "@/lib/video-generator/presets";
import { playSfxPreview } from "@/lib/video-generator/sfx-loader";
import { ANIMATIONS_LIST, SFX_LIST } from "@/lib/video-generator/transitions";
import type { VideoSettings } from "@/lib/video-generator/types";
import { AnimationItemCard } from "./animations/AnimationItemCard";
import { SfxItemCard } from "./animations/SfxItemCard";
import { PresetSelector } from "./presets/PresetSelector";

interface StudioAnimationsSfxProps {
  settings: VideoSettings;
  onChange: (updated: Partial<VideoSettings>) => void;
  onOpenPreview: (animId?: string) => void;
}

export function StudioAnimationsSfx({
  settings,
  onChange,
  onOpenPreview,
}: StudioAnimationsSfxProps) {
  const toggleAnim = (id: string) => {
    const next = new Set(settings.selectedAnims);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange({ selectedAnims: next, animMode: "custom" });
  };

  const toggleSfx = (id: string) => {
    const next = new Set(settings.selectedSfx);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange({ selectedSfx: next, sfxMode: "custom" });
  };

  const handleApplyPreset = (preset: AnimSfxPreset) => {
    onChange({
      selectedAnims: new Set(preset.selectedAnims),
      selectedSfx: new Set(preset.selectedSfx),
      isSfxEnabled: preset.isSfxEnabled,
      animMode: "custom",
      sfxMode: "custom",
    });
  };

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-[#10121a]/70 backdrop-blur-md p-5 shadow-xl">
      <div className="flex items-center gap-2 border-b border-white/5 pb-3 text-sm font-bold text-white tracking-wide">
        <Wand2 className="w-4 h-4 text-emerald-400" />
        <span>Step 2: Animation & Sound Effects Studio</span>
      </div>

      {/* Preset Selector & Custom Preset Saver */}
      <PresetSelector
        selectedAnims={settings.selectedAnims}
        selectedSfx={settings.selectedSfx}
        isSfxEnabled={settings.isSfxEnabled}
        onApplyPreset={handleApplyPreset}
      />

      {/* 10 Slide Animations */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div>
            <div className="text-sm font-bold text-white font-heading">
              10 Slide Transition Animations
            </div>
            <div className="text-xs text-slate-400">
              Modern presentation transitions that play seamlessly at scene
              changes
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onOpenPreview()}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Animations</span>
            </button>
            <div className="flex rounded-lg overflow-hidden border border-white/10">
              <button
                type="button"
                onClick={() =>
                  onChange({
                    animMode: "random",
                    selectedAnims: new Set(ANIMATIONS_LIST.map((a) => a.id)),
                  })
                }
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  settings.animMode === "random"
                    ? "bg-emerald-500 text-black"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                <Shuffle className="w-3 h-3" />
                <span>Randomize 10</span>
              </button>
              <button
                type="button"
                onClick={() => onChange({ animMode: "custom" })}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  settings.animMode === "custom"
                    ? "bg-emerald-500 text-black"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Custom</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-3">
          {ANIMATIONS_LIST.map((anim) => (
            <AnimationItemCard
              key={anim.id}
              anim={anim}
              isSelected={settings.selectedAnims.has(anim.id)}
              onToggle={toggleAnim}
              onPreview={(id) => onOpenPreview(id)}
            />
          ))}
        </div>
      </div>

      {/* Sound Effects Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div>
            <div className="text-sm font-bold text-white font-heading">
              Transition Sound Effects (SFX)
            </div>
            <div className="text-xs text-slate-400">
              High quality comic swoosh and pop sounds synchronized to each
              visual transition
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isSfxEnabled}
                onChange={(e) => onChange({ isSfxEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 focus:ring-offset-black accent-emerald-500"
              />
              <span>Enable Sound Effects</span>
            </label>

            {settings.isSfxEnabled && (
              <div className="flex rounded-lg overflow-hidden border border-white/10">
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      sfxMode: "random",
                      selectedSfx: new Set(SFX_LIST.map((s) => s.id)),
                    })
                  }
                  className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                    settings.sfxMode === "random"
                      ? "bg-emerald-500 text-black"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  Randomize SFX
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ sfxMode: "custom" })}
                  className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                    settings.sfxMode === "custom"
                      ? "bg-emerald-500 text-black"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  Custom
                </button>
              </div>
            )}
          </div>
        </div>

        {settings.isSfxEnabled ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            {SFX_LIST.map((sfx) => (
              <SfxItemCard
                key={sfx.id}
                sfx={sfx}
                isSelected={settings.selectedSfx.has(sfx.id)}
                onToggle={toggleSfx}
                onPlayPreview={(id) => playSfxPreview(id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-white/5 bg-white/2 text-center text-xs text-slate-500 mt-3">
            SFX sound effects are currently muted. Check "Enable Sound Effects"
            above to activate.
          </div>
        )}
      </div>
    </div>
  );
}

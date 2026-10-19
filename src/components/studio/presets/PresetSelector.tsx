"use client";

import { Bookmark, Check, Plus, Sparkles, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  type AnimSfxPreset,
  BUILT_IN_PRESETS,
  deleteCustomPreset,
  getCustomPresets,
  saveCustomPreset,
} from "@/lib/video-generator/presets";

interface PresetSelectorProps {
  selectedAnims: Set<string>;
  selectedSfx: Set<string>;
  isSfxEnabled: boolean;
  onApplyPreset: (preset: AnimSfxPreset) => void;
}

export function PresetSelector({
  selectedAnims,
  selectedSfx,
  isSfxEnabled,
  onApplyPreset,
}: PresetSelectorProps) {
  const [customPresets, setCustomPresets] = useState<AnimSfxPreset[]>([]);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetDesc, setNewPresetDesc] = useState("");
  const [activePresetId, setActivePresetId] = useState<string | null>(
    "preset-dollar-doodles",
  );
  const [savedSuccessMsg, setSavedSuccessMsg] = useState("");

  useEffect(() => {
    setCustomPresets(getCustomPresets());
  }, []);

  const allPresets = [...BUILT_IN_PRESETS, ...customPresets];

  const handleSelectPreset = (preset: AnimSfxPreset) => {
    setActivePresetId(preset.id);
    onApplyPreset(preset);
  };

  const handleSaveNewPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const saved = saveCustomPreset(
      newPresetName,
      newPresetDesc,
      Array.from(selectedAnims),
      Array.from(selectedSfx),
      isSfxEnabled,
    );

    setCustomPresets((prev) => [saved, ...prev]);
    setActivePresetId(saved.id);
    setNewPresetName("");
    setNewPresetDesc("");
    setSaveModalOpen(false);
    setSavedSuccessMsg(`Saved preset "${saved.name}"!`);
    setTimeout(() => setSavedSuccessMsg(""), 3000);
  };

  const handleDeletePreset = (id: string, name: string) => {
    if (confirm(`Delete custom preset "${name}"?`)) {
      const updated = deleteCustomPreset(id);
      setCustomPresets(updated);
      if (activePresetId === id) setActivePresetId(null);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl border border-white/10 bg-[#10121a]/90 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Animation & SFX Presets
          </span>
          <span className="text-[10px] text-slate-400">
            (Quickly apply or save custom configurations)
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSaveModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-400 hover:text-black text-cyan-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Save Current as Preset</span>
        </button>
      </div>

      {savedSuccessMsg && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-xs text-cyan-300 animate-in fade-in">
          <Check className="w-3.5 h-3.5 text-cyan-400" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Preset Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
        {allPresets.map((preset) => {
          const isActive = activePresetId === preset.id;
          return (
            <div
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`group relative flex flex-col justify-between p-3 rounded-xl border transition-all cursor-pointer text-left ${
                isActive
                  ? "border-cyan-400 bg-cyan-500/15 shadow-md shadow-cyan-500/10"
                  : "border-white/10 bg-white/2 hover:border-white/20 hover:bg-white/5"
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <Sparkles
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-cyan-400" : "text-slate-400"
                    }`}
                  />
                  <span className="truncate">{preset.name}</span>
                </span>

                {!preset.isBuiltIn && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePreset(preset.id, preset.name);
                    }}
                    title="Delete preset"
                    className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              <span className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                {preset.desc}
              </span>

              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/5 text-[9px] text-slate-400">
                <span className="px-1.5 py-0.5 rounded bg-white/5 font-mono">
                  {preset.selectedAnims.length} Anims
                </span>
                <span className="px-1.5 py-0.5 rounded bg-white/5 font-mono">
                  {preset.isSfxEnabled
                    ? `${preset.selectedSfx.length} SFX`
                    : "Muted"}
                </span>
                {preset.isBuiltIn && (
                  <span className="ml-auto text-cyan-400 font-semibold uppercase text-[8px]">
                    Built-in
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#12131b] p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  Save Current Preset
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSaveModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSaveNewPreset}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="preset-name"
                  className="text-xs font-semibold text-slate-300"
                >
                  Preset Name
                </label>
                <input
                  id="preset-name"
                  type="text"
                  required
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="e.g. My Fast YouTube Style"
                  className="rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="preset-desc"
                  className="text-xs font-semibold text-slate-300"
                >
                  Description (Optional)
                </label>
                <input
                  id="preset-desc"
                  type="text"
                  value={newPresetDesc}
                  onChange={(e) => setNewPresetDesc(e.target.value)}
                  placeholder="e.g. Glitch and zooms for high-paced shorts"
                  className="rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-white/5 bg-black/30 p-2.5 text-[11px] text-slate-400 flex flex-col gap-1">
                <span className="font-semibold text-slate-300">
                  Current settings captured:
                </span>
                <span>• {selectedAnims.size} active animation transitions</span>
                <span>
                  •{" "}
                  {isSfxEnabled
                    ? `${selectedSfx.size} active SFX sounds`
                    : "Sound effects muted"}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-linear-to-r from-[#00d2ff] via-[#38bdf8] to-[#0284c7] hover:brightness-110 text-black text-xs font-extrabold cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

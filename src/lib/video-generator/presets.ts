import { ANIMATIONS_LIST, SFX_LIST } from "./transitions";

export interface AnimSfxPreset {
  id: string;
  name: string;
  desc: string;
  isBuiltIn?: boolean;
  selectedAnims: string[];
  selectedSfx: string[];
  isSfxEnabled: boolean;
}

export const BUILT_IN_PRESETS: AnimSfxPreset[] = [
  {
    id: "preset-dollar-doodles",
    name: "Dollar Doodles Signature",
    desc: "All 10 dynamic animations + full comic SFX package for maximum engagement",
    isBuiltIn: true,
    selectedAnims: ANIMATIONS_LIST.map((a) => a.id),
    selectedSfx: SFX_LIST.map((s) => s.id),
    isSfxEnabled: true,
  },
  {
    id: "preset-punchy-action",
    name: "Fast & Punchy",
    desc: "Glitch, Flash, Push, Wipe and high-energy whoosh/pop sound effects",
    isBuiltIn: true,
    selectedAnims: ["glitch", "flash", "push", "wipe", "zoom"],
    selectedSfx: ["whoosh", "pop", "whip", "swipe"],
    isSfxEnabled: true,
  },
  {
    id: "preset-smooth-cinematic",
    name: "Smooth Cinematic",
    desc: "Crossfade, Zoom, Pan, Iris, and Radial with subtle atmospheric swooshes",
    isBuiltIn: true,
    selectedAnims: ["crossfade", "zoom", "pan", "iris", "radial"],
    selectedSfx: ["swoosh", "breeze", "wind"],
    isSfxEnabled: true,
  },
  {
    id: "preset-clean-silent",
    name: "Clean & Silent (No SFX)",
    desc: "All visual transitions enabled, but transition sound effects muted",
    isBuiltIn: true,
    selectedAnims: ANIMATIONS_LIST.map((a) => a.id),
    selectedSfx: [],
    isSfxEnabled: false,
  },
];

const PRESETS_STORAGE_KEY = "dollar_doodles_anim_sfx_presets";

export function getCustomPresets(): AnimSfxPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed loading presets from storage:", err);
    return [];
  }
}

export function saveCustomPreset(
  name: string,
  desc: string,
  selectedAnims: string[],
  selectedSfx: string[],
  isSfxEnabled: boolean,
): AnimSfxPreset {
  const newPreset: AnimSfxPreset = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || "Custom Preset",
    desc:
      desc.trim() ||
      `${selectedAnims.length} animations, ${selectedSfx.length} SFX`,
    isBuiltIn: false,
    selectedAnims,
    selectedSfx,
    isSfxEnabled,
  };

  const existing = getCustomPresets();
  const updated = [newPreset, ...existing];
  try {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed saving preset to storage:", err);
  }
  return newPreset;
}

export function deleteCustomPreset(id: string): AnimSfxPreset[] {
  const existing = getCustomPresets();
  const updated = existing.filter((p) => p.id !== id);
  try {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed deleting preset from storage:", err);
  }
  return updated;
}

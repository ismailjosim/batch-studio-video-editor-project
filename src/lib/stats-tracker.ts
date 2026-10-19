const STATS_KEY = "dollar_doodles_app_stats_v1";

export interface AppLocalStats {
  totalImagesGenerated: number;
  totalSubtitlesSplit: number;
  totalBatchesCreated: number;
  lastActiveTimestamp: number;
}

const DEFAULT_STATS: AppLocalStats = {
  totalImagesGenerated: 0,
  totalSubtitlesSplit: 0,
  totalBatchesCreated: 0,
  lastActiveTimestamp: Date.now(),
};

export function getLocalStats(): AppLocalStats {
  if (typeof window === "undefined") return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw) as Partial<AppLocalStats>;
    return {
      totalImagesGenerated: parsed.totalImagesGenerated ?? 0,
      totalSubtitlesSplit: parsed.totalSubtitlesSplit ?? 0,
      totalBatchesCreated: parsed.totalBatchesCreated ?? 0,
      lastActiveTimestamp: parsed.lastActiveTimestamp ?? Date.now(),
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function recordImageGeneration(count = 1): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalStats();
    const updated: AppLocalStats = {
      ...current,
      totalImagesGenerated: current.totalImagesGenerated + count,
      lastActiveTimestamp: Date.now(),
    };
    localStorage.setItem(STATS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to record image stats:", err);
  }
}

export function recordSubtitleSplit(
  batchesCount: number,
  subsCount: number,
): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalStats();
    const updated: AppLocalStats = {
      ...current,
      totalBatchesCreated: current.totalBatchesCreated + batchesCount,
      totalSubtitlesSplit: current.totalSubtitlesSplit + subsCount,
      lastActiveTimestamp: Date.now(),
    };
    localStorage.setItem(STATS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to record subtitle split stats:", err);
  }
}

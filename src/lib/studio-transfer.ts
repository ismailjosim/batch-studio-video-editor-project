import type { SRTData } from "./video-generator/types";

const CUES_TRANSFER_KEY = "dollar_doodles_transfer_cues_v1";
const IMAGES_TRANSFER_KEY = "dollar_doodles_transfer_images_v1";

export function saveTransferCues(data: SRTData): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CUES_TRANSFER_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn("Failed to save cues to sessionStorage:", err);
  }
}

export function consumeTransferCues(): SRTData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CUES_TRANSFER_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(CUES_TRANSFER_KEY);
    const parsed = JSON.parse(raw) as SRTData;
    if (parsed && Array.isArray(parsed.cues)) {
      return parsed;
    }
  } catch (err) {
    console.warn("Failed to consume cues from sessionStorage:", err);
  }
  return null;
}

export function saveTransferImages(imageUrls: string[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(IMAGES_TRANSFER_KEY, JSON.stringify(imageUrls));
  } catch (err) {
    console.warn("Failed to save images to sessionStorage:", err);
  }
}

export function consumeTransferImages(): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(IMAGES_TRANSFER_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(IMAGES_TRANSFER_KEY);
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.warn("Failed to consume images from sessionStorage:", err);
  }
  return null;
}

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

const AUDIO_DB_NAME = "dollar_doodles_transfer_db";
const AUDIO_STORE_NAME = "audio_store";
const AUDIO_RECORD_KEY = "transfer_audio";

export async function saveTransferAudio(
  blob: Blob,
  fileName: string,
): Promise<void> {
  if (typeof window === "undefined" || !window.indexedDB) return;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(AUDIO_DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(AUDIO_STORE_NAME);
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(AUDIO_STORE_NAME, "readwrite");
      const store = tx.objectStore(AUDIO_STORE_NAME);
      store.put({ blob, fileName }, AUDIO_RECORD_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function consumeTransferAudio(): Promise<{
  blob: Blob;
  fileName: string;
} | null> {
  if (typeof window === "undefined" || !window.indexedDB) return null;
  return new Promise((resolve) => {
    const request = indexedDB.open(AUDIO_DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(AUDIO_STORE_NAME);
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(AUDIO_STORE_NAME, "readwrite");
      const store = tx.objectStore(AUDIO_STORE_NAME);
      const getReq = store.get(AUDIO_RECORD_KEY);
      getReq.onsuccess = () => {
        const result = getReq.result;
        if (result && result.blob) {
          store.delete(AUDIO_RECORD_KEY);
          resolve(result);
        } else {
          resolve(null);
        }
      };
      getReq.onerror = () => resolve(null);
    };
    request.onerror = () => resolve(null);
  });
}


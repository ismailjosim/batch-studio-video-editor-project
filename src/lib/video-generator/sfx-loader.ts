import { SFX_LIST } from "./transitions";

const loadedSfxBuffers: Record<string, AudioBuffer> = {};
let sharedAudioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedAudioContext && typeof window !== "undefined") {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    sharedAudioContext = new AudioCtx();
  }
  return sharedAudioContext!;
}

/**
 * Decodes audio buffer from in-memory pre-bundle (window.SFX_BUNDLE) or falls back to fetch.
 * When decoding from base64, 0 HTTP network requests to .wav are fired, 100% bypassing IDM interception.
 */
export async function getOrLoadSfxBuffer(
  sfxId: string,
): Promise<AudioBuffer | null> {
  if (loadedSfxBuffers[sfxId]) return loadedSfxBuffers[sfxId];
  if (typeof window === "undefined") return null;

  const audioCtx = getAudioContext();

  // 1. Decode directly from in-memory bundle
  const windowObj = window as unknown as {
    SFX_BUNDLE?: Record<string, string>;
  };
  if (windowObj.SFX_BUNDLE?.[sfxId]) {
    try {
      const b64 = windowObj.SFX_BUNDLE[sfxId];
      const binaryStr = atob(b64);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const decoded = await audioCtx.decodeAudioData(bytes.buffer.slice(0));
      loadedSfxBuffers[sfxId] = decoded;
      return decoded;
    } catch (bErr) {
      console.warn(`Failed decoding bundled SFX ${sfxId}:`, bErr);
    }
  }

  // 2. Fallback to /sfx/{file}
  const sfx = SFX_LIST.find((s) => s.id === sfxId);
  if (!sfx) return null;

  try {
    const res = await fetch(sfx.file, {
      headers: { "X-Requested-With": "XMLHttpRequest" },
    });
    const buf = await res.arrayBuffer();
    const decoded = await audioCtx.decodeAudioData(buf);
    loadedSfxBuffers[sfxId] = decoded;
    return decoded;
  } catch (err) {
    console.warn(`SFX ${sfxId} load error:`, err);
    return null;
  }
}

export async function playSfxPreview(sfxId: string): Promise<void> {
  if (typeof window === "undefined") return;
  const audioCtx = getAudioContext();
  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }

  const buf = await getOrLoadSfxBuffer(sfxId);
  if (buf) {
    const source = audioCtx.createBufferSource();
    source.buffer = buf;
    source.connect(audioCtx.destination);
    source.start();
  }
}

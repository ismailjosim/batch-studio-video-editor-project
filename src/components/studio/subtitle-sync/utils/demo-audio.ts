import type { SubtitleCue, WordTiming } from "../subtitle-sync-types";

/**
 * Computes estimated word timings for a subtitle cue based on word character weights.
 */
export function computeDefaultWordTimings(
  text: string,
  startMs: number,
  endMs: number,
): WordTiming[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  if (words.length === 1) {
    return [{ word: words[0], startMs, endMs }];
  }

  const durationMs = Math.max(100, endMs - startMs);
  // Weight words by character length with a base weight of 2
  const weights = words.map((w) => Math.max(2, w.length));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  let currentStart = startMs;
  return words.map((word, idx) => {
    const fraction = weights[idx] / totalWeight;
    const wordDuration = Math.round(durationMs * fraction);
    const wordEnd =
      idx === words.length - 1
        ? endMs
        : Math.min(endMs, currentStart + wordDuration);
    const item: WordTiming = {
      word,
      startMs: Math.round(currentStart),
      endMs: Math.round(wordEnd),
    };
    currentStart = wordEnd;
    return item;
  });
}

/**
 * Generates an in-memory speech-like synthesized audio beep demo for instant testing.
 */
export function createDemoAudioBuffer(): ArrayBuffer {
  // 15 seconds tone with varying modulation simulating voice cadence
  const sampleRate = 22050;
  const duration = 20; // 20s
  const numSamples = sampleRate * duration;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // PCM format
  view.setUint16(20, 1, true); // Linear quantization
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  writeString(36, "data");
  view.setUint32(40, numSamples * 2, true);

  // Generate synthetic voice-like envelope bursts
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Voice cadence modulation (speech bursts)
    const cadence = Math.sin(2 * Math.PI * 1.5 * t);
    const speechActive = cadence > -0.2 ? 1 : 0.05;
    const tone =
      Math.sin(2 * Math.PI * 220 * t) * 0.4 +
      Math.sin(2 * Math.PI * 440 * t) * 0.2 +
      Math.sin(2 * Math.PI * 880 * t) * 0.1;
    const sample = Math.max(-1, Math.min(1, tone * speechActive * 0.6));
    view.setInt16(
      44 + i * 2,
      sample < 0 ? sample * 0x8000 : sample * 0x7fff,
      true,
    );
  }

  return buffer;
}

/**
 * Generates an in-memory gentle chill ambient chord background music track for instant multi-track testing.
 */
export function createDemoBgmAudioBuffer(): ArrayBuffer {
  const sampleRate = 22050;
  const duration = 25; // 25 seconds
  const numSamples = sampleRate * duration;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, numSamples * 2, true);

  // Smooth warm electric-piano / ambient pad chords (Cmaj9, Am9, Fmaj7, G7sus4)
  const chordFrequencies = [
    [130.81, 196.0, 246.94, 293.66], // C3, G3, B3, D4 (Cmaj9)
    [110.0, 164.81, 220.0, 261.63], // A2, E3, A3, C4 (Am)
    [87.31, 130.81, 174.61, 220.0], // F2, C3, F3, A3 (Fmaj7)
    [98.0, 146.83, 196.0, 261.63], // G2, D3, G3, C4 (Gsus4)
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const chordIndex = Math.floor((t / 6.25) % chordFrequencies.length);
    const chord = chordFrequencies[chordIndex];

    let sample = 0;
    for (let c = 0; c < chord.length; c++) {
      const freq = chord[c];
      const tremolo = 1 + 0.15 * Math.sin(2 * Math.PI * 4 * t);
      sample +=
        (Math.sin(2 * Math.PI * freq * t) * 0.12 * tremolo) / chord.length;
    }

    // Fade in and fade out
    const env = t < 1.0 ? t : t > duration - 1.5 ? (duration - t) / 1.5 : 1.0;
    const finalSample = Math.max(-1, Math.min(1, sample * env));
    view.setInt16(44 + i * 2, Math.floor(finalSample * 32767), true);
  }

  return buffer;
}

/**
 * Default sample cues matching the Subtitle Studio demo screenshot.
 */
export const DEMO_SUBTITLE_CUES: SubtitleCue[] = [
  {
    id: 1,
    startMs: 0,
    endMs: 4200,
    text: "Every economics textbook on earth starts with the exact same campfire story.",
  },
  {
    id: 2,
    startMs: 4400,
    endMs: 5600,
    text: "You own a cow.",
  },
  {
    id: 3,
    startMs: 5800,
    endMs: 7800,
    text: "Your neighbor makes leather shoes.",
  },
  {
    id: 4,
    startMs: 8000,
    endMs: 9400,
    text: "One day you need boots,",
  },
  {
    id: 5,
    startMs: 9600,
    endMs: 12100,
    text: "So you walk your cow over to his workshop.",
  },
  {
    id: 6,
    startMs: 12300,
    endMs: 15400,
    text: "You offer him the cow in exchange for a pair of sturdy work boots.",
  },
  {
    id: 7,
    startMs: 15600,
    endMs: 17100,
    text: "There is just one immediate,",
  },
  {
    id: 8,
    startMs: 17200,
    endMs: 18900,
    text: "embarrassing problem.",
  },
  {
    id: 9,
    startMs: 19100,
    endMs: 22000,
    text: "A single pair of boots is not worth an entire live cow.",
  },
  {
    id: 10,
    startMs: 22200,
    endMs: 24800,
    text: "Do you leave the cow with him and ask for change?",
  },
];

import type { SubtitleCue } from "../subtitle-sync-types";

export interface SpeechInterval {
  startMs: number;
  endMs: number;
}

/**
 * Detects voice activity and speech intervals from an AudioBuffer using RMS energy profiling.
 * Accurately finds active voice boundaries while filtering out silent pauses and room noise.
 */
export function detectVoiceIntervals(
  audioBuffer: AudioBuffer,
  options?: {
    silenceThresholdRatio?: number;
    minSpeechDurationMs?: number;
    minSilenceDurationMs?: number;
  },
): SpeechInterval[] {
  const {
    silenceThresholdRatio = 0.035,
    minSpeechDurationMs = 180,
    minSilenceDurationMs = 240,
  } = options || {};

  const sampleRate = audioBuffer.sampleRate;
  const numChannels = audioBuffer.numberOfChannels;
  const totalSamples = audioBuffer.length;

  // 20ms analysis window
  const windowSize = Math.max(1, Math.round(sampleRate * 0.02));
  const numWindows = Math.floor(totalSamples / windowSize);

  const energyFrames: number[] = new Float32Array(
    numWindows,
  ) as unknown as number[];
  let maxEnergy = 0;
  let avgEnergy = 0;

  for (let w = 0; w < numWindows; w++) {
    const startSample = w * windowSize;
    let sumSq = 0;
    for (let c = 0; c < numChannels; c++) {
      const chData = audioBuffer.getChannelData(c);
      for (let s = 0; s < windowSize; s += 2) {
        const val = chData[startSample + s];
        sumSq += val * val;
      }
    }
    const rms = Math.sqrt(sumSq / ((windowSize / 2) * numChannels));
    energyFrames[w] = rms;
    if (rms > maxEnergy) maxEnergy = rms;
    avgEnergy += rms;
  }
  avgEnergy = avgEnergy / Math.max(1, numWindows);

  // Dynamic adaptive voice threshold
  const threshold = Math.max(
    0.012,
    Math.max(maxEnergy * silenceThresholdRatio, avgEnergy * 0.32),
  );

  const frameDurationMs = (windowSize / sampleRate) * 1000;
  const minSpeechFrames = Math.ceil(minSpeechDurationMs / frameDurationMs);
  const minSilenceFrames = Math.ceil(minSilenceDurationMs / frameDurationMs);

  const rawIntervals: SpeechInterval[] = [];
  let inSpeech = false;
  let speechStartFrame = 0;
  let silenceCounter = 0;

  for (let w = 0; w < numWindows; w++) {
    const isVoice = energyFrames[w] >= threshold;

    if (isVoice) {
      if (!inSpeech) {
        inSpeech = true;
        speechStartFrame = w;
      }
      silenceCounter = 0;
    } else {
      if (inSpeech) {
        silenceCounter++;
        if (silenceCounter >= minSilenceFrames) {
          const speechEndFrame = w - silenceCounter;
          if (speechEndFrame - speechStartFrame >= minSpeechFrames) {
            rawIntervals.push({
              startMs: Math.round(speechStartFrame * frameDurationMs),
              endMs: Math.round(speechEndFrame * frameDurationMs),
            });
          }
          inSpeech = false;
          silenceCounter = 0;
        }
      }
    }
  }

  // Final trailing speech segment
  if (inSpeech && numWindows - speechStartFrame >= minSpeechFrames) {
    rawIntervals.push({
      startMs: Math.round(speechStartFrame * frameDurationMs),
      endMs: Math.round(numWindows * frameDurationMs),
    });
  }

  // Add 40ms attack / 80ms release padding so plosives/consonants aren't clipped
  return rawIntervals.map((interval, i) => {
    const prevEnd = i > 0 ? rawIntervals[i - 1].endMs : 0;
    const nextStart =
      i < rawIntervals.length - 1
        ? rawIntervals[i + 1].startMs
        : Number.POSITIVE_INFINITY;
    const startMs = Math.max(prevEnd + 20, interval.startMs - 40);
    const endMs = Math.min(nextStart - 20, interval.endMs + 80);
    return { startMs, endMs };
  });
}

/**
 * Aligns subtitle cues to detected speech intervals.
 * Snaps cue start and end to real spoken voice boundaries while preserving sentence sequence.
 */
export function autoAlignCuesToVoice(
  cues: SubtitleCue[],
  speechIntervals: SpeechInterval[],
): {
  alignedCues: SubtitleCue[];
  adjustedCount: number;
  silenceSavedMs: number;
} {
  if (cues.length === 0 || speechIntervals.length === 0) {
    return { alignedCues: cues, adjustedCount: 0, silenceSavedMs: 0 };
  }

  let adjustedCount = 0;
  let silenceSavedMs = 0;

  const alignedCues: SubtitleCue[] = cues.map((c) => ({ ...c }));

  for (let i = 0; i < alignedCues.length; i++) {
    const cue = alignedCues[i];
    const prevCue = i > 0 ? alignedCues[i - 1] : null;
    const nextCue = i < alignedCues.length - 1 ? alignedCues[i + 1] : null;

    const minBound = prevCue ? prevCue.endMs + 20 : 0;
    const maxBound = nextCue ? nextCue.startMs - 20 : Number.POSITIVE_INFINITY;

    // Overlapping speech intervals
    const overlapping = speechIntervals.filter(
      (si) => si.endMs >= cue.startMs && si.startMs <= cue.endMs,
    );

    if (overlapping.length > 0) {
      const bestStart = Math.min(...overlapping.map((o) => o.startMs));
      const bestEnd = Math.max(...overlapping.map((o) => o.endMs));

      const newStart = Math.max(minBound, bestStart);
      const newEnd = Math.min(maxBound, Math.max(newStart + 250, bestEnd));

      if (
        Math.abs(newStart - cue.startMs) > 30 ||
        Math.abs(newEnd - cue.endMs) > 30
      ) {
        const origDuration = cue.endMs - cue.startMs;
        const newDuration = newEnd - newStart;
        if (newDuration < origDuration) {
          silenceSavedMs += origDuration - newDuration;
        }
        cue.startMs = Math.round(newStart);
        cue.endMs = Math.round(newEnd);
        adjustedCount++;
      }
    } else {
      // Find closest interval within 1.5 seconds
      const candidates = speechIntervals
        .map((si) => ({
          interval: si,
          dist: Math.min(
            Math.abs(si.startMs - cue.startMs),
            Math.abs(si.endMs - cue.endMs),
          ),
        }))
        .filter((c) => c.dist <= 1500)
        .sort((a, b) => a.dist - b.dist);

      const closest = candidates[0];
      if (closest) {
        const newStart = Math.max(minBound, closest.interval.startMs);
        const newEnd = Math.min(
          maxBound,
          Math.max(newStart + 250, closest.interval.endMs),
        );
        cue.startMs = Math.round(newStart);
        cue.endMs = Math.round(newEnd);
        adjustedCount++;
      }
    }
  }

  return { alignedCues, adjustedCount, silenceSavedMs };
}

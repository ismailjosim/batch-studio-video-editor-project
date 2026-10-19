/**
 * Decodes audio buffer and extracts amplitude peaks for waveform visualization.
 */
export async function decodeAudioWaveform(
  buffer: ArrayBuffer,
  _targetBucketCount = 2400,
): Promise<{ peaks: number[]; duration: number; audioBuffer?: AudioBuffer }> {
  const AudioContextClass =
    window.AudioContext ||
    // @ts-expect-error webkit prefix fallback
    window.webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error("Web Audio API is not supported in this browser");
  }

  const audioCtx = new AudioContextClass();
  try {
    const audioBuffer = await audioCtx.decodeAudioData(buffer.slice(0));
    const duration = audioBuffer.duration;
    const numChannels = audioBuffer.numberOfChannels;
    const channelData: Float32Array[] = [];

    for (let i = 0; i < numChannels; i++) {
      channelData.push(audioBuffer.getChannelData(i));
    }

    const totalSamples = audioBuffer.length;
    // Adapt bucket count according to audio duration
    const bucketCount = Math.min(
      16000,
      Math.max(600, Math.round(duration * 25)),
    );
    const bucketSize = Math.max(1, Math.floor(totalSamples / bucketCount));

    const peaks: number[] = new Array(bucketCount);
    for (let b = 0; b < bucketCount; b++) {
      let maxPeak = 0;
      const start = b * bucketSize;
      const end = Math.min(totalSamples, start + bucketSize);

      for (let s = start; s < end; s += 2) {
        for (let c = 0; c < numChannels; c++) {
          const val = Math.abs(channelData[c][s]);
          if (val > maxPeak) maxPeak = val;
        }
      }
      peaks[b] = maxPeak;
    }

    return { peaks, duration, audioBuffer };
  } finally {
    try {
      await audioCtx.close();
    } catch {
      // Ignore audioContext close errors
    }
  }
}

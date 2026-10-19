/**
 * Hardware-accelerated VideoEncoder configuration with 2K (1440p) level support.
 * 2K resolution requires H.264 Level 5.0 or 5.1.
 */
export async function configureVideoEncoder(
  encoder: VideoEncoder,
  width: number,
  height: number,
  bitrate: number,
  fps: number,
): Promise<VideoEncoderConfig> {
  const is2K = width > 1920 || height > 1920;

  // Candidate codecs in order of modern hardware acceleration preference
  // 2K (1440p) requires Level 5.0 (32) or 5.1 (33)
  const candidateCodecs = is2K
    ? [
        "avc1.640033", // High Profile, Level 5.1 (Standard for 1440p/2K hardware acceleration)
        "avc1.4d0033", // Main Profile, Level 5.1
        "avc1.640032", // High Profile, Level 5.0
        "avc1.4d0032", // Main Profile, Level 5.0
        "avc1.420033", // Baseline, Level 5.1
        "avc1.64002a", // High Profile, Level 4.2 fallback
        "avc1.4d002a", // Main Profile, Level 4.2 fallback
      ]
    : [
        "avc1.64002a", // High Profile, Level 4.2 (1080p 60fps)
        "avc1.4d002a", // Main Profile, Level 4.2
        "avc1.42001f", // Baseline, Level 3.1 (720p)
        "avc1.640033",
      ];

  let chosenConfig: VideoEncoderConfig | null = null;
  if (typeof VideoEncoder !== "undefined" && VideoEncoder.isConfigSupported) {
    for (const codec of candidateCodecs) {
      try {
        const testConfig: VideoEncoderConfig = {
          codec,
          width,
          height,
          bitrate,
          framerate: fps,
          hardwareAcceleration: "prefer-hardware",
        };
        const support = await VideoEncoder.isConfigSupported(testConfig);
        if (support?.supported) {
          chosenConfig = support.config || testConfig;
          console.log(
            `WebCodecs: Using supported hardware-accelerated codec ${codec} for ${width}x${height}`,
          );
          break;
        }
      } catch {
        // Continue to next candidate
      }
    }
  }

  if (!chosenConfig) {
    chosenConfig = {
      codec: is2K ? "avc1.640033" : "avc1.4d002a",
      width,
      height,
      bitrate,
      framerate: fps,
      hardwareAcceleration: "prefer-hardware",
    };
  }

  encoder.configure(chosenConfig);
  return chosenConfig;
}

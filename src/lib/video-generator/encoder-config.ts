/**
 * Hardware-accelerated and software fallback VideoEncoder configuration.
 * Validates codec candidates using a live 3-frame probe before encoding
 * to prevent runtime crashes (e.g. MediaFoundation delta frame errors at 2K).
 */

export interface ConfiguredEncoderResult {
  config: VideoEncoderConfig;
  width: number;
  height: number;
  bitrate: number;
  wasScaledDown: boolean;
  notice?: string;
}

interface CodecCandidate {
  codec: string;
  acceleration: HardwareAcceleration;
}

/**
 * Fast real-frame encoding probe.
 * Feeds a keyframe and delta frames to a temporary VideoEncoder to verify
 * that the underlying GPU driver actually encodes without throwing OperationError.
 */
async function probeCanEncode(config: VideoEncoderConfig): Promise<boolean> {
  if (typeof VideoEncoder === "undefined") return false;

  return new Promise<boolean>((resolve) => {
    let finished = false;
    let tempEncoder: VideoEncoder | null = null;
    let canvas: HTMLCanvasElement | OffscreenCanvas | null = null;

    const cleanup = () => {
      if (tempEncoder && tempEncoder.state !== "closed") {
        try {
          tempEncoder.close();
        } catch {}
      }
      tempEncoder = null;
      canvas = null;
    };

    const done = (success: boolean) => {
      if (!finished) {
        finished = true;
        cleanup();
        resolve(success);
      }
    };

    // Watchdog to prevent hanging if encoder locks up
    const timer = setTimeout(() => done(false), 1200);

    try {
      tempEncoder = new VideoEncoder({
        output: () => {},
        error: (err) => {
          console.warn("Probe encode error for", config.codec, err);
          clearTimeout(timer);
          done(false);
        },
      });

      tempEncoder.configure(config);

      canvas =
        typeof OffscreenCanvas !== "undefined"
          ? new OffscreenCanvas(config.width, config.height)
          : document.createElement("canvas");
      canvas.width = config.width;
      canvas.height = config.height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#0c0c10";
        ctx.fillRect(0, 0, config.width, config.height);
      }

      // Encode 3 frames: frame 0 (keyframe), frame 1 (delta), frame 2 (delta)
      for (let i = 0; i < 3; i++) {
        if (tempEncoder.state === "closed") {
          clearTimeout(timer);
          done(false);
          return;
        }
        const frame = new VideoFrame(canvas as CanvasImageSource, {
          timestamp: i * 33333,
        });
        tempEncoder.encode(frame, { keyFrame: i === 0 });
        frame.close();
      }

      tempEncoder
        .flush()
        .then(() => {
          clearTimeout(timer);
          done(true);
        })
        .catch(() => {
          clearTimeout(timer);
          done(false);
        });
    } catch {
      clearTimeout(timer);
      done(false);
    }
  });
}

function getCandidateList(is2K: boolean): CodecCandidate[] {
  if (is2K) {
    return [
      // 1. no-preference lets browser select optimal stable pipeline
      { codec: "avc1.640033", acceleration: "no-preference" },
      { codec: "avc1.4d0033", acceleration: "no-preference" },
      { codec: "avc1.420033", acceleration: "no-preference" },
      { codec: "avc1.42e033", acceleration: "no-preference" },
      { codec: "avc1.640032", acceleration: "no-preference" },
      { codec: "avc1.4d0032", acceleration: "no-preference" },
      { codec: "avc1.420032", acceleration: "no-preference" },
      { codec: "avc1.42e032", acceleration: "no-preference" },
      // 2. Hardware preferred candidates
      { codec: "avc1.640033", acceleration: "prefer-hardware" },
      { codec: "avc1.4d0033", acceleration: "prefer-hardware" },
      { codec: "avc1.420033", acceleration: "prefer-hardware" },
      // 3. Software fallback
      { codec: "avc1.420033", acceleration: "prefer-software" },
      { codec: "avc1.420032", acceleration: "prefer-software" },
    ];
  }

  return [
    // Standard 1080p / 720p
    { codec: "avc1.64002a", acceleration: "no-preference" },
    { codec: "avc1.4d002a", acceleration: "no-preference" },
    { codec: "avc1.42002a", acceleration: "no-preference" },
    { codec: "avc1.42e02a", acceleration: "no-preference" },
    { codec: "avc1.42001f", acceleration: "no-preference" },
    { codec: "avc1.640033", acceleration: "no-preference" },
    { codec: "avc1.64002a", acceleration: "prefer-hardware" },
    { codec: "avc1.4d002a", acceleration: "prefer-hardware" },
    { codec: "avc1.42002a", acceleration: "prefer-software" },
    { codec: "avc1.42001f", acceleration: "prefer-software" },
  ];
}

async function findWorkingConfig(
  width: number,
  height: number,
  bitrate: number,
  fps: number,
  is2K: boolean,
): Promise<VideoEncoderConfig | null> {
  const candidates = getCandidateList(is2K);

  if (typeof VideoEncoder !== "undefined" && VideoEncoder.isConfigSupported) {
    for (const cand of candidates) {
      try {
        const testConfig: VideoEncoderConfig = {
          codec: cand.codec,
          width,
          height,
          bitrate,
          framerate: fps,
          hardwareAcceleration: cand.acceleration,
        };

        const support = await VideoEncoder.isConfigSupported(testConfig);
        if (!support?.supported) continue;

        const effectiveConfig = support.config || testConfig;
        const works = await probeCanEncode(effectiveConfig);
        if (works) {
          console.log(
            `WebCodecs: Verified working codec ${cand.codec} (${cand.acceleration}) for ${width}x${height}`,
          );
          return effectiveConfig;
        }

        console.warn(
          `WebCodecs: Codec ${cand.codec} (${cand.acceleration}) passed isConfigSupported but failed probe encode. Trying next candidate...`,
        );
      } catch (err) {
        console.warn(`WebCodecs: Candidate ${cand.codec} check error:`, err);
      }
    }
  }

  return null;
}

export async function configureVideoEncoder(
  encoder: VideoEncoder,
  width: number,
  height: number,
  bitrate: number,
  fps: number,
): Promise<ConfiguredEncoderResult> {
  // Ensure dimensions are even numbers (divisible by 2) for H.264 compliance
  let targetW = Math.round(width / 2) * 2;
  let targetH = Math.round(height / 2) * 2;
  let targetBitrate = bitrate;
  const is2K = targetW > 1920 || targetH > 1920;
  let wasScaledDown = false;
  let notice: string | undefined;

  let chosenConfig = await findWorkingConfig(
    targetW,
    targetH,
    targetBitrate,
    fps,
    is2K,
  );

  // If 2K failed all candidates, smoothly fall back to 1080p
  if (!chosenConfig && is2K) {
    console.warn(
      `WebCodecs: 2K resolution (${targetW}x${targetH}) not supported by device encoder. Falling back to 1080p Full HD...`,
    );
    const isLandscape = targetW >= targetH;
    targetW = isLandscape ? 1920 : 1080;
    targetH = isLandscape ? 1080 : 1920;
    targetBitrate = Math.min(targetBitrate, 12_000_000);
    wasScaledDown = true;
    notice =
      "2K resolution is not fully supported by your device's GPU encoder; automatically optimized to 1080p Full HD for maximum stability.";

    chosenConfig = await findWorkingConfig(
      targetW,
      targetH,
      targetBitrate,
      fps,
      false,
    );
  }

  // Safe fallback if probe was inconclusive
  if (!chosenConfig) {
    chosenConfig = {
      codec: targetW > 1920 || targetH > 1920 ? "avc1.640033" : "avc1.4d002a",
      width: targetW,
      height: targetH,
      bitrate: targetBitrate,
      framerate: fps,
      hardwareAcceleration: "no-preference",
    };
  }

  encoder.configure(chosenConfig);

  return {
    config: chosenConfig,
    width: targetW,
    height: targetH,
    bitrate: targetBitrate,
    wasScaledDown,
    notice,
  };
}

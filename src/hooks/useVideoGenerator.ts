"use client";

import * as Mp4Muxer from "mp4-muxer";
import { useCallback, useRef, useState } from "react";
import { ChunkedMemoryTarget } from "@/lib/video-generator/chunked-target";
import { configureVideoEncoder } from "@/lib/video-generator/encoder-config";
import { getOrLoadSfxBuffer } from "@/lib/video-generator/sfx-loader";
import { drawSubtitleOverlay } from "@/lib/video-generator/subtitle-renderer";
import {
  ANIMATIONS_LIST,
  drawFitImage,
  renderTransition,
  SFX_LIST,
} from "@/lib/video-generator/transitions";
import type {
  RenderProgress,
  SRTData,
  VideoSettings,
} from "@/lib/video-generator/types";
import { drawWatermarkOverlay } from "@/lib/video-generator/watermark-renderer";

export function useVideoGenerator() {
  const [progress, setProgress] = useState<RenderProgress>({
    status: "idle",
    statusText: "",
    percent: 0,
    currentFrame: 0,
    totalFrames: 0,
    fpsSpeed: 0,
    remainingSec: 0,
    currentScene: 0,
    totalScenes: 0,
    currentAnim: "",
  });

  const [isRendering, setIsRendering] = useState(false);
  const cancelRequestedRef = useRef(false);
  const currentBlobUrlRef = useRef<string | null>(null);

  const cancel = useCallback(() => {
    cancelRequestedRef.current = true;
    setProgress((prev) => ({
      ...prev,
      status: "canceled",
      statusText: "Canceling video render...",
    }));
  }, []);

  const generate = useCallback(
    async (
      srtData: SRTData,
      audioBuffer: AudioBuffer | null,
      loadedImages: HTMLImageElement[],
      settings: VideoSettings,
      previewCanvas: HTMLCanvasElement | null,
    ): Promise<string | null> => {
      if (!srtData || loadedImages.length === 0) return null;

      setIsRendering(true);
      cancelRequestedRef.current = false;

      let chunkedStore: ChunkedMemoryTarget | null = null;
      let videoEncoderInstance: VideoEncoder | null = null;

      try {
        const cues = srtData.cues;
        const isLandscape = settings.aspectRatio === "16:9";
        let aspectW: number;
        let aspectH: number;

        if (settings.resolution === "1440") {
          [aspectW, aspectH] = isLandscape ? [2560, 1440] : [1440, 2560];
        } else if (settings.resolution === "720") {
          [aspectW, aspectH] = isLandscape ? [1280, 720] : [720, 1280];
        } else {
          [aspectW, aspectH] = isLandscape ? [1920, 1080] : [1080, 1920];
        }

        const fps = settings.fps;
        let bitrate = settings.bitrate;
        const isSfxEnabled = settings.isSfxEnabled;

        // Active Animation & SFX pool
        let activeAnimPool = Array.from(settings.selectedAnims);
        if (activeAnimPool.length === 0)
          activeAnimPool = ANIMATIONS_LIST.map((a) => a.id);

        let activeSfxPool = Array.from(settings.selectedSfx);
        if (activeSfxPool.length === 0)
          activeSfxPool = SFX_LIST.map((s) => s.id);

        // Pre-assign animation and sound for every cue transition
        const cueTransitions = cues.map(() => {
          const anim =
            activeAnimPool[Math.floor(Math.random() * activeAnimPool.length)];
          const sfxId =
            activeSfxPool[Math.floor(Math.random() * activeSfxPool.length)];
          return { anim, sfxId };
        });

        // Preload ONLY the SFX that are actually used in this video
        if (isSfxEnabled) {
          setProgress((prev) => ({
            ...prev,
            status: "preparing",
            statusText: "Loading selected sound effects...",
          }));
          const usedSfxIds = Array.from(
            new Set(cueTransitions.map((t) => t.sfxId)),
          );
          await Promise.all(usedSfxIds.map((id) => getOrLoadSfxBuffer(id)));
        }

        const lastCue = cues[cues.length - 1];
        const totalDurationMs = Math.max(lastCue.endMs, lastCue.startMs + 1000);
        const totalDurationSec = totalDurationMs / 1000;
        const totalFrames = Math.ceil(totalDurationSec * fps);
        const transitionDurationSec = 0.5;

        // 1. Audio Mixing
        let mixedAudioBuffer: AudioBuffer | null = null;
        if (audioBuffer || isSfxEnabled) {
          setProgress((prev) => ({
            ...prev,
            status: "encoding_audio",
            statusText: "Mixing audio tracks and sound effects...",
          }));

          const sampleRate = 44100;
          const totalSamples = Math.ceil(totalDurationSec * sampleRate);
          const offlineCtx = new OfflineAudioContext(
            2,
            totalSamples,
            sampleRate,
          );

          if (audioBuffer) {
            const bgSource = offlineCtx.createBufferSource();
            bgSource.buffer = audioBuffer;
            bgSource.loop = audioBuffer.duration < totalDurationSec;
            bgSource.connect(offlineCtx.destination);
            bgSource.start(0);
          }

          if (isSfxEnabled) {
            for (let idx = 0; idx < cues.length; idx++) {
              if (idx === 0) continue;
              const cue = cues[idx];
              const timeSec = cue.startMs / 1000;
              const assignedSfxId = cueTransitions[idx].sfxId;
              const sfxItem = SFX_LIST.find((s) => s.id === assignedSfxId);
              const sfxBuf = await getOrLoadSfxBuffer(assignedSfxId);

              if (sfxBuf && timeSec < totalDurationSec) {
                const leadTime = sfxItem ? sfxItem.leadTime : 0;
                const startTime = Math.max(0, timeSec - leadTime);
                const clickSource = offlineCtx.createBufferSource();
                clickSource.buffer = sfxBuf;
                const clickGain = offlineCtx.createGain();
                clickGain.gain.value = 0.65;
                clickSource.connect(clickGain);
                clickGain.connect(offlineCtx.destination);
                clickSource.start(startTime);
              }
            }
          }

          mixedAudioBuffer = await offlineCtx.startRendering();
        }

        // 2. Initialize Memory-Safe Chunked MP4 Target
        chunkedStore = new ChunkedMemoryTarget(16 * 1024 * 1024);
        const muxerTarget = new Mp4Muxer.StreamTarget({
          chunked: true,
          chunkSize: 16 * 1024 * 1024,
          onData: (data: Uint8Array, position: number) => {
            chunkedStore?.write(data, position);
          },
        });

        // 3. Initialize & Configure VideoEncoder with live hardware probe
        let encoderError: Error | null = null;
        const videoEncoder = new VideoEncoder({
          output: (chunk, meta) => {
            try {
              muxer.addVideoChunk(chunk, meta);
            } catch (muxErr) {
              console.error("Muxer addVideoChunk error:", muxErr);
              encoderError =
                muxErr instanceof Error ? muxErr : new Error(String(muxErr));
            }
          },
          error: (e) => {
            console.error("VideoEncoder error callback:", e);
            const msg =
              e instanceof Error
                ? e.message
                : (e as { message?: string })?.message || String(e);
            encoderError = new Error(`VideoEncoder hardware error: ${msg}`);
          },
        });
        videoEncoderInstance = videoEncoder;

        setProgress((prev) => ({
          ...prev,
          status: "preparing",
          statusText: "Validating GPU encoder hardware compatibility...",
        }));

        const encoderSetup = await configureVideoEncoder(
          videoEncoder,
          aspectW,
          aspectH,
          bitrate,
          fps,
        );

        aspectW = encoderSetup.width;
        aspectH = encoderSetup.height;
        bitrate = encoderSetup.bitrate;

        if (encoderSetup.wasScaledDown && encoderSetup.notice) {
          setProgress((prev) => ({
            ...prev,
            statusText: encoderSetup.notice!,
          }));
          await new Promise((r) => setTimeout(r, 600));
        }

        // Initialize Muxer matching verified dimensions
        const muxer = new Mp4Muxer.Muxer({
          target: muxerTarget,
          video: {
            codec: "avc",
            width: aspectW,
            height: aspectH,
          },
          audio: mixedAudioBuffer
            ? {
                codec: "aac",
                numberOfChannels: 2,
                sampleRate: mixedAudioBuffer.sampleRate,
              }
            : undefined,
          fastStart: false,
        });

        // 4. Encode Audio Stream
        if (mixedAudioBuffer) {
          setProgress((prev) => ({
            ...prev,
            status: "encoding_audio",
            statusText: "Encoding audio stream...",
          }));

          let audioEncoder: AudioEncoder | null = null;
          try {
            audioEncoder = new AudioEncoder({
              output: (chunk, meta) => {
                try {
                  muxer.addAudioChunk(chunk, meta);
                } catch (aMuxErr) {
                  console.warn("Muxer addAudioChunk warning:", aMuxErr);
                }
              },
              error: (e) => console.error("AudioEncoder error:", e),
            });

            audioEncoder.configure({
              codec: "mp4a.40.2",
              numberOfChannels: 2,
              sampleRate: mixedAudioBuffer.sampleRate,
              bitrate: 192000,
            });

            const channel0 = mixedAudioBuffer.getChannelData(0);
            const channel1 = mixedAudioBuffer.getChannelData(1);
            const chunkSize = 1024;
            let offset = 0;
            let audioChunkCount = 0;

            while (offset < channel0.length) {
              const length = Math.min(chunkSize, channel0.length - offset);
              const pcmData = new Float32Array(length * 2);
              for (let i = 0; i < length; i++) {
                pcmData[i * 2] = channel0[offset + i];
                pcmData[i * 2 + 1] = channel1[offset + i];
              }

              const audioData = new AudioData({
                format: "f32",
                sampleRate: mixedAudioBuffer.sampleRate,
                numberOfFrames: length,
                numberOfChannels: 2,
                timestamp: Math.round(
                  (offset / mixedAudioBuffer.sampleRate) * 1_000_000,
                ),
                data: pcmData,
              });

              audioEncoder.encode(audioData);
              audioData.close();
              offset += length;

              audioChunkCount++;
              if (audioChunkCount % 300 === 0) {
                await new Promise((r) => setTimeout(r, 0));
              }
            }

            await audioEncoder.flush();
            if (audioEncoder.state !== "closed") {
              try {
                audioEncoder.close();
              } catch {}
            }
          } catch (aErr) {
            console.warn(
              "AudioEncoder not supported or failed, proceeding video-only:",
              aErr,
            );
          } finally {
            if (audioEncoder && audioEncoder.state !== "closed") {
              try {
                audioEncoder.close();
              } catch {}
            }
            mixedAudioBuffer = null;
          }
        }

        // 5. Setup Encoding & Preview Canvases
        const encodeCanvas: HTMLCanvasElement | OffscreenCanvas =
          typeof OffscreenCanvas !== "undefined"
            ? new OffscreenCanvas(aspectW, aspectH)
            : document.createElement("canvas");
        encodeCanvas.width = aspectW;
        encodeCanvas.height = aspectH;

        const ctx = encodeCanvas.getContext("2d", {
          alpha: false,
        }) as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "medium";

        const previewW = isLandscape ? 640 : 360;
        const previewH = isLandscape ? 360 : 640;
        let previewCtx: CanvasRenderingContext2D | null = null;
        let previewTargetCanvas: HTMLCanvasElement | null = previewCanvas;

        const getPreviewCtx = (): CanvasRenderingContext2D | null => {
          if (previewCtx && previewTargetCanvas?.isConnected) return previewCtx;
          const canvas =
            previewTargetCanvas ||
            previewCanvas ||
            (typeof document !== "undefined"
              ? (document.getElementById(
                  "renderPreviewCanvas",
                ) as HTMLCanvasElement | null)
              : null);
          if (canvas) {
            previewTargetCanvas = canvas;
            if (canvas.width !== previewW) canvas.width = previewW;
            if (canvas.height !== previewH) canvas.height = previewH;
            previewCtx = canvas.getContext("2d", { alpha: false });
          }
          return previewCtx;
        };

        // 6. Render Video Frames with Dynamic Animations & Subtitles
        setProgress({
          status: "encoding_video",
          statusText: `Encoding ${totalFrames} frames in ${aspectW}×${aspectH}...`,
          percent: 0,
          currentFrame: 0,
          totalFrames,
          fpsSpeed: 0,
          remainingSec: 0,
          currentScene: 1,
          totalScenes: cues.length,
          currentAnim: cueTransitions[0].anim,
        });

        const startTime = performance.now();
        let currentCueIdx = 0;

        for (let frameIdx = 0; frameIdx < totalFrames; frameIdx++) {
          if (cancelRequestedRef.current) {
            if (videoEncoder.state !== "closed") {
              try {
                videoEncoder.close();
              } catch {}
            }
            if (chunkedStore) {
              chunkedStore.clear();
            }
            setProgress((prev) => ({
              ...prev,
              status: "canceled",
              statusText: "Rendering canceled by user.",
            }));
            setIsRendering(false);
            return null;
          }

          if (encoderError || videoEncoder.state === "closed") {
            throw (
              encoderError ||
              new Error("VideoEncoder stopped unexpectedly during rendering.")
            );
          }

          const currentTimeMs = (frameIdx / fps) * 1000;

          while (
            currentCueIdx < cues.length - 1 &&
            currentTimeMs >= cues[currentCueIdx + 1].startMs
          ) {
            currentCueIdx++;
          }

          const cue = cues[currentCueIdx];
          const timeIntoCueSec = Math.max(
            0,
            (currentTimeMs - cue.startMs) / 1000,
          );

          const getCueImage = (idx: number): HTMLImageElement => {
            if (
              settings.cueAssetMap &&
              settings.cueAssetMap[idx] !== undefined
            ) {
              const mappedIdx = settings.cueAssetMap[idx];
              if (loadedImages[mappedIdx]) return loadedImages[mappedIdx];
            }
            return loadedImages[idx % loadedImages.length];
          };

          const currImg = getCueImage(currentCueIdx);
          const prevImg =
            currentCueIdx > 0 ? getCueImage(currentCueIdx - 1) : currImg;
          const assignedAnim = cueTransitions[currentCueIdx].anim;

          ctx.fillStyle = "#0c0c10";
          ctx.fillRect(0, 0, aspectW, aspectH);

          if (currentCueIdx > 0 && timeIntoCueSec < transitionDurationSec) {
            const transProgress = timeIntoCueSec / transitionDurationSec;
            renderTransition(
              ctx,
              assignedAnim,
              prevImg,
              currImg,
              transProgress,
              aspectW,
              aspectH,
            );
          } else {
            const isZoomIn = currentCueIdx % 2 === 0;
            const driftProgress = Math.min(
              1.0,
              (timeIntoCueSec - transitionDurationSec) / 4.0,
            );
            const zoom = isZoomIn
              ? 1.0 + 0.04 * driftProgress
              : 1.04 - 0.04 * driftProgress;
            drawFitImage(ctx, currImg, aspectW, aspectH, zoom, 0, 0);
          }

          // Burn-In Animated Subtitles
          if (settings.isSubtitleBurnInEnabled !== false && cue) {
            drawSubtitleOverlay({
              ctx,
              cue,
              currentTimeMs,
              canvasWidth: aspectW,
              canvasHeight: aspectH,
              preset: settings.subtitlePreset || "hormozi-pop",
              isPortrait: !isLandscape,
            });
          }

          // Brand Watermark / Logo Overlay
          if (settings.isWatermarkEnabled && settings.watermarkImage) {
            drawWatermarkOverlay({
              ctx,
              image: settings.watermarkImage,
              canvasW: aspectW,
              canvasH: aspectH,
              position: settings.watermarkPosition || "top-right",
              opacity: settings.watermarkOpacity ?? 0.85,
              scale: settings.watermarkScale ?? 0.14,
            });
          }

          const timestampUs = Math.round((frameIdx / fps) * 1_000_000);
          const videoFrame = new VideoFrame(encodeCanvas as CanvasImageSource, {
            timestamp: timestampUs,
          });
          videoEncoder.encode(videoFrame, {
            keyFrame: frameIdx % (fps * 2) === 0,
          });
          videoFrame.close();

          while (videoEncoder.encodeQueueSize >= 3) {
            if (
              encoderError ||
              (videoEncoder.state as string) === "closed" ||
              cancelRequestedRef.current
            ) {
              break;
            }
            await new Promise((r) => setTimeout(r, 4));
          }

          if (encoderError || (videoEncoder.state as string) === "closed") {
            throw (
              encoderError ||
              new Error("VideoEncoder stopped unexpectedly during rendering.")
            );
          }

          if (frameIdx % 4 === 0 || frameIdx === totalFrames - 1) {
            const pCtx = getPreviewCtx();
            if (pCtx) {
              pCtx.drawImage(
                encodeCanvas as CanvasImageSource,
                0,
                0,
                previewW,
                previewH,
              );
            }

            const percent = Math.round(((frameIdx + 1) / totalFrames) * 100);
            const elapsedSec = (performance.now() - startTime) / 1000;
            const fpsRate = (frameIdx + 1) / elapsedSec;
            const remainingSec = Math.round(
              (totalFrames - (frameIdx + 1)) / (fpsRate || 1),
            );

            setProgress({
              status: "encoding_video",
              statusText: `Encoding frame ${frameIdx + 1} of ${totalFrames}...`,
              percent,
              currentFrame: frameIdx + 1,
              totalFrames,
              fpsSpeed: Number(fpsRate.toFixed(1)),
              remainingSec,
              currentScene: currentCueIdx + 1,
              totalScenes: cues.length,
              currentAnim: assignedAnim,
            });

            await new Promise((r) => setTimeout(r, 0));
          } else if (frameIdx % 2 === 0) {
            await new Promise((r) => setTimeout(r, 0));
          }
        }

        setProgress((prev) => ({
          ...prev,
          status: "finalizing",
          statusText: "Finalizing MP4 file container...",
          percent: 100,
        }));

        if (videoEncoder.state !== "closed") {
          await videoEncoder.flush();
          try {
            videoEncoder.close();
          } catch {}
        }
        muxer.finalize();

        let mp4Blob: Blob;
        if (chunkedStore) {
          mp4Blob = chunkedStore.toBlob("video/mp4");
          chunkedStore.clear();
        } else {
          throw new Error("Unable to obtain final MP4 blob.");
        }

        if (currentBlobUrlRef.current) {
          URL.revokeObjectURL(currentBlobUrlRef.current);
        }
        const newBlobUrl = URL.createObjectURL(mp4Blob);
        currentBlobUrlRef.current = newBlobUrl;

        setProgress({
          status: "completed",
          statusText: "Video generated successfully!",
          percent: 100,
          currentFrame: totalFrames,
          totalFrames,
          fpsSpeed: Number(
            (totalFrames / ((performance.now() - startTime) / 1000)).toFixed(1),
          ),
          remainingSec: 0,
          currentScene: cues.length,
          totalScenes: cues.length,
          currentAnim: "Complete",
          outputBlobUrl: newBlobUrl,
        });

        // Record generation in MongoDB via API
        fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: srtData.fileName || "SRT Animated Video",
            resolution:
              settings.resolution === "1440"
                ? "2K QHD (2560x1440)"
                : settings.resolution === "1080"
                  ? "1080p Full HD"
                  : "720p HD",
            aspectRatio: settings.aspectRatio,
            durationSec: Math.round(totalDurationSec),
            totalFrames,
            encodingSpeedFps: Number(
              (totalFrames / ((performance.now() - startTime) / 1000)).toFixed(
                1,
              ),
            ),
            fileSizeBytes: mp4Blob.size,
            status: "completed",
          }),
        }).catch((err) => console.warn("Failed recording history:", err));

        setIsRendering(false);
        return newBlobUrl;
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Video generation error:", error);
        if (chunkedStore) {
          chunkedStore.clear();
        }
        if (videoEncoderInstance && videoEncoderInstance.state !== "closed") {
          try {
            videoEncoderInstance.close();
          } catch {}
        }
        setProgress((prev) => ({
          ...prev,
          status: "error",
          statusText: "Error during video generation",
          errorMessage:
            error.message ||
            "Hardware video encoder error. Switch to 1080p Full HD resolution for guaranteed stability.",
        }));
        setIsRendering(false);
        return null;
      }
    },
    [],
  );

  return {
    progress,
    isRendering,
    generate,
    cancel,
  };
}

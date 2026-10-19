"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { consumeTransferAudio, saveTransferCues } from "@/lib/studio-transfer";
import type { SubtitleCue } from "../subtitle-sync-types";
import {
  autoAlignCuesToVoice,
  createDemoAudioBuffer,
  DEMO_SUBTITLE_CUES,
  decodeAudioWaveform,
  detectVoiceIntervals,
  parseSrt,
  renderSrt,
} from "../subtitle-sync-utils";

export function useSubtitleSession(
  cues: SubtitleCue[],
  setCues: (cues: SubtitleCue[]) => void,
  setSelectedId: (id: number | null) => void,
  setDuration: (dur: number) => void,
  setCurrentTime: (time: number) => void,
  setIsPlaying: (playing: boolean) => void,
  setHistory: (hist: []) => void,
  saveUndoState: () => void,
  seekTo: (timeSec: number) => void,
  audioRef: React.RefObject<HTMLAudioElement | null>,
) {
  const router = useRouter();

  const [audioUrl, setAudioUrl] = useState<string | null>("/demo.wav");
  const [audioFileName, setAudioFileName] = useState("demo.wav");
  const [srtFileName, setSrtFileName] = useState("demo.srt");
  const [waveformPeaks, setWaveformPeaks] = useState<number[]>([]);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>(
    "Loaded demo.wav & demo.srt",
  );

  const pendingAudioRef = useRef<{ file: File; buffer: ArrayBuffer } | null>(
    null,
  );
  const pendingSrtRef = useRef<{ file: File; text: string } | null>(null);
  const currentAudioBufferRef = useRef<AudioBuffer | null>(null);

  // File Load Handlers
  const handleSelectAudioFile = async (file: File) => {
    try {
      setIsAudioLoading(true);
      const buffer = await file.arrayBuffer();
      pendingAudioRef.current = { file, buffer };
      setAudioFileName(`${file.name} · ready`);
      setStatusText("Audio file selected; click Load Timeline");
      toast.info(`Selected audio: ${file.name}. Click 'Load Timeline'`);
    } catch (err) {
      console.error("Error reading audio file:", err);
      toast.error("Failed to read audio file");
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleSelectSrtFile = async (file: File) => {
    try {
      const text = await file.text();
      pendingSrtRef.current = { file, text };
      setSrtFileName(`${file.name} · ready`);
      setStatusText("SRT file selected; click Load Timeline");
      toast.info(`Selected subtitles: ${file.name}. Click 'Load Timeline'`);
    } catch (err) {
      console.error("Error reading SRT file:", err);
      toast.error("Failed to read SRT file");
    }
  };

  const handleLoadTimeline = async () => {
    let loadedAudio = false;
    let loadedSrt = false;

    // Load Pending Audio
    if (pendingAudioRef.current) {
      const { file, buffer } = pendingAudioRef.current;
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      const newUrl = URL.createObjectURL(file);
      setAudioUrl(newUrl);
      setAudioFileName(file.name);

      try {
        const {
          peaks,
          duration: decodedDur,
          audioBuffer,
        } = await decodeAudioWaveform(buffer);
        currentAudioBufferRef.current = audioBuffer || null;
        setWaveformPeaks(peaks);
        if (decodedDur && Number.isFinite(decodedDur)) {
          setDuration(decodedDur);
        }
      } catch (err) {
        console.warn("Waveform decode warning:", err);
      }

      pendingAudioRef.current = null;
      loadedAudio = true;
    }

    // Load Pending SRT
    if (pendingSrtRef.current) {
      const { file, text } = pendingSrtRef.current;
      const parsed = parseSrt(text);
      if (parsed.length > 0) {
        saveUndoState();
        setCues(parsed);
        setSelectedId(parsed[0]?.id || null);
        setSrtFileName(file.name);
        loadedSrt = true;
      } else {
        toast.error("No valid SRT cues found in file");
      }
      pendingSrtRef.current = null;
    }

    if (loadedAudio || loadedSrt) {
      toast.success("Timeline loaded successfully!");
      setStatusText(`Timeline loaded · ${cues.length} subtitles`);
    } else {
      toast.info("Select an audio or SRT file first");
    }
  };

  // Load Built-in Demo Project (/demo.wav & /demo.srt)
  const handleLoadDemoProject = useCallback(async () => {
    saveUndoState();
    setIsAudioLoading(true);
    try {
      const [wavRes, srtRes] = await Promise.all([
        fetch("/demo.wav"),
        fetch("/demo.srt"),
      ]);

      if (wavRes.ok && srtRes.ok) {
        const [wavBuffer, srtText] = await Promise.all([
          wavRes.arrayBuffer(),
          srtRes.text(),
        ]);

        const parsedCues = parseSrt(srtText);
        if (parsedCues.length > 0) {
          setCues(parsedCues);
          setSelectedId(parsedCues[0]?.id || 1);
        }

        if (audioUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(audioUrl);
        }
        const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
        const newUrl = URL.createObjectURL(wavBlob);

        setAudioUrl(newUrl);
        setAudioFileName("demo.wav");
        setSrtFileName("demo.srt");

        const {
          peaks,
          duration: decodedDur,
          audioBuffer,
        } = await decodeAudioWaveform(wavBuffer);
        currentAudioBufferRef.current = audioBuffer || null;
        setWaveformPeaks(peaks);
        if (decodedDur && Number.isFinite(decodedDur)) {
          setDuration(decodedDur);
        }
        seekTo(0);

        setStatusText(
          `Loaded demo.wav and demo.srt · ${parsedCues.length} subtitles`,
        );
        toast.success("Loaded demo.wav and demo.srt successfully!");
      } else {
        // Fallback to in-memory demo if fetch failed
        const demoBuffer = createDemoAudioBuffer();
        const demoBlob = new Blob([demoBuffer], { type: "audio/wav" });
        if (audioUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(audioUrl);
        }
        const newUrl = URL.createObjectURL(demoBlob);

        setAudioUrl(newUrl);
        setAudioFileName("demo.wav");
        setSrtFileName("demo.srt");
        setCues(DEMO_SUBTITLE_CUES);
        setSelectedId(1);
        setDuration(16);
        seekTo(0);

        const { peaks, audioBuffer } = await decodeAudioWaveform(demoBuffer);
        currentAudioBufferRef.current = audioBuffer || null;
        setWaveformPeaks(peaks);

        setStatusText("Demo project loaded with waveform & sample cues");
        toast.success("Demo project loaded!");
      }
    } catch (err) {
      console.error("Demo load failed:", err);
      toast.error("Failed to load demo audio");
    } finally {
      setIsAudioLoading(false);
    }
  }, [audioUrl, saveUndoState, seekTo, setCues, setSelectedId, setDuration]);

  // Auto-align cues to active voice speech boundaries (AI VAD)
  const handleAutoAlignToSpeech = useCallback(() => {
    const buffer = currentAudioBufferRef.current;
    if (!buffer) {
      toast.error(
        "No decoded audio track found. Please load an audio file first.",
      );
      return;
    }
    if (cues.length === 0) {
      toast.warning(
        "No subtitle cues to align. Add or import subtitles first.",
      );
      return;
    }

    toast.loading("Analyzing speech waveform boundaries...", {
      id: "vad-align",
    });
    try {
      const intervals = detectVoiceIntervals(buffer);
      if (intervals.length === 0) {
        toast.error("No clear speech intervals detected in audio.", {
          id: "vad-align",
        });
        return;
      }

      saveUndoState();
      const { alignedCues, adjustedCount, silenceSavedMs } =
        autoAlignCuesToVoice(cues, intervals);
      setCues(alignedCues);
      const savedSec = (silenceSavedMs / 1000).toFixed(1);
      toast.success(
        `Auto-aligned ${adjustedCount} subtitles to voice boundaries (trimmed ${savedSec}s silence)!`,
        { id: "vad-align" },
      );
      setStatusText(
        `VAD auto-aligned ${adjustedCount} subtitles to speech track`,
      );
    } catch (err) {
      console.error("VAD alignment failed:", err);
      toast.error("Voice Activity Detection failed on this audio file", {
        id: "vad-align",
      });
    }
  }, [cues, saveUndoState, setCues]);

  // Reset Project
  const handleResetProject = useCallback(() => {
    if (
      !window.confirm(
        "Reset the session? All current edits, audio, and subtitle adjustments will be cleared.",
      )
    ) {
      return;
    }
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);

    setCues([]);
    setSelectedId(null);
    setAudioUrl(null);
    setAudioFileName("");
    setSrtFileName("");
    setWaveformPeaks([]);
    setHistory([]);
    setCurrentTime(0);
    setIsPlaying(false);
    setStatusText("Project reset");
    toast.info("Session reset");
  }, [
    audioUrl,
    audioRef,
    setCues,
    setSelectedId,
    setHistory,
    setCurrentTime,
    setIsPlaying,
  ]);

  // Export SRT
  const handleExportSrt = useCallback(() => {
    if (cues.length === 0) {
      toast.warning("No subtitles to export");
      return;
    }
    const srtContent = renderSrt(cues);
    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const exportName =
      (srtFileName || audioFileName || "subtitles").replace(/\.[^.]+$/, "") +
      "_synced.srt";
    a.href = url;
    a.download = exportName;
    a.click();
    URL.revokeObjectURL(url);

    setStatusText(`Exported ${exportName} (${cues.length} subtitles)`);
    toast.success(`Exported ${exportName}`);
  }, [cues, srtFileName, audioFileName]);

  // Send to 2K Video Generator
  const handleSendToVideoGenerator = useCallback(() => {
    if (cues.length === 0) {
      toast.warning("No subtitles to transfer");
      return;
    }
    saveTransferCues({
      cues: cues.map((c) => ({
        id: c.id,
        startMs: c.startMs,
        endMs: c.endMs,
        text: c.text,
      })),
      fileName:
        (srtFileName || "synced_subtitles.srt").replace(/\.[^.]+$/, "") +
        ".srt",
    });
    toast.success("Cues transferred to 2K Video Generator!");
    router.push("/dashboard/video-editor");
  }, [cues, srtFileName, router]);

  // Send to Batch Splitter
  const handleSendToBatchSplitter = useCallback(() => {
    if (cues.length === 0) {
      toast.warning("No subtitles to transfer");
      return;
    }
    saveTransferCues({
      cues: cues.map((c) => ({
        id: c.id,
        startMs: c.startMs,
        endMs: c.endMs,
        text: c.text,
      })),
      fileName:
        (srtFileName || "synced_subtitles.srt").replace(/\.[^.]+$/, "") +
        ".srt",
    });
    toast.success("Cues transferred to Batch Splitter!");
    router.push("/dashboard/subtitle-splitter");
  }, [cues, srtFileName, router]);

  // Load initial audio (either transferred from Audio Studio or default demo)
  // biome-ignore lint/correctness/useExhaustiveDependencies: initial mount only
  useEffect(() => {
    consumeTransferAudio()
      .then(async (transfer) => {
        if (transfer?.blob) {
          const { blob, fileName } = transfer;
          const newUrl = URL.createObjectURL(blob);
          setAudioUrl(newUrl);
          setAudioFileName(fileName);
          try {
            const buffer = await blob.arrayBuffer();
            const {
              peaks,
              duration: decodedDur,
              audioBuffer,
            } = await decodeAudioWaveform(buffer);
            currentAudioBufferRef.current = audioBuffer || null;
            setWaveformPeaks(peaks);
            if (decodedDur && Number.isFinite(decodedDur)) {
              setDuration(decodedDur);
            }
            toast.success(
              `Loaded audio transferred from Audio Studio: ${fileName}`,
            );
            setStatusText(`Transferred audio loaded · ${fileName}`);
          } catch (err) {
            console.warn("Waveform decode warning for transferred audio:", err);
          }
        } else {
          handleLoadDemoProject();
        }
      })
      .catch(() => {
        handleLoadDemoProject();
      });
  }, []);

  return {
    audioUrl,
    audioFileName,
    srtFileName,
    waveformPeaks,
    isAudioLoading,
    statusText,
    setStatusText,
    handleSelectAudioFile,
    handleSelectSrtFile,
    handleLoadTimeline,
    handleLoadDemoProject,
    handleAutoAlignToSpeech,
    handleResetProject,
    handleExportSrt,
    handleSendToVideoGenerator,
    handleSendToBatchSplitter,
  };
}

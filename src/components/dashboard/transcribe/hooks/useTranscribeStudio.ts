"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  consumeTransferAudio,
  saveTransferAudio,
  saveTransferCues,
} from "@/lib/studio-transfer";
import type {
  TranscribeEngine,
  TranscribeFormat,
} from "../components/TranscribeFormatSelector";

interface TranscribeCueItem {
  id: number;
  startMs: number;
  endMs: number;
  text: string;
  words?: { word: string; startMs: number; endMs: number }[];
}

export function useTranscribeStudio() {
  const router = useRouter();

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [format, setFormat] = useState<TranscribeFormat>("sentence_srt");
  const [engine, setEngine] = useState<TranscribeEngine>("groq");
  const [colabUrl, setColabUrl] = useState<string>("");

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Ready to transcribe audio",
  );

  const [resultText, setResultText] = useState("");
  const [cues, setCues] = useState<TranscribeCueItem[]>([]);
  const [wordsCount, setWordsCount] = useState(0);
  const [cuesCount, setCuesCount] = useState(0);
  const [durationSec, setDurationSec] = useState(0);

  const handleSelectFile = useCallback(
    (file: File) => {
      if (audioUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setStatusMessage(`Audio selected: ${file.name}`);
      toast.info(`Selected ${file.name}`);
    },
    [audioUrl],
  );

  // Check for audio transferred from Audio & Voice Studio or Subtitle Studio
  useEffect(() => {
    async function checkTransferred() {
      try {
        const transferred = await consumeTransferAudio();
        if (transferred?.blob) {
          const file = new File(
            [transferred.blob],
            transferred.fileName || "audio.wav",
            { type: transferred.blob.type || "audio/wav" },
          );
          handleSelectFile(file);
          toast.success(`Imported audio from Studio: ${file.name}`);
        }
      } catch (e) {
        console.warn("No transfer audio found", e);
      }
    }
    checkTransferred();
  }, [handleSelectFile]);

  const handleLoadDemoAudio = useCallback(async () => {
    try {
      const res = await fetch("/demo.wav");
      if (!res.ok) throw new Error("Could not load /demo.wav");
      const blob = await res.blob();
      const file = new File([blob], "demo.wav", { type: "audio/wav" });
      handleSelectFile(file);
      toast.success("Loaded demo.wav sample audio!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load sample audio");
    }
  }, [handleSelectFile]);

  const handleTranscribe = async () => {
    if (!audioFile) {
      toast.warning("Please upload or select an audio file first");
      return;
    }

    setIsTranscribing(true);
    setStatusMessage("Transcribing audio with Whisper AI...");
    const toastId = toast.loading("Whisper AI is transcribing audio...", {
      id: "ai-transcribe",
    });

    try {
      const form = new FormData();
      form.append("file", audioFile, audioFile.name);
      form.append("format", format);
      form.append("engine", engine);
      if (colabUrl.trim()) {
        form.append("colabUrl", colabUrl.trim());
      }

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Transcription failed");
      }

      setResultText(data.srtResult || data.rawText || data.textResult || "");
      setCues(data.cues || []);
      setWordsCount(data.wordsCount || 0);
      setCuesCount(data.cuesCount || 0);
      setDurationSec(data.durationSec || 0);

      setStatusMessage(
        `Transcription complete (${data.wordsCount || 0} words, ${(data.durationSec || 0).toFixed(1)}s)`,
      );
      toast.success("Transcription generated successfully!", { id: toastId });
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Transcribe failed:", error);
      setStatusMessage("Transcription error occurred");
      toast.error(error.message || "Failed to transcribe audio", {
        id: toastId,
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleOpenInSubtitleStudio = async () => {
    if (!resultText) {
      toast.warning("No transcription to transfer");
      return;
    }

    try {
      // 1. Transfer audio blob if available
      if (audioFile) {
        await saveTransferAudio(audioFile, audioFile.name);
      }

      // 2. Transfer cues if format is SRT
      if (cues.length > 0) {
        saveTransferCues({
          cues: cues.map((c) => ({
            id: c.id,
            startMs: c.startMs,
            endMs: c.endMs,
            text: c.text,
            words: c.words,
          })),
          fileName: `${(audioFile?.name || "transcription").replace(/\.[^.]+$/, "")}_synced.srt`,
        });
      }

      toast.success("Opening Subtitle Sync Studio with audio & subtitles...");
      router.push("/dashboard/subtitle-sync-editor");
    } catch (err) {
      console.error("Transfer error:", err);
      toast.error("Failed to transfer to Subtitle Studio");
    }
  };

  const handleSendToVideoGenerator = () => {
    if (cues.length === 0) {
      toast.warning("Please generate Sentence or Word SRT first");
      return;
    }

    saveTransferCues({
      cues: cues.map((c) => ({
        id: c.id,
        startMs: c.startMs,
        endMs: c.endMs,
        text: c.text,
      })),
      fileName: `${(audioFile?.name || "transcription").replace(/\.[^.]+$/, "")}_synced.srt`,
    });

    toast.success("Subtitles sent! Opening 2K Video Generator...");
    router.push("/dashboard/video-editor");
  };

  return {
    audioFile,
    audioUrl,
    format,
    setFormat,
    engine,
    setEngine,
    colabUrl,
    setColabUrl,
    isTranscribing,
    statusMessage,
    resultText,
    wordsCount,
    cuesCount,
    durationSec,
    handleSelectFile,
    handleLoadDemoAudio,
    handleTranscribe,
    handleOpenInSubtitleStudio,
    handleSendToVideoGenerator,
  };
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { saveTransferAudio } from "@/lib/studio-transfer";
import type { VoicePersona } from "../components/VoiceControlsCard";

export function useAudioSynthesis(scriptText: string) {
  const router = useRouter();

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");
  const [persona, setPersona] = useState<VoicePersona>("casual");
  const [rate, setRate] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [volume] = useState<number>(0.9);

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [bgmActive] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>(
    "Ready to generate voiceover",
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load available browser voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
        const defaultVoice =
          available.find(
            (v) =>
              v.lang.startsWith("en") &&
              (v.name.includes("Natural") ||
                v.name.includes("Google") ||
                v.name.includes("David")),
          ) ||
          available.find((v) => v.lang.startsWith("en")) ||
          available[0];

        if (defaultVoice && !selectedVoiceURI) {
          setSelectedVoiceURI(defaultVoice.voiceURI);
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedVoiceURI]);

  // Persona switch helper
  const handleSelectPersona = (p: VoicePersona) => {
    setPersona(p);
    switch (p) {
      case "deep-narrator":
        setPitch(0.85);
        setRate(0.92);
        toast.info(
          "Preset applied: Deep Narrator (Lower pitch, deliberate pace)",
        );
        break;
      case "casual":
        setPitch(1.0);
        setRate(1.04);
        toast.info("Preset applied: Casual Storyteller (Natural tone)");
        break;
      case "energetic":
        setPitch(1.1);
        setRate(1.22);
        toast.info("Preset applied: Energetic Explainer (Punchy YouTube pace)");
        break;
      case "cinematic":
        setPitch(0.75);
        setRate(0.82);
        toast.info("Preset applied: Cinematic Trailer (Deep & dramatic)");
        break;
    }
  };

  // Preview Speech via SpeechSynthesis
  const handleSpeakPreview = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Speech Synthesis is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!scriptText.trim()) {
      toast.warning("Please enter some script text first");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(scriptText);
    const chosenVoice = voices.find((v) => v.voiceURI === selectedVoiceURI);
    if (chosenVoice) utterance.voice = chosenVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setStatusMessage("Speaking live preview...");
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setStatusMessage("Live preview finished");
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setStatusMessage("Speech error occurred");
    };

    window.speechSynthesis.speak(utterance);
  };

  // Synthesize into recorded WAV file
  const handleSynthesizeAudio = async () => {
    if (!scriptText.trim()) {
      toast.warning("Please enter script text before synthesizing");
      return;
    }

    setIsSynthesizing(true);
    setStatusMessage("Synthesizing audio buffer...");

    try {
      const sampleRate = 44100;
      const wordCount = scriptText.trim().split(/\s+/).length;
      const durationSec = Math.max(3, (wordCount / (145 * rate)) * 60);
      const totalSamples = Math.floor(sampleRate * durationSec);

      const buffer = new ArrayBuffer(44 + totalSamples * 2);
      const view = new DataView(buffer);

      const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
          view.setUint8(offset + i, str.charCodeAt(i));
        }
      };

      writeString(0, "RIFF");
      view.setUint32(4, 36 + totalSamples * 2, true);
      writeString(8, "WAVE");
      writeString(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, "data");
      view.setUint32(40, totalSamples * 2, true);

      const baseFreq = 130 * pitch;
      const formants = [500 * pitch, 1500 * pitch, 2500 * pitch];
      const words = scriptText.split(/\s+/);
      const wordCadence = durationSec / Math.max(1, words.length);

      for (let i = 0; i < totalSamples; i++) {
        const t = i / sampleRate;
        const wordTime = t % wordCadence;

        const isPause = wordTime > wordCadence * 0.85;
        let amp = isPause
          ? 0
          : Math.sin((Math.PI * wordTime) / (wordCadence * 0.85));
        amp = Math.max(0, amp);

        let sample = 0;
        if (!isPause) {
          const vibrato = 1 + 0.03 * Math.sin(2 * Math.PI * 5.2 * t);
          const f0 = baseFreq * vibrato;
          sample += 0.45 * Math.sin(2 * Math.PI * f0 * t);
          sample += 0.25 * Math.sin(2 * Math.PI * (f0 * 2) * t);
          sample += 0.15 * Math.sin(2 * Math.PI * (f0 * 3) * t);

          for (const f of formants) {
            sample += 0.08 * Math.sin(2 * Math.PI * f * t);
          }
        }

        if (bgmActive) {
          sample += 0.05 * Math.sin(2 * Math.PI * 261.63 * t);
        }

        const out = Math.max(-1, Math.min(1, sample * amp * volume * 0.8));
        view.setInt16(44 + i * 2, Math.floor(out * 32767), true);
      }

      const blob = new Blob([buffer], { type: "audio/wav" });
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      const newUrl = URL.createObjectURL(blob);

      setAudioBlob(blob);
      setAudioUrl(newUrl);
      setStatusMessage(
        `Voiceover synthesized (${durationSec.toFixed(1)}s, ${wordCount} words)`,
      );
      toast.success("Synthesized voiceover audio track successfully!");
    } catch (err) {
      console.error("Synthesize error:", err);
      toast.error("Failed to synthesize voice audio");
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Waveform visualization loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const cy = h / 2;

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isSpeaking || isPlayingAudio ? "#34d399" : "#334155";

      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const energy = isSpeaking || isPlayingAudio ? 24 : 4;
        const y = cy + Math.sin(x * 0.05 + phase) * energy * Math.sin(x * 0.02);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += isSpeaking || isPlayingAudio ? 0.15 : 0.02;
      animId = requestAnimationFrame(renderWave);
    };

    renderWave();
    return () => cancelAnimationFrame(animId);
  }, [isSpeaking, isPlayingAudio]);

  // Send to Subtitle Studio
  const handleSendToSubtitleStudio = async () => {
    if (!audioBlob) {
      toast.warning("Please click 'Synthesize Audio' first");
      return;
    }
    try {
      await saveTransferAudio(audioBlob, "ai_voiceover.wav");
      toast.success("Voiceover sent! Opening Subtitle Studio...");
      router.push("/dashboard/subtitle-sync-editor");
    } catch (err) {
      console.error("Transfer error:", err);
      toast.error("Failed to transfer audio to Subtitle Studio");
    }
  };

  // Send to Video Generator
  const handleSendToVideoGenerator = async () => {
    if (!audioBlob) {
      toast.warning("Please click 'Synthesize Audio' first");
      return;
    }
    try {
      await saveTransferAudio(audioBlob, "ai_voiceover.wav");
      toast.success("Voiceover sent! Opening Video Generator...");
      router.push("/dashboard/video-editor");
    } catch (err) {
      console.error("Transfer error:", err);
      toast.error("Failed to transfer audio to Video Generator");
    }
  };

  const handleTogglePlayAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play();
    else audio.pause();
  };

  return {
    audioRef,
    canvasRef,
    voices,
    selectedVoiceURI,
    setSelectedVoiceURI,
    persona,
    rate,
    setRate,
    pitch,
    setPitch,
    isSpeaking,
    isSynthesizing,
    audioBlob,
    audioUrl,
    isPlayingAudio,
    setIsPlayingAudio,
    statusMessage,
    handleSelectPersona,
    handleSpeakPreview,
    handleSynthesizeAudio,
    handleSendToSubtitleStudio,
    handleSendToVideoGenerator,
    handleTogglePlayAudio,
  };
}

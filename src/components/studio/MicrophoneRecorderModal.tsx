"use client";

import {
  Download,
  FileAudio,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Volume2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { saveTransferAudio } from "@/lib/studio-transfer";

interface MicrophoneRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAudioRecorded?: (file: File) => void;
}

export function MicrophoneRecorderModal({
  isOpen,
  onClose,
  onAudioRecorded,
}: MicrophoneRecorderModalProps) {
  const router = useRouter();

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up resources on modal close
  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      setIsRecording(false);
      setIsPaused(false);
      setRecordSeconds(0);
    }
  }, [isOpen, isRecording]);

  // Visualizer loop during recording
  const startVisualizer = (stream: MediaStream) => {
    try {
      const audioCtx = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      )();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const draw = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / dataArray.length) * 2.2;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;

          // Gradient color cyan to pink
          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
          gradient.addColorStop(0, "#00d2ff");
          gradient.addColorStop(0.5, "#ec4899");
          gradient.addColorStop(1, "#f97316");

          ctx.fillStyle = gradient;
          ctx.fillRect(
            x,
            (canvas.height - barHeight) / 2,
            barWidth - 1,
            Math.max(2, barHeight),
          );
          x += barWidth;
        }

        animFrameRef.current = requestAnimationFrame(draw);
      };

      draw();
    } catch (err) {
      console.warn("Visualizer failed to start:", err);
    }
  };

  const handleStartRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setIsRecording(false);
        setIsPaused(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };

      recorder.start(100);
      setIsRecording(true);
      setIsPaused(false);
      setRecordSeconds(0);
      setAudioBlob(null);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);

      // Start canvas visualizer
      startVisualizer(stream);
    } catch (err) {
      console.error("Microphone access error:", err);
      toast.error(
        "Could not access microphone. Please check browser permissions.",
      );
    }
  };

  const handlePauseResume = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleDownload = () => {
    if (!audioBlob) return;
    const a = document.createElement("a");
    a.href = audioUrl || URL.createObjectURL(audioBlob);
    a.download = `voice_recording_${Date.now()}.webm`;
    a.click();
    toast.success("Downloaded voice recording");
  };

  const handleSendToTranscribe = async () => {
    if (!audioBlob) return;
    try {
      const file = new File([audioBlob], `mic_recording_${Date.now()}.webm`, {
        type: "audio/webm",
      });
      if (onAudioRecorded) {
        onAudioRecorded(file);
        onClose();
        return;
      }
      await saveTransferAudio(file, file.name);
      toast.success("Audio transferred to Transcriber!");
      router.push("/dashboard/transcribe");
      onClose();
    } catch (err) {
      console.error("Failed to transfer audio:", err);
      toast.error("Failed to transfer audio");
    }
  };

  const handleSendToSubtitleStudio = async () => {
    if (!audioBlob) return;
    try {
      const file = new File([audioBlob], `mic_recording_${Date.now()}.webm`, {
        type: "audio/webm",
      });
      await saveTransferAudio(file, file.name);
      toast.success("Audio transferred to Subtitle Sync Studio!");
      router.push("/dashboard/subtitle-sync-editor");
      onClose();
    } catch (err) {
      console.error("Failed to transfer audio:", err);
      toast.error("Failed to transfer audio");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg flex flex-col bg-[#0c0e16] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#101320]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white font-heading">
                Live Microphone Recorder
              </h2>
              <p className="text-xs text-slate-400">
                Record crystal-clear voice narration directly in your browser
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recording Visualizer & Status */}
        <div className="p-6 flex flex-col items-center gap-5">
          <div className="w-full flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  isRecording
                    ? isPaused
                      ? "bg-amber-400"
                      : "bg-red-500 animate-pulse"
                    : "bg-slate-600"
                }`}
              />
              <span className="font-bold text-white">
                {isRecording
                  ? isPaused
                    ? "RECORDING PAUSED"
                    : "RECORDING LIVE"
                  : audioBlob
                    ? "RECORDING READY"
                    : "READY TO RECORD"}
              </span>
            </div>
            <span className="text-lg font-black text-cyan-400">
              {formatTimer(recordSeconds)}
            </span>
          </div>

          {/* Waveform Canvas */}
          <div className="w-full h-28 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center overflow-hidden p-2">
            <canvas
              ref={canvasRef}
              width={420}
              height={100}
              className="w-full h-full"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {!isRecording && !audioBlob && (
              <button
                type="button"
                onClick={handleStartRecording}
                className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-linear-to-r from-red-500 to-rose-600 hover:brightness-110 text-white font-black text-sm shadow-xl shadow-red-500/25 transition-all cursor-pointer"
              >
                <Mic className="w-5 h-5" />
                <span>Start Recording</span>
              </button>
            )}

            {isRecording && (
              <>
                <button
                  type="button"
                  onClick={handlePauseResume}
                  className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white transition-all cursor-pointer border border-white/10"
                  title={isPaused ? "Resume" : "Pause"}
                >
                  {isPaused ? (
                    <Play className="w-5 h-5" />
                  ) : (
                    <Pause className="w-5 h-5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-linear-to-r from-red-600 to-rose-700 hover:brightness-110 text-white font-black text-sm shadow-xl shadow-red-600/30 transition-all cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Finish Recording</span>
                </button>
              </>
            )}

            {audioBlob && !isRecording && (
              <button
                type="button"
                onClick={handleStartRecording}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Record Again</span>
              </button>
            )}
          </div>

          {/* Audio Playback Preview */}
          {audioUrl && (
            <div className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-bold">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span>Audio Preview ({formatTimer(recordSeconds)})</span>
                </span>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1 text-cyan-400 hover:underline cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .webm</span>
                </button>
              </div>

              <audio
                ref={previewAudioRef}
                src={audioUrl}
                controls
                className="w-full h-10 rounded-xl"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {audioBlob && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-white/10 bg-[#101320]">
            <span className="text-[11px] text-slate-400 font-mono">
              Ready to process voice track
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSendToTranscribe}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-violet-500 to-indigo-500 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-violet-500/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Transcribe (Groq)</span>
              </button>

              <button
                type="button"
                onClick={handleSendToSubtitleStudio}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-cyan-400 to-blue-500 hover:brightness-110 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <FileAudio className="w-4 h-4" />
                <span>Sync in Subtitle Studio</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

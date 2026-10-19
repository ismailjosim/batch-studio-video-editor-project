"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import type { BgmTrackSettings, SubtitleCue } from "../subtitle-sync-types";
import { createDemoBgmAudioBuffer } from "../subtitle-sync-utils";

export function useSubtitlePlayback(
  cues: SubtitleCue[],
  selectedId: number | null,
  setSelectedId: (id: number | null) => void,
  setStatusText: (text: string) => void,
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [duration, setDuration] = useState<number>(15.5);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(190);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState<boolean>(true);

  // Multi-Track BGM State
  const [bgmTrack, setBgmTrack] = useState<BgmTrackSettings>({
    url: null,
    fileName: "",
    volume: 0.25,
    isDuckingEnabled: true,
    duckingAmount: 0.65,
  });

  // Audio Playback Animation Loop with Speech Ducking
  const updatePlayheadLoop = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused && !audio.ended) {
      setCurrentTime(audio.currentTime);

      // Auto-update selected cue based on playback position
      const currentMs = audio.currentTime * 1000;
      const activeCue = cues.find(
        (c) => currentMs >= c.startMs && currentMs <= c.endMs,
      );
      if (activeCue && activeCue.id !== selectedId) {
        setSelectedId(activeCue.id);
      }

      // Multi-Track BGM speech ducking
      const bgm = bgmAudioRef.current;
      if (bgm && !bgm.paused) {
        const isSpeechActive = cues.some(
          (c) => currentMs >= c.startMs && currentMs <= c.endMs,
        );
        const targetBgmVol =
          bgmTrack.isDuckingEnabled && isSpeechActive
            ? bgmTrack.volume * (1 - bgmTrack.duckingAmount)
            : bgmTrack.volume;
        bgm.volume = Math.max(0, Math.min(1, targetBgmVol));
      }

      animFrameRef.current = requestAnimationFrame(updatePlayheadLoop);
    } else {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    }
  }, [cues, selectedId, setSelectedId, bgmTrack]);

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.src) {
      toast.warning("Load an audio file or click 'Load Demo Sample Project'");
      return;
    }

    if (audio.paused || audio.ended) {
      if (audio.ended) audio.currentTime = 0;
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          // Sync and play BGM if loaded
          if (bgmAudioRef.current && bgmTrack.url) {
            if (bgmAudioRef.current.duration) {
              bgmAudioRef.current.currentTime =
                audio.currentTime % bgmAudioRef.current.duration;
            }
            bgmAudioRef.current.play().catch(() => {});
          }
          if (animFrameRef.current === null) {
            animFrameRef.current = requestAnimationFrame(updatePlayheadLoop);
          }
        })
        .catch((err) => {
          console.warn("Playback error:", err);
          setIsPlaying(false);
          toast.error("Audio playback could not be started");
        });
    } else {
      audio.pause();
      if (bgmAudioRef.current) {
        bgmAudioRef.current.pause();
      }
      setIsPlaying(false);
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    }
  }, [updatePlayheadLoop, bgmTrack.url]);

  const seekTo = useCallback(
    (timeSec: number) => {
      const audio = audioRef.current;
      const safeTime = Math.max(0, Math.min(duration, timeSec));
      setCurrentTime(safeTime);
      if (audio) {
        audio.currentTime = safeTime;
      }
      if (bgmAudioRef.current?.duration) {
        bgmAudioRef.current.currentTime =
          safeTime % bgmAudioRef.current.duration;
      }

      const ms = safeTime * 1000;
      const cueAtSeek = cues.find((c) => ms >= c.startMs && ms <= c.endMs);
      if (cueAtSeek) {
        setSelectedId(cueAtSeek.id);
      }
    },
    [duration, cues, setSelectedId],
  );

  const jumpSeconds = useCallback(
    (delta: number) => {
      seekTo(currentTime + delta);
    },
    [currentTime, seekTo],
  );

  const handleChangeVolume = useCallback(
    (newVolume: number) => {
      const clamped = Math.max(0, Math.min(1, newVolume));
      setVolume(clamped);
      if (audioRef.current) {
        audioRef.current.volume = clamped;
        if (clamped > 0 && isMuted) {
          setIsMuted(false);
          audioRef.current.muted = false;
        }
      }
    },
    [isMuted],
  );

  const handleToggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  }, [isMuted]);

  // Audition a specific time range (e.g. for a single word)
  const handleAuditionRange = useCallback((startMs: number, endMs: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const startTime = Math.max(0, startMs / 1000);
    const stopTime = Math.max(startTime + 0.1, endMs / 1000);
    audio.currentTime = startTime;
    setCurrentTime(startTime);
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        const checkAudition = () => {
          if (audio.currentTime >= stopTime || audio.paused) {
            audio.pause();
            setIsPlaying(false);
          } else {
            requestAnimationFrame(checkAudition);
          }
        };
        requestAnimationFrame(checkAudition);
      })
      .catch(() => {});
  }, []);

  // Multi-Track BGM Handlers
  const handleSelectBgmFile = useCallback(
    (file: File) => {
      if (bgmTrack.url) URL.revokeObjectURL(bgmTrack.url);
      const url = URL.createObjectURL(file);
      setBgmTrack((prev) => ({
        ...prev,
        url,
        fileName: file.name,
      }));
      toast.success(`Loaded BGM Track: ${file.name}`);
      setStatusText(`Multi-track active · BGM: ${file.name}`);
    },
    [bgmTrack.url, setStatusText],
  );

  const handleLoadDemoBgm = useCallback(() => {
    if (bgmTrack.url) URL.revokeObjectURL(bgmTrack.url);
    const buffer = createDemoBgmAudioBuffer();
    const blob = new Blob([buffer], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);
    setBgmTrack((prev) => ({
      ...prev,
      url,
      fileName: "ambient_lofi_chords.wav",
    }));
    toast.success("Loaded Synthesized Ambient Lo-Fi BGM Track!");
    setStatusText("Multi-track active · Synthesized Lo-Fi BGM loaded");
  }, [bgmTrack.url, setStatusText]);

  const handleRemoveBgm = useCallback(() => {
    if (bgmTrack.url) URL.revokeObjectURL(bgmTrack.url);
    setBgmTrack((prev) => ({
      ...prev,
      url: null,
      fileName: "",
    }));
    if (bgmAudioRef.current) {
      bgmAudioRef.current.pause();
    }
    toast.info("Removed background music track");
  }, [bgmTrack.url]);

  const handleChangeBgmVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setBgmTrack((prev) => ({ ...prev, volume: clamped }));
    if (bgmAudioRef.current) {
      bgmAudioRef.current.volume = clamped;
    }
  }, []);

  const handleToggleBgmDucking = useCallback(() => {
    setBgmTrack((prev) => {
      const next = !prev.isDuckingEnabled;
      toast.info(
        next
          ? "Speech Auto-Ducking enabled (music lowers during voiceover)"
          : "Speech Auto-Ducking disabled",
      );
      return { ...prev, isDuckingEnabled: next };
    });
  }, []);

  return {
    audioRef,
    bgmAudioRef,
    animFrameRef,
    duration,
    setDuration,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    zoom,
    setZoom,
    playbackRate,
    setPlaybackRate,
    isMuted,
    volume,
    isAutoScrollEnabled,
    setIsAutoScrollEnabled,
    bgmTrack,
    setBgmTrack,
    togglePlayback,
    seekTo,
    jumpSeconds,
    handleChangeVolume,
    handleToggleMute,
    handleAuditionRange,
    handleSelectBgmFile,
    handleLoadDemoBgm,
    handleRemoveBgm,
    handleChangeBgmVolume,
    handleToggleBgmDucking,
  };
}

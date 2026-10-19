"use client";

import { useEffect } from "react";
import { SubtitleHeader } from "./components/SubtitleHeader";
import { SubtitleStatusBar } from "./components/SubtitleStatusBar";
import { useSubtitleCues } from "./hooks/useSubtitleCues";
import { useSubtitlePlayback } from "./hooks/useSubtitlePlayback";
import { useSubtitleSession } from "./hooks/useSubtitleSession";
import { SubtitleInspector } from "./SubtitleInspector";
import { SubtitleLivePreview } from "./SubtitleLivePreview";
import { SubtitleTimeline } from "./SubtitleTimeline";
import { SubtitleToolsSidebar } from "./SubtitleToolsSidebar";
import { SubtitleTransport } from "./SubtitleTransport";

export function SubtitleSyncStudio() {
  // Playback & BGM Hook
  const playback = useSubtitlePlayback(
    [], // temporary placeholder, connected below
    null,
    () => {},
    () => {},
  );

  // Subtitle Cues & CRUD Hook
  const cueEngine = useSubtitleCues(
    playback.currentTime,
    playback.duration,
    playback.seekTo,
    () => {},
  );

  // Session & File Management Hook
  const session = useSubtitleSession(
    cueEngine.cues,
    cueEngine.setCues,
    cueEngine.setSelectedId,
    playback.setDuration,
    playback.setCurrentTime,
    playback.setIsPlaying,
    cueEngine.setHistory,
    cueEngine.saveUndoState,
    playback.seekTo,
    playback.audioRef,
  );

  // Re-wire playback loop to active cues and status
  const { cues, selectedId } = cueEngine;
  const { audioRef, bgmAudioRef, animFrameRef } = playback;

  // Auto-update selected cue and BGM speech ducking
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      const currentMs = audio.currentTime * 1000;
      const activeCue = cues.find(
        (c) => currentMs >= c.startMs && currentMs <= c.endMs,
      );
      if (activeCue && activeCue.id !== selectedId) {
        cueEngine.setSelectedId(activeCue.id);
      }

      // Multi-Track BGM speech ducking
      const bgm = bgmAudioRef.current;
      if (bgm && !bgm.paused) {
        const isSpeechActive = cues.some(
          (c) => currentMs >= c.startMs && currentMs <= c.endMs,
        );
        const targetBgmVol =
          playback.bgmTrack.isDuckingEnabled && isSpeechActive
            ? playback.bgmTrack.volume * (1 - playback.bgmTrack.duckingAmount)
            : playback.bgmTrack.volume;
        bgm.volume = Math.max(0, Math.min(1, targetBgmVol));
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [
    audioRef,
    bgmAudioRef,
    cues,
    selectedId,
    playback.bgmTrack,
    cueEngine.setSelectedId,
  ]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (!isInput) {
          e.preventDefault();
          cueEngine.handleUndo();
          return;
        }
      }

      // Export: Ctrl+E or Cmd+E
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        session.handleExportSrt();
        return;
      }

      if (isInput) return;

      // Spacebar: Toggle Play/Pause
      if (e.code === "Space") {
        e.preventDefault();
        playback.togglePlayback();
        return;
      }

      // S: Split at Playhead
      if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        cueEngine.handleSplitAtPlayhead();
        return;
      }

      // + or A: Add cue
      if (e.key === "+" || e.key.toLowerCase() === "a") {
        e.preventDefault();
        cueEngine.handleAddCue();
        return;
      }

      // Del or Backspace: Delete selected cue
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        cueEngine.handleDeleteSelected();
        return;
      }

      // Left / Right arrows to jump
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        playback.jumpSeconds(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        playback.jumpSeconds(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cueEngine, session, playback]);

  const selectedCue =
    cueEngine.cues.find((c) => c.id === cueEngine.selectedId) || null;

  return (
    <div className="flex flex-col gap-5 w-full max-w-full min-w-0 overflow-x-hidden animate-in fade-in duration-300 pb-16">
      {/* Hidden Audio Elements */}
      <audio
        ref={playback.audioRef}
        src={session.audioUrl || undefined}
        preload="auto"
        onLoadedMetadata={() => {
          const audio = playback.audioRef.current;
          if (audio) {
            audio.volume = playback.volume;
            audio.muted = playback.isMuted;
            audio.playbackRate = playback.playbackRate;
            if (audio.duration && Number.isFinite(audio.duration)) {
              playback.setDuration(audio.duration);
            }
          }
        }}
        onEnded={() => {
          playback.setIsPlaying(false);
          if (animFrameRef.current !== null) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
          }
          if (playback.bgmAudioRef.current) {
            playback.bgmAudioRef.current.pause();
          }
        }}
      />
      <audio
        ref={playback.bgmAudioRef}
        src={playback.bgmTrack.url || undefined}
        loop
        preload="auto"
      />

      {/* Top Session Header */}
      <SubtitleHeader
        audioFileName={session.audioFileName}
        cuesCount={cueEngine.cues.length}
        duration={playback.duration}
        onExportSrt={session.handleExportSrt}
      />

      {/* Main Workspace: Sidebar + Editor */}
      <div className="flex flex-col lg:flex-row gap-5 items-start w-full max-w-full min-w-0">
        {/* Left Sidebar */}
        <SubtitleToolsSidebar
          audioFileName={session.audioFileName}
          srtFileName={session.srtFileName}
          bgmFileName={playback.bgmTrack.fileName}
          hasAudio={Boolean(session.audioUrl)}
          hasSrt={cueEngine.cues.length > 0}
          hasBgm={Boolean(playback.bgmTrack.url)}
          canUndo={cueEngine.history.length > 0}
          selectedCue={selectedCue}
          onSelectAudioFile={session.handleSelectAudioFile}
          onSelectSrtFile={session.handleSelectSrtFile}
          onSelectBgmFile={playback.handleSelectBgmFile}
          onLoadDemoBgm={playback.handleLoadDemoBgm}
          onRemoveBgm={playback.handleRemoveBgm}
          onLoadTimeline={session.handleLoadTimeline}
          onLoadDemoProject={session.handleLoadDemoProject}
          onAutoAlignToSpeech={session.handleAutoAlignToSpeech}
          onSplitAtPlayhead={cueEngine.handleSplitAtPlayhead}
          onAddCue={cueEngine.handleAddCue}
          onDeleteSelected={cueEngine.handleDeleteSelected}
          onUndo={cueEngine.handleUndo}
          onResetProject={session.handleResetProject}
          onExportSrt={session.handleExportSrt}
          onSendToVideoGenerator={session.handleSendToVideoGenerator}
          onSendToBatchSplitter={session.handleSendToBatchSplitter}
        />

        {/* Right Editor Area */}
        <div className="flex-1 flex flex-col gap-4 w-full min-w-0 max-w-full overflow-hidden">
          {/* Live Typography Preview */}
          <SubtitleLivePreview
            cues={cueEngine.cues}
            currentTime={playback.currentTime}
            isPlaying={playback.isPlaying}
            onTogglePlay={playback.togglePlayback}
            onSeek={playback.seekTo}
          />

          {/* Timeline Track with Waveform & Subtitles */}
          <SubtitleTimeline
            cues={cueEngine.cues}
            selectedId={cueEngine.selectedId}
            duration={playback.duration}
            currentTime={playback.currentTime}
            zoom={playback.zoom}
            waveformPeaks={session.waveformPeaks}
            isPlaying={playback.isPlaying}
            isAutoScrollEnabled={playback.isAutoScrollEnabled}
            onSelectCue={cueEngine.setSelectedId}
            onUpdateCueTiming={cueEngine.handleUpdateCueTiming}
            onSeek={playback.seekTo}
          />

          {/* Audio Transport & Playback Scrubber */}
          <SubtitleTransport
            isPlaying={playback.isPlaying}
            currentTime={playback.currentTime}
            duration={playback.duration}
            zoom={playback.zoom}
            playbackRate={playback.playbackRate}
            isMuted={playback.isMuted}
            volume={playback.volume}
            isAutoScrollEnabled={playback.isAutoScrollEnabled}
            bgmTrack={playback.bgmTrack}
            onChangeBgmVolume={playback.handleChangeBgmVolume}
            onToggleBgmDucking={playback.handleToggleBgmDucking}
            onTogglePlay={playback.togglePlayback}
            onSeek={playback.seekTo}
            onChangeZoom={playback.setZoom}
            onChangePlaybackRate={(rate) => {
              playback.setPlaybackRate(rate);
              if (playback.audioRef.current) {
                playback.audioRef.current.playbackRate = rate;
              }
            }}
            onToggleMute={playback.handleToggleMute}
            onChangeVolume={playback.handleChangeVolume}
            onToggleAutoScroll={() =>
              playback.setIsAutoScrollEnabled((prev) => !prev)
            }
            onJump={playback.jumpSeconds}
          />

          {/* Selected Subtitle Inspector */}
          <SubtitleInspector
            cue={selectedCue}
            totalCues={cueEngine.cues.length}
            playheadMs={playback.currentTime * 1000}
            onUpdateText={cueEngine.handleUpdateCueText}
            onUpdateTiming={(s, e) => {
              if (cueEngine.selectedId !== null) {
                cueEngine.handleUpdateCueTiming(
                  cueEngine.selectedId,
                  s,
                  e,
                  true,
                );
              }
            }}
            onUpdateWords={cueEngine.handleUpdateCueWords}
            onAuditionRange={playback.handleAuditionRange}
            onDeleteCue={cueEngine.handleDeleteSelected}
            onSelectPrev={cueEngine.handleSelectPrevCue}
            onSelectNext={cueEngine.handleSelectNextCue}
          />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <SubtitleStatusBar statusText={session.statusText} zoom={playback.zoom} />
    </div>
  );
}

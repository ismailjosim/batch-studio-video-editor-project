"use client";

import { SidebarEditTools } from "./components/SidebarEditTools";
import { SidebarExportBridges } from "./components/SidebarExportBridges";
import { SidebarFilesSection } from "./components/SidebarFilesSection";
import type { SubtitleCue } from "./subtitle-sync-types";

interface SubtitleToolsSidebarProps {
  audioFileName: string;
  srtFileName: string;
  bgmFileName?: string;
  hasAudio: boolean;
  hasSrt: boolean;
  hasBgm?: boolean;
  isAudioLoading?: boolean;
  canUndo: boolean;
  selectedCue: SubtitleCue | null;
  onSelectAudioFile: (file: File) => void;
  onSelectSrtFile: (file: File) => void;
  onSelectBgmFile?: (file: File) => void;
  onLoadDemoBgm?: () => void;
  onRemoveBgm?: () => void;
  onLoadTimeline: () => void;
  onLoadDemoProject: () => void;
  onAutoAlignToSpeech: () => void;
  onSplitAtPlayhead: () => void;
  onAddCue: () => void;
  onDeleteSelected: () => void;
  onUndo: () => void;
  onResetProject: () => void;
  onExportSrt: () => void;
  onSendToVideoGenerator: () => void;
  onSendToBatchSplitter: () => void;
}

export function SubtitleToolsSidebar({
  audioFileName,
  srtFileName,
  bgmFileName,
  hasAudio,
  hasSrt,
  hasBgm,
  isAudioLoading = false,
  canUndo,
  selectedCue,
  onSelectAudioFile,
  onSelectSrtFile,
  onSelectBgmFile,
  onLoadDemoBgm,
  onRemoveBgm: _onRemoveBgm,
  onLoadTimeline,
  onLoadDemoProject,
  onAutoAlignToSpeech,
  onSplitAtPlayhead,
  onAddCue,
  onDeleteSelected,
  onUndo,
  onResetProject,
  onExportSrt,
  onSendToVideoGenerator,
  onSendToBatchSplitter,
}: SubtitleToolsSidebarProps) {
  return (
    <aside className="w-full lg:w-72 flex flex-col gap-5 p-4 bg-[#0e1018]/90 border border-white/10 rounded-3xl shadow-xl backdrop-blur-xl shrink-0">
      {/* 1. Project Files Section */}
      <SidebarFilesSection
        audioFileName={audioFileName}
        srtFileName={srtFileName}
        bgmFileName={bgmFileName}
        hasAudio={hasAudio}
        hasSrt={hasSrt}
        hasBgm={hasBgm}
        isAudioLoading={isAudioLoading}
        onSelectAudioFile={onSelectAudioFile}
        onSelectSrtFile={onSelectSrtFile}
        onSelectBgmFile={onSelectBgmFile}
        onLoadDemoBgm={onLoadDemoBgm}
        onLoadTimeline={onLoadTimeline}
        onLoadDemoProject={onLoadDemoProject}
      />

      <div className="border-t border-white/10" />

      {/* 2. Subtitle Precision Tools */}
      <SidebarEditTools
        hasAudio={hasAudio}
        hasSrt={hasSrt}
        canUndo={canUndo}
        selectedCue={selectedCue}
        onAutoAlignToSpeech={onAutoAlignToSpeech}
        onSplitAtPlayhead={onSplitAtPlayhead}
        onAddCue={onAddCue}
        onDeleteSelected={onDeleteSelected}
        onUndo={onUndo}
        onResetProject={onResetProject}
      />

      <div className="border-t border-white/10" />

      {/* 3. Studio Suite Seamless Transfer & Shortcuts */}
      <SidebarExportBridges
        hasSrt={hasSrt}
        onExportSrt={onExportSrt}
        onSendToVideoGenerator={onSendToVideoGenerator}
        onSendToBatchSplitter={onSendToBatchSplitter}
      />
    </aside>
  );
}

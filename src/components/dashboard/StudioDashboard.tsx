"use client";

import { VideoEditorClient } from "./video-editor/VideoEditorClient";

/**
 * @deprecated StudioDashboard has been refactored into modular App Router routes:
 * - /dashboard/overview
 * - /dashboard/video-editor
 * - /dashboard/subtitle-splitter
 * - /dashboard/image-generator
 */
export function StudioDashboard() {
  return <VideoEditorClient />;
}

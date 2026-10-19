<div align="center">

# 🎬 Batch Studio Suite (by JC Design)

**High-Performance Browser-Native 2K Video Generator, Whisper AI Transcriber & Waveform Subtitle Precision Studio**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Biome](https://img.shields.io/badge/Biome-Linter_%26_Formatter-60a5fa?style=for-the-badge&logo=biome)](https://biomejs.dev/)
[![WebCodecs](https://img.shields.io/badge/Hardware-WebCodecs_2K_MP4-00d2ff?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API)

</div>

---

## 📖 Overview

**Batch Studio Suite (by JC Design)** is an all-in-one, professional-grade creative suite designed for video creators, educators, and content agencies. Built with modern web standards, it executes high-speed 2K video rendering, AI speech transcription, audio synthesis, and millisecond-accurate subtitle synchronization entirely client-side using **WebCodecs**, **Web Audio API**, **HTML5 Canvas**, and **Whisper Large-v3**.

---

## 🌟 Studio Suite Features

### 1. Subtitle Studio & Waveform Precision Editor (`/dashboard/subtitle-sync-editor`)
Interactive subtitle synchronization studio engineered for frame-accurate timing:
- **Decoded Audio Waveform Canvas**: High-resolution audio waveform visualizer rendered via tiled HTML5 2D canvas, avoiding memory spikes on long tracks.
- **Default Sample Auto-Loader**: Automatically loads `public/demo.wav` and `public/demo.srt` on startup with real audio peaks and formatted cues.
- **Drag-to-Resize Cue Edges**: Interactive left and right edge handles on each subtitle block with needle snapping within 140ms.
- **Playhead Needle Splitting**: Press `S` or click "Split at playhead" to divide a subtitle cue at the exact playhead position with word-proportional text distribution.
- **Live Typography & Real-time Video Overlay Preview**:
  - **Aspect Ratio Toggles**: `9:16` (Shorts / Reels / TikTok), `16:9` (YouTube Widescreen), and `1:1` (Square).
  - **Style Presets**: *Hormozi Pop* (bold bouncing yellow), *Emerald Glow* (neon brand accent), *Classic Cinema*, and *Minimal Clean*.
  - **Word-Level Active Glowing**: Real-time highlight that enlarges (`scale-110`) and adds vibrant drop shadow to the active spoken word.
- **Word-Level Karaoke Timing Editor**:
  - Word pill breakdown with millisecond timestamps.
  - Individual `-50ms` / `+50ms` nudge buttons per word.
  - Dedicated **Audition Range** play button for each word.
  - One-click **Re-interpolate** button to re-distribute word timings based on character weights.
- **AI Voice Activity Detection (VAD) Speech Auto-Alignment**:
  - Analyzes audio energy in 20ms RMS windows to detect active speech boundaries.
  - Automatically snaps subtitle starts and ends to vocal cadences while filtering out silence.
- **Multi-Track Audio Engine with Smart Speech Ducking**:
  - Voiceover primary track + Background Music (BGM) secondary track.
  - Built-in ambient Lo-Fi pentatonic chord synthesizer for instant multi-track preview.
  - Smart Ducking reduces BGM volume by 65% when speech is active and restores it during pauses.
- **Multi-Level Session History**: Full Undo/Redo stack supporting `Ctrl+Z` up to 50 edits deep.
- **SRT Import & Export**: One-click standard SubRip (`.srt`) export with `Ctrl+E`.

### 2. AI Audio Transcriber & Subtitle Generator (`/dashboard/transcribe`)
Cloud-accelerated speech-to-text inference engine built to replace manual transcription and external Colab workflows:
- **Groq Whisper Large-v3 Cloud Inference**:
  - Transcribes speech audio in sub-second speeds (~0.5s - 1.5s) using high-throughput LPU acceleration.
  - Word-level timestamp granularities for millisecond synchronization.
- **External Colab / Gradio Server Fallback**:
  - Connects to custom Google Colab or self-hosted GPU endpoints via custom Gradio URLs if cloud API access is unavailable.
- **Multi-Format Transcription Modes**:
  - **Sentence SRT**: Smart sentence grouping using punctuation cues (`.`, `!`, `?`), natural pauses (>700ms), and reading comfort word caps.
  - **Word-by-Word SRT**: Generates individual cue timings per word for viral high-energy karaoke animations.
  - **Plain Text (TXT)**: Clean script transcript without timecodes for articles and captions.
- **Zero-Download 1-Click Studio Bridges**:
  - **Open in Subtitle Studio**: Seamlessly transfers the audio file and formatted cues via IndexedDB into the interactive timeline editor.
  - **Send to Video Generator**: Sends subtitles directly to the 2K WebCodecs GPU burn-in video renderer.

---

### 3. Hardware-Accelerated 2K Video Generator (`/dashboard/video-editor`)
Blazing-fast client-side video composition and rendering engine:
- **Hardware-Accelerated WebCodecs**: Directly encodes 2K / 1080p MP4 videos using GPU hardware codecs without requiring a backend rendering farm.
- **Direct Animated Subtitle Burn-In**:
  - Hardcodes synchronized subtitles and bouncing karaoke word highlights directly onto the video canvas during encoding.
  - Configurable typography presets matching the Subtitle Studio styles.
- **Transitions & Motion Effects**: Pan, zoom, slide, cross-dissolve, and glitch animations.
- **Audio Sound Effects (SFX)**: Integrated whooshes, camera shutters, paper crinkles, and swoosh sound effects synchronized to scene changes.
- **Batch Processing**: Generates multiple scene clips sequentially and packs them into a downloadable `.zip`.

---

### 4. Audio & Voice Studio (`/dashboard/audio-studio`)
AI narration and voiceover production studio:
- **Narration Script Editor**: Script area with live word counter, estimated speech duration, and curated script presets.
- **Voice Personas**:
  - `Deep Narrator`: Lower pitch, deliberate and authoritative cadence.
  - `Storyteller`: Natural tone, conversational pacing.
  - `Explainer`: Fast-paced, punchy delivery for YouTube and social media.
  - `Dramatic Trailer`: Deep cinematic atmosphere with resonance.
- **Web Audio Formant Synthesizer**: Generates 44.1kHz mono WAV files modeling vocal tract acoustic resonances.
- **Interactive Audio Waveform Visualizer**: Real-time canvas monitor reflecting audio synthesis and playback frequency waves.
- **1-Click Studio Suite Bridge**:
  - Direct zero-copy transfer into Subtitle Studio, AI Transcriber, and Video Generator via IndexedDB.

---

### 5. AI Image Generator & Subtitle Splitter
- **AI Image Generator (`/dashboard/image-generator`)**: Multi-model image generation with FLUX.1, Gemini Pro, and 2K resolution scaling.
- **SRT Batch Splitter (`/dashboard/subtitle-splitter`)**: Splits subtitle files by duration, line count, or scene transitions.
- **Overview Dashboard (`/dashboard/overview`)**: Quick stats, project metrics, system status, and fast action launchers.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Scope |
| :--- | :--- | :--- |
| <kbd>Space</kbd> | Toggle Play / Pause | Subtitle Studio & Video Editor |
| <kbd>S</kbd> | Split Subtitle Cue at Playhead Needle | Subtitle Studio |
| <kbd>+</kbd> or <kbd>A</kbd> | Add New Subtitle Cue on Timeline | Subtitle Studio |
| <kbd>Del</kbd> / <kbd>Backspace</kbd> | Delete Selected Subtitle Cue | Subtitle Studio |
| <kbd>←</kbd> / <kbd>→</kbd> | Jump 1 Second Backward / Forward | Subtitle Studio |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> | Undo Last Timeline Change | Subtitle Studio |
| <kbd>Ctrl</kbd> + <kbd>E</kbd> | Export Synced Subtitles as `.srt` | Subtitle Studio |

---

## 🛠️ Architecture & Code Quality

The codebase is organized with strict adherence to Next.js best practices:
- **Server Components by Default**: Top-level route pages (`src/app/dashboard/**/page.tsx`) are Next.js Server Components with metadata and 0 client runtime footprint.
- **Component Modularity**: Every UI component is partitioned into small, reusable sub-components keeping individual files under **300 lines**.
- **Separation of Concerns**: State and business logic are isolated in dedicated custom hooks:
  - `useTranscribeStudio`: Speech-to-text pipeline, format parsing, and studio bridges.
  - `useSubtitleCues`: Subtitle CRUD operations and undo/redo history.
  - `useSubtitlePlayback`: Audio loop, playhead tracking, and BGM speech ducking.
  - `useSubtitleSession`: File upload, demo asset loading, and VAD auto-alignment.
  - `useTimelineScroll`: Virtualized timeline scrolling and auto-scroll follow.
  - `useTimelineResize`: Mouse/touch cue boundary dragging with playhead snapping.
  - `useAudioSynthesis`: Formant vocal modeling, Web Audio WAV synthesis, and speech preview.
- **Linter & Formatter**: Fully compliant with **Biome** (`biome check` passes with 0 errors).
- **TypeScript**: Strict mode enabled with 0 type errors (`tsc --noEmit`).

---

## 📁 Project Structure

```text
batch-studio-video-editor/
├── public/
│   ├── demo.wav                  # Default voiceover sample audio
│   ├── demo.srt                  # Default synchronized subtitles
│   └── sfx/                      # Transition sound effects (whoosh, pop, slide)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── transcribe/       # Whisper Large-v3 & Colab proxy API
│   │   ├── dashboard/
│   │   │   ├── transcribe/       # AI Audio Transcriber route (Server Component)
│   │   │   ├── audio-studio/     # Audio & Voice Studio route (Server Component)
│   │   │   ├── subtitle-sync-editor/ # Subtitle Precision Studio route (Server Component)
│   │   │   ├── video-editor/     # 2K Video Generator route (Server Component)
│   │   │   └── ...
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── transcribe/       # Audio dropzone, format selector & bridges
│   │   │   ├── audio-studio/     # Audio Studio UI & synthesis hooks
│   │   │   └── ...
│   │   └── studio/
│   │       ├── subtitle-sync/    # Subtitle timeline, inspector, preview & tools
│   │       │   ├── components/   # Modular sub-components (<300 lines each)
│   │       │   ├── hooks/        # Dedicated custom hooks
│   │       │   └── utils/        # VAD, audio decoding, and timecode parsers
│   ├── lib/
│   │   ├── studio-transfer.ts    # IndexedDB cross-studio audio & cue transfer
│   │   └── video-generator/      # Canvas subtitle burn-in & WebCodecs pipeline
│   └── hooks/
│       └── useVideoGenerator.ts  # Hardware-accelerated MP4 encoder hook
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `18.18+` or `20+`
- `pnpm` (recommended) or `npm` / `yarn`

### Installation

```bash
# Clone repository
git clone https://github.com/your-repo/dollar-doodles-studio.git
cd batch-studio-video-editor

# Install dependencies
pnpm install
```

### Development Server

```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quality Checks & Build

```bash
# Run Biome lint & format check
pnpm run lint

# Auto-fix linting & formatting
pnpm run lint:fix

# Run TypeScript compiler
npx tsc --noEmit

# Production Build
pnpm run build

# Start Production Server
pnpm start
```

---

<div align="center">
Built with ❤️ for the Dollar Doodles Creative Suite.
</div>

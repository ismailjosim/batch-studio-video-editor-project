import mongoose from "mongoose";

export interface IVideoProject {
  userId?: string;
  title: string;
  srtFileName?: string;
  audioFileName?: string;
  resolution: "1440" | "1080" | "720";
  aspectRatio: "16:9" | "9:16";
  fps: number;
  bitrate: number;
  cuesCount: number;
  imagesCount: number;
  durationSec: number;
  animMode: "random" | "custom";
  selectedAnims: string[];
  sfxMode: "random" | "custom";
  selectedSfx: string[];
  isSfxEnabled: boolean;
  status: "draft" | "completed" | "failed";
  exportCount: number;
  lastExportedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGenerationHistory {
  projectId?: mongoose.Types.ObjectId;
  userId?: string;
  title: string;
  resolution: string;
  aspectRatio: string;
  durationSec: number;
  totalFrames: number;
  encodingSpeedFps?: number;
  status: "completed" | "canceled" | "failed";
  fileSizeBytes?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const videoProjectSchema = new mongoose.Schema<IVideoProject>(
  {
    userId: { type: String, index: true },
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Untitled Video Project",
    },
    srtFileName: { type: String },
    audioFileName: { type: String },
    resolution: {
      type: String,
      enum: ["1440", "1080", "720"],
      default: "1080",
    },
    aspectRatio: {
      type: String,
      enum: ["16:9", "9:16"],
      default: "16:9",
    },
    fps: { type: Number, default: 24 },
    bitrate: { type: Number, default: 8000000 },
    cuesCount: { type: Number, default: 0 },
    imagesCount: { type: Number, default: 0 },
    durationSec: { type: Number, default: 0 },
    animMode: {
      type: String,
      enum: ["random", "custom"],
      default: "random",
    },
    selectedAnims: { type: [String], default: [] },
    sfxMode: {
      type: String,
      enum: ["random", "custom"],
      default: "random",
    },
    selectedSfx: { type: [String], default: [] },
    isSfxEnabled: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["draft", "completed", "failed"],
      default: "draft",
    },
    exportCount: { type: Number, default: 0 },
    lastExportedAt: { type: Date },
  },
  { timestamps: true },
);

const generationHistorySchema = new mongoose.Schema<IGenerationHistory>(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "VideoProject" },
    userId: { type: String, index: true },
    title: { type: String, required: true },
    resolution: { type: String, required: true },
    aspectRatio: { type: String, required: true },
    durationSec: { type: Number, default: 0 },
    totalFrames: { type: Number, default: 0 },
    encodingSpeedFps: { type: Number },
    status: {
      type: String,
      enum: ["completed", "canceled", "failed"],
      default: "completed",
    },
    fileSizeBytes: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Hot reload cache eviction (Career-Graph-Project pattern)
if (mongoose.models.VideoProject) {
  delete (mongoose.models as Record<string, unknown>).VideoProject;
}
if (mongoose.models.GenerationHistory) {
  delete (mongoose.models as Record<string, unknown>).GenerationHistory;
}

export const VideoProject = mongoose.model<IVideoProject>(
  "VideoProject",
  videoProjectSchema,
);
export const GenerationHistory = mongoose.model<IGenerationHistory>(
  "GenerationHistory",
  generationHistorySchema,
);

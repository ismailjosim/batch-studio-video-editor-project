"use client";

import JSZip from "jszip";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clapperboard,
  Copy,
  Download,
  Eye,
  FileText,
  Film,
  FolderArchive,
  Hash,
  Layers,
  RefreshCw,
  Sliders,
  Sparkles,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import type {
  MetadataResult,
  Prompt2Result,
} from "@/lib/gemini-prompt-director";

export function PromptStudioClient() {
  // Input states
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [projectNumber, setProjectNumber] = useState("13");
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [script, setScript] = useState("");
  const [srtContent, setSrtContent] = useState("");
  const [activeInputTab, setActiveInputTab] = useState<"srt" | "script">("srt");

  // Loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");

  // Result states
  const [prompt2Data, setPrompt2Data] = useState<Prompt2Result | null>(null);
  const [metadataData, setMetadataData] = useState<MetadataResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<
    "scenes" | "style" | "metadata"
  >("scenes");

  // Copy tracking states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Handle SRT File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setSrtContent(content);
        setActiveInputTab("srt");
        toast.success(`Loaded subtitle file: ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  // Quick load Suez Canal sample
  const handleLoadSample = () => {
    setProjectNumber("13");
    setAspectRatio("16:9");
    setScript(
      `Centuries before our era, Egyptian pharaohs stared at the desert and said: let's dig here.\nThey hit a dead end.\nPersian kings tried next, but desert sandstorms buried the entire ditch.\nRoman emperors saw the astronomical construction cost and backed away.\nToday, the Suez Canal is the most lucrative toll booth on Earth.\nYet the nation that dug the canal, bled for it, and paid for it did not get rich.\nThey went completely bankrupt.\nAnd within seven years of the grand opening, foreign debt collectors marched their military into the country and seized the entire empire.\nHow does a sovereign nation build the most valuable trade shortcut in human history and end up losing everything to a four-million-pound check?\nLet's examine the raw math of the greatest debt trap ever engineered.`,
    );
    setSrtContent(
      `1\n00:00:00,610 --> 00:00:03,190\nCenturies before our era, Egyptian pharaohs stared at\n\n2\n00:00:03,190 --> 00:00:05,070\nthe desert and said, let's dig here.\n\n3\n00:00:05,390 --> 00:00:06,210\nThey hit a dead end.\n\n4\n00:00:06,550 --> 00:00:09,770\nPersian kings tried next, but desert sandstorms buried\n\n5\n00:00:09,770 --> 00:00:10,710\nthe entire ditch.\n\n6\n00:00:11,130 --> 00:00:14,030\nRoman emperors saw the astronomical construction cost and\n\n7\n00:00:14,030 --> 00:00:14,530\nbacked away.\n\n8\n00:00:14,850 --> 00:00:17,390\nToday, the Suez Canal is the most lucrative\n\n9\n00:00:17,390 --> 00:00:19,250\ntollbooth on earth.\n\n10\n00:00:19,550 --> 00:00:22,050\nThey went completely bankrupt.`,
    );
    toast.success("Loaded Suez Canal project sample!");
  };

  // Execution Handlers
  const handleGenerate = async (action: "prompt2" | "prompt3" | "all") => {
    if (!srtContent.trim() && !script.trim()) {
      toast.error(
        "Please paste your script or upload an .srt subtitle file first.",
      );
      return;
    }

    setIsGenerating(true);
    setGenerationStep(
      action === "all"
        ? "Formulating Scene Prompts & Viral Metadata..."
        : action === "prompt2"
          ? "Generating 2D Scene Prompts (Prompt 2)..."
          : "Generating Viral Metadata (Prompt 3)...",
    );

    try {
      const res = await fetch("/api/prompt-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          script,
          srtContent,
          aspectRatio,
          projectNumber,
          apiKey,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Generation request failed");
      }

      if (json.data.prompt2) {
        setPrompt2Data(json.data.prompt2);
        setActiveResultTab("scenes");
      }
      if (json.data.prompt3) {
        setMetadataData(json.data.prompt3);
        if (action === "prompt3") setActiveResultTab("metadata");
      }

      toast.success(
        action === "all"
          ? "Director Pipeline completed! Scenes & Metadata ready."
          : action === "prompt2"
            ? "Scene Prompts (Prompt 2) successfully generated!"
            : "Viral Metadata (Prompt 3) successfully generated!",
      );
    } catch (err: unknown) {
      console.error(err);
      toast.error((err as Error).message || "Generation encountered an error.");
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  // Download Individual Files
  const downloadTextFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  // Download All as ZIP
  const handleDownloadZip = async () => {
    if (!prompt2Data && !metadataData) return;

    const zip = new JSZip();
    const folderName = `project-${projectNumber || "01"}-prompts`;
    const folder = zip.folder(folderName) || zip;

    if (prompt2Data) {
      folder.file("02-Style.txt", prompt2Data.styleContent);
      folder.file("02-Scene-Prompts.txt", prompt2Data.scenePromptsContent);
    }
    if (metadataData) {
      folder.file("03-Metadata.txt", metadataData.rawContent);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${folderName}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded all files in ${folderName}.zip!`);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-in fade-in duration-300 pb-20">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-b from-[#1a1b26]/90 via-[#10111a]/95 to-[#0b0c13] p-6 lg:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3DAA72]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#C8252B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Prompt 2 & Prompt 3 Full Pipeline Engine</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-heading font-black tracking-tight text-white flex items-center gap-3">
              Dollar Doodles{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-teal-300 to-rose-400">
                AI Director
              </span>
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Convert scripts & .srt files directly into production-ready 2D
              Stickman scene prompts for Google Flow, along with high-CTR viral
              titles, SEO tags, and YouTube metadata.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Load Sample Data
            </button>
            <button
              type="button"
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              {apiKey ? "Custom Key Active" : "Gemini API Connected"}
            </button>
          </div>
        </div>

        {/* Optional Custom API Key accordion */}
        {showKeyInput && (
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col md:flex-row items-center gap-3">
            <label
              htmlFor="gemini-key-input"
              className="text-xs text-slate-400 shrink-0"
            >
              Gemini API Key Override:
            </label>
            <input
              id="gemini-key-input"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Leave empty to use server GEMINI_API_KEY from .env.local"
              className="w-full md:max-w-md px-3 py-1.5 text-xs bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500/50"
            />
            <span className="text-[11px] text-emerald-400/80 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Server Key is pre-configured
            </span>
          </div>
        )}
      </div>

      {/* Main Grid: Inputs & Execution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Project Config & Inputs */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Settings Box */}
          <div className="p-5 rounded-2xl bg-[#11121c]/90 border border-white/10 backdrop-blur-md space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Video Settings
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {/* Aspect Ratio */}
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1.5">
                  Format / Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setAspectRatio("16:9")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      aspectRatio === "16:9"
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    16:9 Wide
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio("9:16")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      aspectRatio === "9:16"
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    9:16 Short
                  </button>
                </div>
              </div>

              {/* Project ID */}
              <div>
                <label
                  htmlFor="project-num-input"
                  className="text-[11px] text-slate-400 font-medium block mb-1.5"
                >
                  Video / Project ID (e.g. 13)
                </label>
                <input
                  id="project-num-input"
                  type="text"
                  value={projectNumber}
                  onChange={(e) => setProjectNumber(e.target.value)}
                  placeholder="13"
                  className="w-full px-3 py-1.5 text-xs bg-black/40 border border-white/10 rounded-xl text-white font-mono placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Input Source Tabs */}
          <div className="p-5 rounded-2xl bg-[#11121c]/90 border border-white/10 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setActiveInputTab("srt")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeInputTab === "srt"
                      ? "bg-white/15 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Subtitle (.SRT)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInputTab("script")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeInputTab === "script"
                      ? "bg-white/15 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Full Script (.TXT)
                </button>
              </div>

              {activeInputTab === "srt" && (
                <label className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  Upload .SRT
                  <input
                    type="file"
                    accept=".srt,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {activeInputTab === "srt" ? (
              <div>
                <textarea
                  value={srtContent}
                  onChange={(e) => setSrtContent(e.target.value)}
                  placeholder={`1\n00:00:00,000 --> 00:00:02,500\nPaste your .srt subtitle file content here...`}
                  className="w-full h-64 p-3 bg-black/40 border border-white/10 rounded-xl text-xs text-slate-200 font-mono resize-none focus:outline-hidden focus:border-emerald-500 leading-relaxed placeholder:text-slate-600"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>
                    {srtContent.trim()
                      ? `~${(srtContent.match(/-->/g) || []).length} subtitle entries detected`
                      : "Upload or paste your full SRT file"}
                  </span>
                  {srtContent.trim() && (
                    <button
                      type="button"
                      onClick={() => setSrtContent("")}
                      className="text-rose-400 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Paste your full Dollar Doodles video script text here..."
                  className="w-full h-64 p-3 bg-black/40 border border-white/10 rounded-xl text-xs text-slate-200 font-sans resize-none focus:outline-hidden focus:border-emerald-500 leading-relaxed placeholder:text-slate-600"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>
                    {script.trim()
                      ? `${script.trim().split(/\s+/).length} words • ${script.length} chars`
                      : "Paste script text"}
                  </span>
                  {script.trim() && (
                    <button
                      type="button"
                      onClick={() => setScript("")}
                      className="text-rose-400 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => handleGenerate("all")}
                disabled={isGenerating}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:opacity-95 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{generationStep || "Processing with Gemini..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Full Pipeline (Prompts 2 & 3)</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleGenerate("prompt2")}
                  disabled={isGenerating}
                  className="py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Clapperboard className="w-3.5 h-3.5 text-emerald-400" />
                  Generate Prompts Only
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerate("prompt3")}
                  disabled={isGenerating}
                  className="py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-400" />
                  Generate Metadata Only
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Output Results */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Results Navigation Bar */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-[#11121c]/90 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveResultTab("scenes")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeResultTab === "scenes"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>02-Scene-Prompts.txt</span>
                {prompt2Data && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300">
                    {prompt2Data.totalScenes}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveResultTab("style")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeResultTab === "style"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>02-Style.txt</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveResultTab("metadata")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeResultTab === "metadata"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>03-Metadata.txt</span>
                {metadataData && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                )}
              </button>
            </div>

            {/* Quick Actions (Copy / Download) */}
            <div className="flex items-center gap-2">
              {(prompt2Data || metadataData) && (
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download ZIP</span>
                </button>
              )}
            </div>
          </div>

          {/* Tab Content 1: Scene Prompts */}
          {activeResultTab === "scenes" && (
            <div className="flex flex-col gap-4">
              {prompt2Data ? (
                <div className="p-5 rounded-2xl bg-[#11121c]/90 border border-white/10 backdrop-blur-md space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>02-Scene-Prompts.txt</span>
                        <span className="text-xs text-slate-400 font-normal">
                          ({prompt2Data.totalScenes} standalone prompts)
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Generated with {prompt2Data.modelUsed} • Formatted for
                        Google Flow
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            prompt2Data.scenePromptsContent,
                            "scenes-full",
                            "All Scene Prompts",
                          )
                        }
                        className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedKey === "scenes-full" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>Copy All</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          downloadTextFile(
                            "02-Scene-Prompts.txt",
                            prompt2Data.scenePromptsContent,
                          )
                        }
                        className="px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .txt</span>
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Prompts Preview */}
                  <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {prompt2Data.scenes.map((scene) => (
                      <div
                        key={scene.id}
                        className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors group flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              image {scene.id}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-300">
                              {scene.cameraAngle}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            {scene.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              scene.fullPrompt,
                              `scene-${scene.id}`,
                              `Prompt ${scene.id}`,
                            )
                          }
                          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
                          title="Copy single prompt"
                        >
                          {copiedKey === `scene-${scene.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}

                    {/* Renaming Rule Notice */}
                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-300/90 font-mono">
                      {prompt2Data.renamingInstruction}
                    </div>
                  </div>

                  {/* Transfer to Image Generator */}
                  <div className="pt-2 flex items-center justify-between border-t border-white/10">
                    <span className="text-xs text-slate-400">
                      Ready to generate in the Batch Studio?
                    </span>
                    <Link
                      href="/dashboard/image-generator"
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all flex items-center gap-2"
                    >
                      <span>Open Image Generator Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No Scene Prompts Generated Yet"
                  description="Upload your .srt file or paste your video script on the left, then click 'Run Full Pipeline' to generate 02-Scene-Prompts.txt."
                />
              )}
            </div>
          )}

          {/* Tab Content 2: Style & Global Rules */}
          {activeResultTab === "style" && (
            <div className="flex flex-col gap-4">
              {prompt2Data ? (
                <div className="p-5 rounded-2xl bg-[#11121c]/90 border border-white/10 backdrop-blur-md space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        02-Style.txt
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Brand Colors (#1a1a1a, #C8252B, #3DAA72), Mascot, &
                        Recurring Objects
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            prompt2Data.styleContent,
                            "style-full",
                            "Style Rules",
                          )
                        }
                        className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedKey === "style-full" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>Copy Style</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          downloadTextFile(
                            "02-Style.txt",
                            prompt2Data.styleContent,
                          )
                        }
                        className="px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .txt</span>
                      </button>
                    </div>
                  </div>

                  <pre className="p-4 rounded-xl bg-black/50 border border-white/10 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                    {prompt2Data.styleContent}
                  </pre>
                </div>
              ) : (
                <EmptyState
                  title="No Style Rules Generated Yet"
                  description="Run Prompt 2 or the Full Pipeline to generate the locked Dollar Doodles visual identity rules and recurring objects."
                />
              )}
            </div>
          )}

          {/* Tab Content 3: Viral Metadata Packaging */}
          {activeResultTab === "metadata" && (
            <div className="flex flex-col gap-4">
              {metadataData ? (
                <div className="space-y-4">
                  {/* Viral Titles Card */}
                  <div className="p-5 rounded-2xl bg-[#11121c]/90 border border-white/10 backdrop-blur-md space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                        <Clapperboard className="w-4 h-4" />
                        Viral Video Titles (4 angles, under 70 chars)
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        Pick the strongest angle
                      </span>
                    </div>

                    <div className="space-y-2">
                      {metadataData.titles.map((title, idx) => {
                        const labels = [
                          "Provocative Question",
                          "Counterintuitive Reframe",
                          "Street-Smart Reveal",
                          "Curiosity Gap",
                        ];
                        return (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-all flex items-center justify-between gap-3 group"
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Option {idx + 1}: {labels[idx] || "Angle"}
                              </span>
                              <p className="text-xs font-semibold text-white">
                                {title}
                              </p>
                              <span className="text-[10px] text-slate-500">
                                {title.length} characters
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(
                                  title,
                                  `title-${idx}`,
                                  `Title ${idx + 1}`,
                                )
                              }
                              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                              {copiedKey === `title-${idx}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>Copy</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description Card */}
                  <div className="p-5 rounded-2xl bg-[#11121c]/90 border border-white/10 backdrop-blur-md space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        YouTube Description & Chapters
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            metadataData.description,
                            "desc-full",
                            "Full Description",
                          )
                        }
                        className="px-3 py-1 rounded-xl text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "desc-full" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>Copy Description</span>
                      </button>
                    </div>

                    <p className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {metadataData.description}
                    </p>
                  </div>

                  {/* Tags Card */}
                  <div className="p-5 rounded-2xl bg-[#11121c]/90 border border-white/10 backdrop-blur-md space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Viral Video Tags (10 SEO Keywords)
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            metadataData.tags.join(", "),
                            "tags-comma",
                            "10 Comma-separated Tags",
                          )
                        }
                        className="px-3 py-1 rounded-xl text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "tags-comma" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>Copy All (Comma-Separated)</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {metadataData.tags.map((tag, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            copyToClipboard(tag, `tag-${idx}`, `Tag "${tag}"`)
                          }
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-black/40 border border-white/10 hover:border-emerald-500/40 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>{tag}</span>
                          {copiedKey === `tag-${idx}` && (
                            <Check className="w-3 h-3 text-emerald-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Thumbnail Prompts Card */}
                  <div className="p-5 rounded-2xl bg-[#11121c]/90 border border-white/10 backdrop-blur-md space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Google Flow High-CTR Thumbnail Prompts (16:9)
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          downloadTextFile(
                            "03-Metadata.txt",
                            metadataData.rawContent,
                          )
                        }
                        className="px-3 py-1 rounded-xl text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download 03-Metadata.txt</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {metadataData.thumbnailPrompts.map((thumb, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-300">
                              Thumbnail {idx + 1} ({thumb.type})
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(
                                  thumb.prompt,
                                  `thumb-${idx}`,
                                  `Thumbnail Prompt ${idx + 1}`,
                                )
                              }
                              className="px-2 py-1 rounded-lg text-[11px] font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 flex items-center gap-1 cursor-pointer"
                            >
                              {copiedKey === `thumb-${idx}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>Copy Prompt</span>
                            </button>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            {thumb.prompt}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No Metadata Generated Yet"
                  description="Run Prompt 3 or the Full Pipeline to generate viral YouTube titles, SEO tags, description, and Google Flow thumbnail concepts."
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-[#11121c]/60 border border-dashed border-white/10 text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
        <Film className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

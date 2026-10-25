"use client";

import { Check, Globe, Loader2, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { SubtitleCue } from "../subtitle-sync-types";

interface SubtitleTranslatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cues: SubtitleCue[];
  onApplyTranslatedCues: (translatedCues: SubtitleCue[]) => void;
  onSaveUndoState: () => void;
}

const SUPPORTED_LANGUAGES = [
  { code: "es", name: "Spanish (Español)", flag: "🇪🇸" },
  { code: "fr", name: "French (Français)", flag: "🇫🇷" },
  { code: "de", name: "German (Deutsch)", flag: "🇩🇪" },
  { code: "pt", name: "Portuguese (Português)", flag: "🇵🇹" },
  { code: "it", name: "Italian (Italiano)", flag: "🇮🇹" },
  { code: "ja", name: "Japanese (日本語)", flag: "🇯🇵" },
  { code: "ko", name: "Korean (한국어)", flag: "🇰🇷" },
  { code: "zh", name: "Chinese Simplified (简体中文)", flag: "🇨🇳" },
  { code: "hi", name: "Hindi (हिन्दी)", flag: "🇮🇳" },
  { code: "ar", name: "Arabic (العربية)", flag: "🇸🇦" },
  { code: "ru", name: "Russian (Русский)", flag: "🇷🇺" },
  { code: "nl", name: "Dutch (Nederlands)", flag: "🇳🇱" },
  { code: "tr", name: "Turkish (Türkçe)", flag: "🇹🇷" },
  { code: "pl", name: "Polish (Polski)", flag: "🇵🇱" },
  { code: "vi", name: "Vietnamese (Tiếng Việt)", flag: "🇻🇳" },
  { code: "id", name: "Indonesian (Bahasa)", flag: "🇮🇩" },
  { code: "sv", name: "Swedish (Svenska)", flag: "🇸🇪" },
  { code: "bn", name: "Bengali (বাংলা)", flag: "🇧🇩" },
];

export function SubtitleTranslatorModal({
  isOpen,
  onClose,
  cues,
  onApplyTranslatedCues,
  onSaveUndoState,
}: SubtitleTranslatorModalProps) {
  const [selectedLang, setSelectedLang] = useState("es");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedCues, setTranslatedCues] = useState<SubtitleCue[] | null>(
    null,
  );

  const selectedLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) ||
    SUPPORTED_LANGUAGES[0];

  const handleTranslate = async () => {
    if (!cues.length) {
      toast.warning("No subtitles loaded to translate");
      return;
    }

    setIsTranslating(true);
    setTranslatedCues(null);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cues,
          targetLanguage: selectedLang,
          targetLanguageName: selectedLangObj.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Translation request failed");
      }

      setTranslatedCues(data.translatedCues);
      toast.success(
        `Successfully translated ${cues.length} cues into ${selectedLangObj.name}!`,
      );
    } catch (err: unknown) {
      console.error("Translation error:", err);
      toast.error((err as Error).message || "Failed to translate subtitles");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleApply = () => {
    if (!translatedCues) return;
    onSaveUndoState();
    onApplyTranslatedCues(translatedCues);
    toast.success(
      `Applied ${selectedLangObj.name} subtitles to active timeline!`,
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl flex flex-col max-h-[85vh] bg-[#0c0e16] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#101320]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white font-heading">
                AI Multi-Language Subtitle Translator
              </h2>
              <p className="text-xs text-slate-400">
                Instantly localize your subtitle timing and text into 40+ global
                languages
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

        {/* Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Language Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300">
              Select Target Language
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLang(lang.code)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                    selectedLang === lang.code
                      ? "bg-violet-500/20 border-violet-500 text-white font-bold shadow-lg shadow-violet-500/10"
                      : "bg-[#131622] border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="truncate">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Translation Previews */}
          {translatedCues ? (
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>
                  Translation Preview ({selectedLangObj.flag}{" "}
                  {selectedLangObj.name}):
                </span>
                <span className="text-[11px] font-mono text-emerald-400">
                  ✓ {translatedCues.length} cues ready
                </span>
              </div>
              <div className="max-h-56 overflow-y-auto flex flex-col gap-2 pr-1 border border-white/10 rounded-2xl p-2 bg-black/40">
                {cues.slice(0, 10).map((originalCue, idx) => {
                  const translated = translatedCues[idx];
                  return (
                    <div
                      key={originalCue.id}
                      className="p-2 rounded-xl bg-white/2 border border-white/5 text-xs flex flex-col gap-1"
                    >
                      <div className="text-[10px] font-mono text-slate-500">
                        #{originalCue.id}
                      </div>
                      <div className="text-slate-400 line-through">
                        {originalCue.text}
                      </div>
                      <div className="text-emerald-300 font-medium">
                        {translated?.text || "..."}
                      </div>
                    </div>
                  );
                })}
                {cues.length > 10 && (
                  <div className="text-center py-1 text-[11px] text-slate-500">
                    + {cues.length - 10} more subtitles translated
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#131622] border border-white/5 flex flex-col items-center justify-center text-center gap-2 text-slate-400">
              <Sparkles className="w-8 h-8 text-violet-400" />
              <p className="text-xs font-semibold text-white">
                Ready to Translate {cues.length} Subtitles
              </p>
              <p className="text-[11px] max-w-sm">
                Each subtitle will be localized naturally using AI while
                preserving your precise timing cues and pause boundaries.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-white/10 bg-[#101320]">
          <span className="text-[11px] text-slate-400 font-mono">
            {cues.length} cues · {selectedLangObj.name}
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>

            {!translatedCues ? (
              <button
                type="button"
                onClick={handleTranslate}
                disabled={isTranslating || cues.length === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-linear-to-r from-violet-500 to-indigo-500 hover:brightness-110 text-white font-extrabold text-xs shadow-lg shadow-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Translating Subtitles...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Translate to {selectedLangObj.name}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApply}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-linear-to-r from-emerald-400 to-cyan-500 hover:brightness-110 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Apply Translation to Timeline</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

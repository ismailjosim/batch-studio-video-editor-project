"use client";

import { Check, ExternalLink, Key, Sparkles, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  checkServerGeminiKey,
  getStoredGeminiKey,
  setStoredGeminiKey,
} from "./nano-banana-api";

interface NanoBananaKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (key: string) => void;
}

export function NanoBananaKeyModal({
  isOpen,
  onClose,
  onKeySaved,
}: NanoBananaKeyModalProps) {
  const [keyInput, setKeyInput] = useState(() => getStoredGeminiKey());
  const [isSaved, setIsSaved] = useState(false);
  const [hasServerKey, setHasServerKey] = useState(false);

  useEffect(() => {
    checkServerGeminiKey().then((has) => setHasServerKey(has));
  }, []);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredGeminiKey(keyInput.trim());
    onKeySaved(keyInput.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setKeyInput("");
    setStoredGeminiKey("");
    onKeySaved("");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#12131d] p-6 shadow-2xl flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-heading">
                AI Provider & API Key Settings
              </h3>
              <p className="text-[11px] text-slate-400">
                FLUX.1 is free; Google Gemini key is optional
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Engine Status */}
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-300">
          <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
          <div className="flex flex-col">
            <span className="font-bold">FLUX.1 Schnell: Free & Active</span>
            <span className="text-[11px] text-slate-400">
              Unlimited generation is enabled with zero key or billing needed!
            </span>
          </div>
        </div>

        {hasServerKey && (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold">GEMINI_API_KEY Connected</span>
              <span className="text-[11px] text-slate-400">
                Loaded directly from .env.local for Gemini Pro models
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="gemini-key"
              className="text-xs font-semibold text-slate-300"
            >
              Google AI Studio API Key
            </label>
            <input
              id="gemini-key"
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Paste Gemini API key (AQ... or AIza...)"
              className="w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400">
              Supports all Gemini API keys (including keys starting with{" "}
              <strong className="text-amber-300">AQ...</strong> or{" "}
              <strong className="text-amber-300">AIza...</strong>). Saved
              securely in your browser's local storage.
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[11px] text-amber-400 hover:underline"
            >
              <span>Get a Gemini API Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="flex items-center gap-2">
              {keyInput && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 rounded-xl border border-white/10 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs transition-all cursor-pointer"
                  title="Remove Key"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all cursor-pointer shadow-md shadow-amber-500/20"
              >
                {isSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Key</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { Film, Loader2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { SignInForm } from "./auth/SignInForm";
import { SignUpForm } from "./auth/SignUpForm";

export function AuthGate() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setGoogleError("");
    try {
      await signIn.social({
        provider: "google",
        callbackURL: window.location.href,
      });
    } catch (err: unknown) {
      const error = err as Error;
      setGoogleError(error.message || "Google sign in failed");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[85vh] flex flex-col items-center justify-center p-4">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md flex flex-col gap-6">
        {/* Branding Banner */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center text-black shadow-xl shadow-emerald-500/25 border border-emerald-300/30">
            <Sparkles className="w-7 h-7 text-black" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-2xl font-black tracking-tight text-white font-heading">
              Batch Studio Video Editor
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              2K QHD
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            Please sign in or create an account to access the video generation
            studio, transition engine, and cloud project storage.
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 backdrop-blur-xl p-6 shadow-2xl flex flex-col gap-5">
          {/* Tabs: Sign In / Create Account */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-black/50 border border-white/10">
            <button
              type="button"
              onClick={() => setTab("signin")}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                tab === "signin"
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setTab("signup")}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                tab === "signup"
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Google Social Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-all cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            ) : (
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Google"
              >
                <title>Google</title>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {googleError && (
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 text-center">
              {googleError}
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">
              or continue with email
            </span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Form Tabs */}
          {tab === "signin" ? <SignInForm /> : <SignUpForm />}
        </div>

        {/* Studio Highlights Footer */}
        <div className="grid grid-cols-3 gap-3 px-2 text-center">
          <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-white/5 bg-white/2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-bold text-white">
              2K Hardware
            </span>
            <span className="text-[9px] text-slate-400">WebCodecs GPU</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-white/5 bg-white/2">
            <Film className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-bold text-white">
              10 Transitions
            </span>
            <span className="text-[9px] text-slate-400">Dynamic Motion</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-white/5 bg-white/2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-bold text-white">Cloud Sync</span>
            <span className="text-[9px] text-slate-400">Database History</span>
          </div>
        </div>
      </div>
    </div>
  );
}

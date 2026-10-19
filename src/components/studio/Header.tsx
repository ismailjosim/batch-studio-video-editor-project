"use client";

import { FolderGit2, Loader2, LogOut, User } from "lucide-react";
import { useState } from "react";
import { signIn, signOut, useSession } from "@/lib/auth-client";

interface HeaderProps {
  onOpenProjects: () => void;
}

export function Header({ onOpenProjects }: HeaderProps) {
  const { data: session, isPending } = useSession();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: window.location.href,
      });
    } catch (err: unknown) {
      console.error("Google sign in error:", err);
      setIsGoogleLoading(false);
    }
  };

  return (
    <header className="w-full flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-6 bg-[#0f1016]/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#090a10] border border-white/10 flex items-center justify-center p-1 shadow-lg shadow-cyan-500/20 shrink-0">
          <img
            src="/batch-studio-suit-logo.png"
            alt="Batch Studio Suite"
            className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(0,210,255,0.4)]"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight bg-linear-to-r from-white via-slate-200 to-[#00d2ff] bg-clip-text text-transparent">
              Batch Studio Suite
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              by JC Design
            </span>
          </div>
          <p className="text-xs text-slate-400">
            SRT Subtitles + Storyboard Images to Hardware-Accelerated MP4
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenProjects}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-500/30 text-xs font-semibold text-slate-200 transition-all cursor-pointer shadow-sm"
        >
          <FolderGit2 className="w-4 h-4 text-cyan-400" />
          <span>Cloud Projects</span>
        </button>

        {isPending ? (
          <div className="text-xs text-slate-500">Checking auth...</div>
        ) : session?.user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs font-medium text-cyan-300">
              <User className="w-3.5 h-3.5" />
              <span className="truncate max-w-30">
                {session.user.name || session.user.email}
              </span>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              title="Sign Out"
              className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition-all shadow-md shadow-white/10 cursor-pointer disabled:opacity-60"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-800" />
            ) : (
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Google"
              >
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
            <span>Sign In with Google</span>
          </button>
        )}
      </div>
    </header>
  );
}

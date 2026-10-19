"use client";

import { FolderGit2, LogIn, LogOut, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { signIn, signOut, useSession } from "@/lib/auth-client";

interface HeaderProps {
  onOpenProjects: () => void;
}

export function Header({ onOpenProjects }: HeaderProps) {
  const { data: session, isPending } = useSession();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    setErrorMsg("");
    try {
      await signIn.email(
        { email, password },
        {
          onError: (ctx) => {
            setErrorMsg(ctx.error.message || "Failed to sign in");
          },
          onSuccess: () => {
            setAuthModalOpen(false);
          },
        },
      );
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Sign in failed");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <header className="w-full flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-6 bg-[#0f1016]/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black font-extrabold shadow-lg shadow-emerald-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight bg-linear-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
              Batch Studio Video Editor
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              WebCodecs 2K
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
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-500/30 text-xs font-semibold text-slate-200 transition-all cursor-pointer shadow-sm"
        >
          <FolderGit2 className="w-4 h-4 text-emerald-400" />
          <span>Cloud Projects</span>
        </button>

        {isPending ? (
          <div className="text-xs text-slate-500">Checking auth...</div>
        ) : session?.user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-300">
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
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#12131b] p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">
                Sign In to Cloud Studio
              </h3>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-300">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSigningIn}
                className="mt-2 w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-extrabold text-black hover:bg-emerald-400 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                {isSigningIn ? "Signing In..." : "Sign In with Email"}
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

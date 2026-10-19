"use client";

import { AlertCircle, ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    setErrorMsg("");
    try {
      await signIn.email(
        { email, password },
        {
          onError: (ctx) => {
            setErrorMsg(
              ctx.error.message ||
                "Invalid email or password. Please try again.",
            );
          },
          onSuccess: () => {
            window.location.reload();
          },
        },
      );
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Failed to sign in");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="flex flex-col gap-3.5">
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="signin-email"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300"
        >
          <Mail className="w-3.5 h-3.5 text-emerald-400" />
          <span>Email Address</span>
        </label>
        <input
          id="signin-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-all shadow-inner"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="signin-password"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300"
        >
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Password</span>
        </label>
        <input
          id="signin-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-all shadow-inner"
        />
      </div>

      <button
        type="submit"
        disabled={isSigningIn}
        className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-extrabold text-black hover:bg-emerald-400 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
      >
        {isSigningIn ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-black" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <span>Sign In to Studio</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}

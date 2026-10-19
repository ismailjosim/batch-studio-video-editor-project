"use client";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { useState } from "react";
import { signUp } from "@/lib/auth-client";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long");
      return;
    }
    setIsSigningUp(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await signUp.email(
        {
          email,
          password,
          name,
          phone: phone || undefined,
        },
        {
          onError: (ctx) => {
            setErrorMsg(
              ctx.error.message ||
                "Failed to create account. Please try again.",
            );
          },
          onSuccess: () => {
            setSuccessMsg(
              "Account created successfully! Loading your studio...",
            );
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          },
        },
      );
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Sign up failed");
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="flex flex-col gap-3.5">
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="signup-name"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300"
        >
          <User className="w-3.5 h-3.5 text-emerald-400" />
          <span>Full Name</span>
        </label>
        <input
          id="signup-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Alex Creator"
          className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-all shadow-inner"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="signup-email"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300"
        >
          <Mail className="w-3.5 h-3.5 text-emerald-400" />
          <span>Email Address</span>
        </label>
        <input
          id="signup-email"
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
          htmlFor="signup-phone"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Phone Number (Optional)</span>
        </label>
        <input
          id="signup-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 (555) 000-0000"
          className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-all shadow-inner"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="signup-password"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300"
        >
          <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
          <span>Password (Min. 8 characters)</span>
        </label>
        <input
          id="signup-password"
          type="password"
          required
          minLength={8}
          maxLength={128}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-all shadow-inner"
        />
      </div>

      <button
        type="submit"
        disabled={isSigningUp}
        className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-extrabold text-black hover:bg-emerald-400 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
      >
        {isSigningUp ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-black" />
            <span>Creating account...</span>
          </>
        ) : (
          <>
            <span>Create Account & Enter Studio</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}

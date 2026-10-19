"use client";

import { Check, Film, Layers, Sparkles } from "lucide-react";

export type StudioStep = 1 | 2 | 3;

interface StepperProps {
  currentStep: StudioStep;
  onStepClick: (step: StudioStep) => void;
  canGoToStep2: boolean;
  canGoToStep3: boolean;
}

const STEPS = [
  {
    step: 1 as StudioStep,
    title: "Step 1: Media & Setup",
    subtitle: ".SRT, Audio, Images & Resolution",
    icon: Layers,
  },
  {
    step: 2 as StudioStep,
    title: "Step 2: Animation & SFX",
    subtitle: "Transitions & Sound Effects",
    icon: Sparkles,
  },
  {
    step: 3 as StudioStep,
    title: "Step 3: Generate Video",
    subtitle: "WebCodecs GPU Render & Export",
    icon: Film,
  },
];

export function Stepper({
  currentStep,
  onStepClick,
  canGoToStep2,
  canGoToStep3,
}: StepperProps) {
  const isStepAccessible = (step: StudioStep) => {
    if (step === 1) return true;
    if (step === 2) return canGoToStep2;
    if (step === 3) return canGoToStep3;
    return false;
  };

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#0f1118]/80 backdrop-blur-md p-3.5 shadow-xl">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {STEPS.map((s) => {
          const isActive = currentStep === s.step;
          const isCompleted = currentStep > s.step;
          const accessible = isStepAccessible(s.step);
          const Icon = s.icon;

          return (
            <button
              key={s.step}
              type="button"
              disabled={!accessible}
              onClick={() => onStepClick(s.step)}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all select-none text-left cursor-pointer ${
                isActive
                  ? "border border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                  : isCompleted
                    ? "border border-emerald-500/20 bg-white/2 hover:bg-white/5"
                    : accessible
                      ? "border border-white/5 bg-transparent hover:bg-white/2"
                      : "border border-transparent opacity-40 cursor-not-allowed"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                  isActive
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                    : isCompleted
                      ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                      : "bg-white/5 border border-white/10 text-slate-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className={`text-xs font-bold font-heading truncate ${
                    isActive
                      ? "text-white"
                      : isCompleted
                        ? "text-emerald-300"
                        : "text-slate-300"
                  }`}
                >
                  {s.title}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {s.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

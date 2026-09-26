"use client";

import { RotateCcw, Play } from "lucide-react";

interface ResumeSessionDialogProps {
  completedCount: number;
  total: number;
  onContinue: () => void;
  onStartOver: () => void;
}

export default function ResumeSessionDialog({
  completedCount,
  total,
  onContinue,
  onStartOver,
}: ResumeSessionDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-scale-in sm:p-8">
        <h2 className="text-xl font-bold text-slate-900">
          You have an unfinished recording session
        </h2>
        <p className="mt-3 text-slate-600">
          You have completed{" "}
          <span className="font-semibold text-brand-600">
            {completedCount} of {total}
          </span>{" "}
          questions. Would you like to continue where you left off?
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onStartOver}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            Start Over
          </button>
          <button
            onClick={onContinue}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
          >
            <Play className="h-4 w-4" />
            Continue Session
          </button>
        </div>
      </div>
    </div>
  );
}

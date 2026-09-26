"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mic, Info, ChevronLeft } from "lucide-react";
import { checkBrowserSupport } from "@/lib/audio";
import {
  getCompletedQuestionIds,
  clearAllRecordings,
  getRecording,
  type RecordingRecord,
} from "@/lib/indexeddb";
import ResumeSessionDialog from "@/components/ResumeSessionDialog";
import ProgressBar from "@/components/ProgressBar";
import VoiceRecorder from "@/components/VoiceRecorder";
import { questions, TOTAL_QUESTIONS } from "@/data/data";

export default function CollectPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [ready, setReady] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [existingRec, setExistingRec] = useState<RecordingRecord | null>(null);
  const [compatError, setCompatError] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    const support = checkBrowserSupport();
    if (!support.ok) {
      setCompatError(
        `Your browser is missing required features: ${support.missing.join(", ")}. Please use a modern browser like Chrome, Firefox, Edge, or Safari.`,
      );
      setReady(true);
      return;
    }

    (async () => {
      const ids = await getCompletedQuestionIds();
      setCompletedIds(ids);
      if (ids.length > 0 && ids.length < TOTAL_QUESTIONS) {
        setShowResume(true);
      } else if (ids.length >= TOTAL_QUESTIONS) {
        router.replace("/complete");
        return;
      } else {
        setCurrentIndex(0);
      }
      setReady(true);
    })();
  }, [router]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  useEffect(() => {
    if (!ready || showResume || !currentQuestion) return;
    (async () => {
      const rec = await getRecording(currentQuestion.id);
      setExistingRec(rec ?? null);
    })();
  }, [currentIndex, ready, showResume, currentQuestion]);

  const handleContinueSession = () => {
    let next = 0;
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      if (!completedIds.includes(questions[i].id)) {
        next = i;
        break;
      }
    }
    setCurrentIndex(next);
    setShowResume(false);
  };

  const handleStartOver = async () => {
    await clearAllRecordings();
    setCompletedIds([]);
    setCurrentIndex(0);
    setExistingRec(null);
    setShowResume(false);
  };

  const handleContinue = useCallback(() => {
    const nextCompleted = [...new Set([...completedIds, currentQuestion.id])];
    setCompletedIds(nextCompleted);

    if (currentIndex >= TOTAL_QUESTIONS - 1) {
      router.push("/complete");
      return;
    }
    setCurrentIndex((i) => i + 1);
    setExistingRec(null);
  }, [completedIds, currentIndex, currentQuestion, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-900 border-t-cyan-400" />
      </div>
    );
  }

  if (compatError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="max-w-md rounded-2xl border border-amber-500/30 bg-amber-950/40 p-6 text-center backdrop-blur-sm">
          <p className="text-amber-200">{compatError}</p>
          <Link
            href="/"
            className="mt-4 inline-block text-cyan-400 hover:text-cyan-300 transition"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-950 to-cyan-950/30">
      {showResume && (
        <ResumeSessionDialog
          completedCount={completedIds.length}
          total={TOTAL_QUESTIONS}
          onContinue={handleContinueSession}
          onStartOver={handleStartOver}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-cyan-500/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-cyan-300"
          >
            <ChevronLeft className="h-4 w-4" />
            Home
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-cyan-500 to-cyan-700 text-white shadow-md shadow-cyan-500/20">
              <Mic className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold text-white">
              VoiceCollect
            </span>
          </div>

          <div className="w-14" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Progress */}
        <div className="mb-8">
          <ProgressBar current={currentIndex} total={TOTAL_QUESTIONS} />
        </div>

        {/* Question Card */}
        <div className="mb-6 rounded-2xl border border-cyan-500/15 bg-slate-900/60 p-6 shadow-xl shadow-cyan-950/20 backdrop-blur-sm sm:p-8 animate-slide-up">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white">
            Question {currentQuestion.id}
            {completedIds.includes(currentQuestion.id) && (
              <span className="ml-2 inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                ✓ Completed
              </span>
            )}
          </p>
          <h1 className="text-xl font-semibold leading-relaxed text-white sm:text-2xl">
            {currentQuestion.text}
          </h1>
        </div>

        {/* Recorder Card */}
        <div className="rounded-2xl border border-cyan-500/15 bg-slate-900/60 p-2 shadow-xl shadow-cyan-950/20 backdrop-blur-sm sm:p-6">
          <VoiceRecorder
            key={currentQuestion.id}
            questionId={currentQuestion.id}
            questionText={currentQuestion.text}
            onContinue={handleContinue}
            existingRecording={existingRec}
          />
        </div>

        {/* Info Tip */}
        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-cyan-500/10 bg-slate-900/40 px-4 py-3 text-xs text-slate-400">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-500/70" />
          <p>
            Your recordings are stored locally in this browser until you
            download your dataset. Do not clear your browser data before
            downloading.
          </p>
        </div>
      </main>
    </div>
  );
}

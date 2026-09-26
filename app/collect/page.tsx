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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (compatError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="text-amber-900">{compatError}</p>
          <Link
            href="/"
            className="mt-4 inline-block text-brand-600 hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {showResume && (
        <ResumeSessionDialog
          completedCount={completedIds.length}
          total={TOTAL_QUESTIONS}
          onContinue={handleContinueSession}
          onStartOver={handleStartOver}
        />
      )}

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
            Home
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Mic className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold text-slate-800">
              VoiceCollect
            </span>
          </div>
          <div className="w-14" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <ProgressBar current={currentIndex + 1} total={TOTAL_QUESTIONS} />
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 animate-slide-up">
          <p className="mb-2 text-xs font-medium  uppercase tracking-wider text-black text-brand-600">
            Question {currentQuestion.id}
            {completedIds.includes(currentQuestion.id) && (
              <span className="ml-2 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                ✓ Completed
              </span>
            )}
          </p>
          <h1 className="text-xl font-semibold leading-relaxed text-slate-900 sm:text-2xl">
            {currentQuestion.text}
          </h1>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <VoiceRecorder
            key={currentQuestion.id}
            questionId={currentQuestion.id}
            questionText={currentQuestion.text}
            onContinue={handleContinue}
            existingRecording={existingRec}
          />
        </div>

        <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-slate-100/80 px-4 py-3 text-xs text-slate-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
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

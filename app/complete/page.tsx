"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Download,
  RotateCcw,
  Loader2,
  PartyPopper,
  User,
} from "lucide-react";
import {
  getAllRecordings,
  clearAllRecordings,
  getRecordingCount,
} from "@/lib/indexeddb";
import { generateDatasetZip, downloadBlob } from "@/lib/zip";
import { TOTAL_QUESTIONS } from "@/data/data";
import { toast } from "sonner";

export default function CompletePage() {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [zipState, setZipState] = useState<
    "idle" | "generating" | "ready" | "done"
  >("idle");
  const [showConfirm, setShowConfirm] = useState(false);
  const [speakerName, setSpeakerName] = useState("");

  useEffect(() => {
    (async () => {
      const c = await getRecordingCount();
      setCount(c);
      setLoading(false);
      if (c < TOTAL_QUESTIONS) {
        router.replace("/collect");
      }
    })();
  }, [router]);

  const getCleanPrefix = () => {
    const cleaned = speakerName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    return cleaned || "speaker";
  };

  const handleDownload = async () => {
    if (!speakerName.trim()) {
      toast.error("Enter your name before downloading.");
      return;
    }

    setZipState("generating");
    try {
      const recordings = await getAllRecordings();
      const prefix = getCleanPrefix();
      const blob = await generateDatasetZip(recordings, prefix);
      downloadBlob(blob, `${prefix}-voice-dataset.zip`);
      setZipState("done");
    } catch (err) {
      console.error(err);
      setZipState("idle");
      toast.error("Failed to generate ZIP. Please try again.");
    }
  };

  const handleStartNew = async () => {
    await clearAllRecordings();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-900 border-t-cyan-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-cyan-950/40 px-4 py-16">
      <div className="w-full max-w-lg text-center animate-slide-up">
        {/* Success Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30">
          <CheckCircle2
            className="h-10 w-10 text-emerald-400"
            strokeWidth={2}
          />
        </div>

        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          You&apos;re All Done!{" "}
          <span className="inline-block" aria-hidden>
            🎉
          </span>
        </h1>

        <p className="mt-4 text-sm md:text-lg text-slate-300">
          {/* You successfully completed all {TOTAL_QUESTIONS} voice recordings. */}
          Thank you for participating in AlphaQuest! Your contribution is
          greatly appreciated and will help us improve AI-powered learning for
          children. <br />
        </p>

        {/* Stats Card */}
        <div className="mt-8 rounded-2xl border border-cyan-500/15 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-cyan-400">
            <PartyPopper className="h-6 w-6" />
            {count} / {TOTAL_QUESTIONS}
          </div>
          <p className="mt-1 text-sm text-slate-400">recordings completed</p>
        </div>

        {/* Name Input */}
        <div className="mt-6 text-left">
          <label
            htmlFor="speaker-name"
            className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300"
          >
            <User className="h-4 w-4 text-cyan-400" />
            Your Name
          </label>
          <input
            id="speaker-name"
            type="text"
            value={speakerName}
            onChange={(e) => setSpeakerName(e.target.value)}
            placeholder="e.g. Alamin"
            className="w-full rounded-xl border border-cyan-500/20 bg-slate-900/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
            maxLength={40}
          />
          <p className="mt-1.5 text-xs text-slate-500">
            Files will be named like{" "}
            <span className="font-mono text-cyan-400/80">
              {getCleanPrefix()}_001.webm
            </span>
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          {zipState === "generating" && (
            <div className="flex items-center justify-center gap-3 rounded-xl bg-cyan-500/10 px-6 py-4 text-cyan-300 border border-cyan-500/20">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-medium">Preparing your dataset…</span>
            </div>
          )}

          {zipState === "done" && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 text-sm font-medium text-emerald-400">
              Download complete! Check your downloads folder.
            </div>
          )}

          <button
            onClick={handleDownload}
            disabled={zipState === "generating"}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {zipState === "generating" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Download ZIP
              </>
            )}
          </button>

          {(zipState === "done" || zipState === "idle") && (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-900/50 px-6 py-3 text-base font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
              Start New Session
            </button>
          )}
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Your recordings remain in this browser until you start a new session.
        </p>

        <Link
          href="/"
          className="mt-4 inline-block text-sm text-cyan-400 hover:text-cyan-300 transition"
        >
          ← Back to home
        </Link>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl animate-scale-in">
            <h3 className="text-lg font-bold text-white">Are you sure?</h3>
            <p className="mt-2 text-sm text-slate-400">
              This will delete your current {count} recordings from this
              browser.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleStartNew}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Start New Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

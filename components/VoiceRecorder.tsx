"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square, RotateCcw, ArrowRight, AlertCircle } from "lucide-react";
import {
  getSupportedMimeType,
  formatDuration,
  getExtensionFromMime,
} from "@/lib/audio";
import {
  saveRecording,
  getRecording,
  type RecordingRecord,
} from "@/lib/indexeddb";
import AudioPreview from "./AudioPreview";

interface VoiceRecorderProps {
  questionId: number;
  questionText: string;
  onContinue: () => void;
  existingRecording?: RecordingRecord | null;
}

type RecState = "idle" | "recording" | "preview" | "error";

export default function VoiceRecorder({
  questionId,
  questionText,
  onContinue,
  existingRecording,
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecState>(
    existingRecording ? "preview" : "idle",
  );
  const [duration, setDuration] = useState(existingRecording?.duration ?? 0);
  const [blob, setBlob] = useState<Blob | null>(
    existingRecording?.blob ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rec = existingRecording ?? (await getRecording(questionId));
      if (cancelled) return;
      if (rec) {
        setBlob(rec.blob);
        setDuration(rec.duration);
        setState("preview");
      } else {
        setBlob(null);
        setDuration(0);
        setState("idle");
      }
      setError(null);
    })();
    return () => {
      cancelled = true;
    };
  }, [questionId, existingRecording]);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunksRef.current, { type: mimeType });
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setBlob(finalBlob);
        setDuration(elapsed);
        setState("preview");
        cleanup();
      };

      recorder.start(100);
      startTimeRef.current = Date.now();
      setDuration(0);
      setState("recording");

      timerRef.current = setInterval(() => {
        setDuration((Date.now() - startTimeRef.current) / 1000);
      }, 200);
    } catch (err) {
      cleanup();
      const msg =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone access is required to record your answer. Please allow microphone access in your browser settings and try again."
          : "We couldn't access your microphone. Please check your browser's microphone permission and try again.";
      setError(msg);
      setState("error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const reRecord = () => {
    setBlob(null);
    setDuration(0);
    setState("idle");
    setError(null);
  };

  const handleContinue = async () => {
    if (!blob) return;
    setSaving(true);
    try {
      const mimeType = blob.type || getSupportedMimeType();
      const ext = getExtensionFromMime(mimeType);
      const filename = `${questionId.toString().padStart(3, "0")}.${ext}`;
      const record: RecordingRecord = {
        questionId,
        questionText,
        blob,
        mimeType,
        duration,
        createdAt: new Date().toISOString(),
        filename,
      };
      await saveRecording(record);
      onContinue();
    } catch {
      setError("Failed to save recording. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-300"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {state === "idle" && (
        <div className="flex flex-col items-center py-6">
          <button
            onClick={startRecording}
            className="group flex h-24 w-24 items-center justify-center rounded-full bg-cyan-600 text-white shadow-xl shadow-cyan-500/30 transition hover:bg-cyan-500 hover:scale-105 active:scale-95"
            aria-label="Start recording"
          >
            <Mic
              className="h-10 w-10 transition group-hover:scale-110"
              strokeWidth={2}
            />
          </button>
          <p className="mt-5 text-base font-medium text-white">
            Start Recording
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Tap the microphone to begin
          </p>
        </div>
      )}

      {state === "recording" && (
        <div className="flex flex-col items-center py-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-400/40 recording-ring" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-red-500 text-white shadow-xl shadow-red-500/30">
              <div className="h-5 w-5 rounded-sm bg-white" />
            </div>
          </div>
          <div className="mt-6 flex items-end gap-1 h-8">
            {[0.4, 0.7, 1, 0.55, 0.85, 0.45, 0.9, 0.6, 0.75].map((h, i) => (
              <div
                key={i}
                className="wave-bar w-1.5 rounded-full bg-red-400"
                style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          <p className="mt-4 text-sm font-medium text-red-400 animate-pulse">
            ● Recording
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
            {formatDuration(duration)}
          </p>
          <button
            onClick={stopRecording}
            className="mt-6 flex items-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-white active:scale-[0.98]"
          >
            <Square className="h-4 w-4 fill-current" />
            Stop Recording
          </button>
        </div>
      )}

      {state === "preview" && blob && (
        <div className="space-y-5 py-4 animate-fade-in">
          <AudioPreview blob={blob} duration={duration} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={reRecord}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-900/50 px-5 py-3 text-base font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white active:scale-[0.98]"
            >
              <RotateCcw className="h-4 w-4" />
              Record Again
            </button>
            <button
              onClick={handleContinue}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-500 active:scale-[0.98] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Continue"}
              {!saving && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="flex flex-col items-center py-6">
          <button
            onClick={startRecording}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-cyan-500"
          >
            <Mic className="h-5 w-5" />
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

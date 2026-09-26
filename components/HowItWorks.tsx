"use client";

import { BookOpen, Mic, Download } from "lucide-react";

const steps = [
  {
    icon: BookOpen,
    title: "Read",
    description: "Read the question displayed on the screen carefully.",
  },
  {
    icon: Mic,
    title: "Record",
    description: "Record your natural voice using your microphone.",
  },
  {
    icon: Download,
    title: "Download",
    description:
      "Complete all 138 questions and download your recordings as one ZIP file.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
          How It Works
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
          Three simple steps to contribute your voice data.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-200 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-100">
                <step.icon className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

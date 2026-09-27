"use client";

import Link from "next/link";
import { Mic, Waves } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-65px)] items-center justify-center overflow-hidden bg-linear-to-br from-slate-950 via-cyan-950/80 to-black  ">
      {/* Soft cyan glow overlays */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-125 w-200 -translate-x-1/2 rounded-full bg-cyan-500/15 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl animate-pulse [animation-delay:1.5s]" />
        <div className="absolute top-1/3 left-0 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl animate-pulse [animation-delay:0.8s]" />
      </div>

      <div className="mx-auto max-w-4xl  px-4 text-center sm:px-6">
        {/* Mic icon with animated wave bars */}
        <div className="mb-10 flex justify-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-cyan-500 to-cyan-700 shadow-xl shadow-cyan-500/30 sm:h-24 sm:w-24 transition-transform duration-300 hover:scale-105">
              <Mic
                className="h-8 w-8 text-white sm:h-12 sm:w-12"
                strokeWidth={1.8}
              />
            </div>

            {/* Right wave bars */}
            <div className="absolute -right-14 top-1/2 flex -translate-y-1/2 items-end gap-1 opacity-70 sm:-right-16">
              {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8].map((h, i) => (
                <div
                  key={`r-${i}`}
                  className="w-1.5 rounded-full bg-cyan-400 animate-pulse"
                  style={{
                    height: `${h * 28}px`,
                    animationDelay: `${i * 0.12}s`,
                    animationDuration: "1.2s",
                  }}
                />
              ))}
            </div>

            {/* Left wave bars */}
            <div className="absolute -left-14 top-1/2 flex -translate-y-1/2 items-end gap-1 opacity-70 sm:-left-16">
              {[0.5, 0.9, 0.6, 1, 0.7, 0.4, 0.8].map((h, i) => (
                <div
                  key={`l-${i}`}
                  className="w-1.5 rounded-full bg-cyan-400 animate-pulse"
                  style={{
                    height: `${h * 28}px`,
                    animationDelay: `${i * 0.12}s`,
                    animationDuration: "1.2s",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <h1 className="text-xl font-bold tracking-tight text-white sm:text-5xl ">
          Help Us Build{" "}
          <span className="bg-linear-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">
            AlphaQuest Voice AI
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-xs leading-relaxed text-slate-300 sm:mt-6 sm:text-base md:text-lg ">
          AlphaQuest is an academic research project developing an interactive
          learning system for children using voice and AI technologies. As part
          of the research, we are collecting short voice recordings to build and
          evaluate a voice dataset and improve the system’s performance and
          usability for academic purposes.
        </p>
        {/* <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:mt-6 sm:text-base md:text-lg lg:text-xl">
          Your voice can help train and improve the next generation of voice
          technology. Record your answers to 138 simple questions and download
          your complete voice dataset when you&apos;re finished.
        </p> */}

        <div className="mt-4 hidden md:flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm text-slate-400">
          <Waves className="h-4 w-4 shrink-0" />
          <span>
            138 questions · One recording at a time · Download everything as a
            ZIP
          </span>
        </div>

        {/* CTA Button */}
        <div className="mt-8 sm:mt-10">
          <Link
            href="/collect"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-600 px-3 md:px-5 lg:px-8  py-1.5 md:py-2.5 lg:py-3.5 text-sm md:teba font-semibold text-white shadow-lg shadow-cyan-500/30 border border-cyan-500/50 transition-all duration-300 hover:bg-white hover:text-cyan-900 hover:border-white hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <Mic className="h-5 w-5" />
            RECORD NOW
          </Link>
        </div>
      </div>
    </section>
  );
}

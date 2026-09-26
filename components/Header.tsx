"use client";

import Link from "next/link";
import { Mic } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/10 bg-cyan-50 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-cyan-500/40">
            <Mic className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <span className="text-lg font-semibold tracking-tight transition-colors text-cyan-600">
            VoiceCollect
          </span>
        </Link>

        {/* CTA */}
        <Link
          href="/collect"
          className="inline-flex items-center gap-1.5 rounded-full bg-cyan-600/90 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 transition-all duration-300 hover:bg-cyan-500 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95"
        >
          <Mic className="h-4 w-4" />
          Record
        </Link>
      </div>
    </header>
  );
}

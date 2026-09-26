import Header from "@/components/Header";
import Hero from "@/components/Hero";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
      </main>
      <a
        href="https://github.com/" // optional – remove if not needed
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-50 hidden sm:flex items-center gap-2 rounded-full border border-cyan-500/20 bg-slate-900/80 px-4 py-2 text-xs text-slate-400 shadow-lg backdrop-blur-md transition hover:border-cyan-500/40 hover:text-cyan-300 hover:scale-105"
      >
        <span className="opacity-70">Made by</span>
        <span className="font-medium text-cyan-400">Md. Al-amin Sujon</span>
      </a>
    </div>
  );
}

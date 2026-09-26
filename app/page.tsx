import Header from "@/components/Header";
import Hero from "@/components/Hero";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="h-full">
        <Hero />
      </main>
    </div>
  );
}

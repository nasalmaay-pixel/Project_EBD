import { AwarenessSection } from "@/components/awareness-section";
import { SiteNav } from "@/components/site-nav";

export default function AwarenessPage() {
  return (
    <main className="min-h-screen px-4 pb-20 pt-32">
      <SiteNav />
      <section className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#9b5b24]">Awareness</p>
        <h1 className="mt-4 max-w-4xl font-display text-6xl font-bold leading-none text-balance">
          Learn the small habits behind better candle use.
        </h1>
        <p className="mt-6 max-w-2xl leading-7 text-stone-600">
          This is a dummy education feed for candle care, container reuse, and circular product awareness.
        </p>
        <div className="mt-10">
          <AwarenessSection />
        </div>
      </section>
    </main>
  );
}

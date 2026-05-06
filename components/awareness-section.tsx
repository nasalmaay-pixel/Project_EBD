import { BookOpen, CalendarDays } from "lucide-react";
import { awarenessArticles } from "@/lib/data";

export function AwarenessSection() {
  return (
    <section className="rounded-lg border border-white/70 bg-white/70 p-6 shadow-lg shadow-stone-900/5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#9b5b24]">Education awareness</p>
          <h2 className="mt-3 font-display text-4xl font-bold">Candle care and circular living.</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-stone-600">
          Artikel singkat tentang perawatan lilin, reuse container, dan dampak limbah jelantah pada lingkungan.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {awarenessArticles.map((article) => (
          <article key={article.title} className="overflow-hidden rounded-lg bg-stone-50/85">
            <img src={article.imageUrl} alt={article.imageAlt} className="aspect-[16/10] w-full object-cover" />
            <div className="p-4">
              <div className="flex items-center justify-between gap-3 text-xs font-semibold text-stone-500">
                <span className="inline-flex items-center gap-1">
                  <BookOpen size={14} />
                  {article.category}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays size={14} />
                  {article.date}
                </span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold">{article.title}</h3>
              <p className="mt-3 text-sm leading-6 text-stone-600">{article.summary}</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[#9b5b24]">
                {article.source}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

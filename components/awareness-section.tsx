"use client";

import { useEffect, useState } from "react";
import { BookOpen, CalendarDays, ExternalLink } from "lucide-react";

const fallbackImageUrl =
  "https://images.unsplash.com/photo-1771149437810-56fec4035757?auto=format&fit=crop&w=900&q=82";

type NewsApiArticle = {
  title?: string;
  description?: string | null;
  url?: string;
  urlToImage?: string | null;
  source?: {
    name?: string;
  };
  publishedAt?: string;
};

type AwarenessArticle = {
  title: string;
  source: string;
  date: string;
  category: string;
  imageUrl: string;
  imageAlt: string;
  summary: string;
  url: string;
};

function formatArticleDate(value?: string) {
  if (!value) {
    return "News";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "News";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function toAwarenessArticle(article: NewsApiArticle): AwarenessArticle | null {
  const title = article.title?.trim();

  if (!title || title === "[Removed]") {
    return null;
  }

  return {
    title,
    source: article.source?.name?.trim() || "NewsAPI",
    date: formatArticleDate(article.publishedAt),
    category: "Limbah jelantah",
    imageUrl: article.urlToImage?.trim() || fallbackImageUrl,
    imageAlt: title,
    summary:
      article.description?.trim() ||
      "Update terbaru seputar pencemaran limbah jelantah, pengelolaan minyak bekas, dan peluang daur ulang.",
    url: article.url || "/awareness",
  };
}

export function AwarenessSection() {
  const [articles, setArticles] = useState<AwarenessArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadNews() {
      try {
        const params = new URLSearchParams({
          q: '("waste cooking oil" OR "used cooking oil" OR jelantah) AND (pollution OR recycling OR environment OR wastewater OR biodiesel)',
          pageSize: "6",
        });
        const response = await fetch(`/api/news?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to load awareness news");
        }

        const data = (await response.json()) as { articles?: NewsApiArticle[] };
        const nextArticles = (data.articles ?? [])
          .map(toAwarenessArticle)
          .filter((article): article is AwarenessArticle => Boolean(article))
          .slice(0, 3);

        if (isMounted) {
          setArticles(nextArticles);
        }
      } catch {
        if (isMounted) {
          setArticles([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadNews();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="rounded-lg border border-white/70 bg-white/70 p-6 shadow-lg shadow-stone-900/5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#9b5b24]">Education awareness</p>
          <h2 className="mt-3 font-display text-4xl font-bold">Limbah jelantah dan daur ulang.</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-stone-600">
          Artikel singkat tentang pencemaran limbah jelantah, dampaknya pada air, dan cara minyak bekas masuk kembali ke ekonomi circular.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <article key={index} className="overflow-hidden rounded-lg bg-stone-50/85">
              <div className="aspect-[16/10] animate-pulse bg-stone-200" />
              <div className="space-y-4 p-4">
                <div className="h-3 w-2/3 animate-pulse rounded bg-stone-200" />
                <div className="h-7 w-full animate-pulse rounded bg-stone-200" />
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-stone-200" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-stone-200" />
                </div>
              </div>
            </article>
          ))
        ) : articles.length > 0 ? (
          articles.map((article) => (
            <a
              key={`${article.title}-${article.source}`}
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="group overflow-hidden rounded-lg bg-stone-50/85 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-stone-900/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d78b37]"
            >
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
                <h3 className="mt-4 font-display text-2xl font-bold transition group-hover:text-[#9b5b24]">{article.title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{article.summary}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#9b5b24] transition group-hover:text-stone-950">
                  {article.source}
                  <ExternalLink size={13} />
                </span>
              </div>
            </a>
          ))
        ) : (
          <article className="rounded-lg bg-stone-50/85 p-6 md:col-span-3">
            <p className="text-sm font-semibold text-stone-700">
              Belum ada artikel terbaru dari NewsAPI untuk topik awareness saat ini.
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Coba refresh lagi nanti saat NewsAPI sudah mengembalikan berita yang relevan.
            </p>
          </article>
        )}
      </div>
    </section>
  );
}

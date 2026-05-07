import { NextResponse } from "next/server";

const fallbackImageUrl =
  "https://images.unsplash.com/photo-1771149437810-56fec4035757?auto=format&fit=crop&w=900&q=82";

const fallbackArticles = [
  {
    title: "Dampak minyak jelantah setelah memasak",
    description: "Minyak yang dipakai berulang dapat berubah kualitasnya, meninggalkan residu, dan perlu disimpan dengan benar sebelum didaur ulang.",
    url: "/awareness",
    urlToImage: fallbackImageUrl,
    source: { name: "CandleX Jelantah Awareness" },
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Minyak jelantah sebagai awal produk aromatherapy candles",
    description: "Jelantah yang terkumpul dapat masuk ke rantai daur ulang dan mendukung pembuatan produk circular seperti aromatherapy candles.",
    url: "/sell-oil",
    urlToImage: fallbackImageUrl,
    source: { name: "CandleX Aromatherapy Candles" },
    publishedAt: new Date().toISOString(),
  },
];

export async function GET(request: Request) {
  const apiKey = process.env.NEWSAPI_KEY;
  const { searchParams } = new URL(request.url);
  const query =
    searchParams.get("q") ??
    '("used cooking oil" OR "waste cooking oil" OR jelantah) AND ("after cooking" OR disposal OR reuse OR recycling OR "scented candles" OR "aromatherapy candles")';
  const pageSize = searchParams.get("pageSize") ?? "6";

  if (!apiKey) {
    return NextResponse.json({
      status: "demo",
      articles: fallbackArticles,
      message: "Add NEWSAPI_KEY to enable live NewsAPI results.",
    });
  }

  const url = new URL("https://newsapi.org/v2/everything");
  url.searchParams.set("q", query);
  url.searchParams.set("language", searchParams.get("language") ?? "en");
  url.searchParams.set("sortBy", searchParams.get("sortBy") ?? "publishedAt");
  url.searchParams.set("pageSize", pageSize);

  const response = await fetch(url, {
    headers: { "X-Api-Key": apiKey },
    next: { revalidate: 1800 },
  }).catch(() => null);

  if (!response?.ok) {
    return NextResponse.json({
      status: "demo",
      articles: fallbackArticles,
      message: "NewsAPI is unavailable. Showing fallback articles.",
    });
  }

  const result = await response.json() as {
    status: string;
    articles?: unknown[];
    totalResults?: number;
  };

  return NextResponse.json({
    status: result.status,
    totalResults: result.totalResults ?? 0,
    articles: result.articles ?? [],
  });
}

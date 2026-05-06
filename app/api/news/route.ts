import { NextResponse } from "next/server";

const fallbackArticles = [
  {
    title: "Cara menyimpan minyak jelantah sebelum pickup",
    description: "Gunakan wadah tertutup, pisahkan dari air, dan beri label tanggal agar kualitas tetap mudah dicek.",
    url: "/awareness",
    urlToImage: "",
    source: { name: "CandleX Awareness" },
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Promo circular product minggu ini",
    description: "Produk dengan label promo akan muncul otomatis di marketplace dan reminder topbar.",
    url: "/marketplace",
    urlToImage: "",
    source: { name: "CandleX Marketplace" },
    publishedAt: new Date().toISOString(),
  },
];

export async function GET(request: Request) {
  const apiKey = process.env.NEWSAPI_KEY;
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? '"used cooking oil" OR jelantah OR candle sustainability';
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

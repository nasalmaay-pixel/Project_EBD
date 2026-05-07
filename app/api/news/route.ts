import { NextResponse } from "next/server";

const fallbackImageUrl =
  "https://images.unsplash.com/photo-1771149437810-56fec4035757?auto=format&fit=crop&w=900&q=82";

const fallbackArticles = [
  {
    title: "Dampak minyak jelantah pada saluran air dan lingkungan",
    description: "Minyak jelantah yang dibuang ke wastafel dapat menyumbat pipa, mencemari air, dan mengganggu ekosistem mikro.",
    url: "/awareness",
    urlToImage: fallbackImageUrl,
    source: { name: "CandleX Edukasi Lingkungan" },
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Daur ulang minyak jelantah menjadi bahan bernilai",
    description: "Pengumpulan minyak jelantah membantu mengubah limbah dapur menjadi bahan daur ulang untuk produk circular.",
    url: "/sell-oil",
    urlToImage: fallbackImageUrl,
    source: { name: "CandleX Jelantah Pay" },
    publishedAt: new Date().toISOString(),
  },
];

export async function GET(request: Request) {
  const apiKey = process.env.NEWSAPI_KEY;
  const { searchParams } = new URL(request.url);
  const query =
    searchParams.get("q") ??
    '("waste cooking oil" OR "used cooking oil" OR jelantah) AND (pollution OR recycling OR environment OR wastewater OR biodiesel)';
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

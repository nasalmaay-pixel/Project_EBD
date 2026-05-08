import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

const vehicleKeywords = [
  "automotive",
  "biodiesel",
  "car",
  "cars",
  "diesel",
  "engine",
  "ev",
  "fuel",
  "motorcycle",
  "truck",
  "vehicle",
  "vehicles",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isNonVehicleArticle(article: unknown) {
  if (!isRecord(article)) {
    return false;
  }

  const source = isRecord(article.source) ? article.source.name : "";
  const searchable = [
    article.title,
    article.description,
    article.content,
    article.url,
    source,
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();

  return !vehicleKeywords.some((keyword) => searchable.includes(keyword));
}

function newsResponse(body: unknown) {
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Surrogate-Control": "no-store",
    },
  });
}

async function fetchNewsArticles(apiKey: string, query: string, requestParams: URLSearchParams, pageSize: number) {
  const url = new URL("https://newsapi.org/v2/everything");
  url.searchParams.set("q", query);
  url.searchParams.set("language", requestParams.get("language") ?? "en");
  url.searchParams.set("sortBy", requestParams.get("sortBy") ?? "publishedAt");
  url.searchParams.set("pageSize", String(Math.min(Math.max(pageSize * 3, 12), 100)));

  const response = await fetch(url, {
    headers: { "X-Api-Key": apiKey },
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) {
    return null;
  }

  return response.json() as Promise<{
    status: string;
    articles?: unknown[];
    totalResults?: number;
  }>;
}

export async function GET(request: Request) {
  const apiKey = process.env.NEWSAPI_KEY;
  const { searchParams } = new URL(request.url);
  const query =
    searchParams.get("q") ??
    '("used cooking oil" OR "waste cooking oil" OR jelantah) AND ("after cooking" OR "scented candles" OR "aromatherapy candles" OR "cooking oil disposal" OR "cooking oil reuse") -vehicle -vehicles -car -cars -automotive -engine -diesel -biodiesel -fuel -motorcycle -truck';
  const pageSize = Number(searchParams.get("pageSize") ?? "6");

  if (!apiKey) {
    return newsResponse({
      status: "demo",
      articles: fallbackArticles,
      message: "Add NEWSAPI_KEY to enable live NewsAPI results.",
    });
  }

  const queryCandidates = Array.from(
    new Set([
      query,
      '"used cooking oil"',
      '"waste cooking oil"',
      "cooking oil reuse",
      "cooking oil disposal",
      '"scented candles" OR "aromatherapy candles"',
    ]),
  );

  let status = "ok";
  let totalResults = 0;
  const articles: unknown[] = [];
  const seenUrls = new Set<string>();

  for (const nextQuery of queryCandidates) {
    const result = await fetchNewsArticles(apiKey, nextQuery, searchParams, pageSize);

    if (!result) {
      continue;
    }

    status = result.status;
    totalResults += result.totalResults ?? 0;

    for (const article of result.articles ?? []) {
      if (!isNonVehicleArticle(article)) {
        continue;
      }

      const url = isRecord(article) && typeof article.url === "string" ? article.url : "";
      const key = url || JSON.stringify(article);

      if (seenUrls.has(key)) {
        continue;
      }

      seenUrls.add(key);
      articles.push(article);
    }

    if (articles.length >= pageSize) {
      break;
    }
  }

  if (articles.length === 0) {
    return newsResponse({
      status: "demo",
      totalResults,
      articles: fallbackArticles,
      message: "NewsAPI returned no matching articles. Showing fallback articles.",
    });
  }

  return newsResponse({
    status,
    totalResults,
    articles: articles.slice(0, pageSize),
  });
}

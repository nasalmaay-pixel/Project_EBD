import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/api";

const estimateSchema = z.object({
  image: z.string().min(100),
  mimeType: z.string().min(3).default("image/jpeg"),
});

function parseJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);

  if (!match) {
    return null;
  }

  try {
    return JSON.parse(match[0]) as {
      liters?: number;
      confidence?: number;
      note?: string;
    };
  } catch {
    return null;
  }
}

function demoEstimate(image: string) {
  const seed = image.length;
  const liters = Number((4 + (seed % 180) / 10).toFixed(1));

  return {
    liters,
    confidence: 62,
    note: "Demo estimate. Add GEMINI_API_KEY to enable Gemini image analysis.",
    source: "demo",
  };
}

export async function POST(request: Request) {
  const parsed = estimateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return jsonError("Invalid image payload", 422);
  }

  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const image = parsed.data.image.replace(/^data:[^;]+;base64,/, "");

  if (!apiKey) {
    return NextResponse.json(demoEstimate(image));
  }

  const ai = new GoogleGenAI({ apiKey });
  let response: Awaited<ReturnType<typeof ai.models.generateContent>>;

  try {
    response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            {
              text:
                "You estimate used cooking oil volume from a photo. Return only JSON with liters as a number, confidence as 0-100, and note as one short Indonesian sentence. If the photo is unclear, still provide the best numeric estimate.",
            },
            {
              inlineData: {
                mimeType: parsed.data.mimeType,
                data: image,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini request failed";

    return NextResponse.json(
      {
        error: "Gemini request failed",
        detail: message,
        source: "gemini",
      },
      { status: 502 },
    );
  }

  const text = response.text ?? "";
  const estimate = parseJson(text);

  if (!estimate?.liters) {
    return NextResponse.json(demoEstimate(image));
  }

  return NextResponse.json({
    liters: Number(Math.max(0.5, estimate.liters).toFixed(1)),
    confidence: Math.round(Math.min(Math.max(estimate.confidence ?? 70, 0), 100)),
    note: estimate.note ?? "Estimasi Gemini berdasarkan foto yang diunggah.",
    source: "gemini",
  });
}

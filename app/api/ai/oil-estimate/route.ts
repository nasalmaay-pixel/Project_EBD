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

function demoEstimate() {
  return {
    liters: 5,
    confidence: 50,
    note: "Demo estimate. Gemini API akan digunakan bila tersedia.",
    source: "demo",
  };
}

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "No API key found" }, { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const models = await ai.models.list({ config: { pageSize: 50 } });
    const modelNames: string[] = [];

    for await (const model of models) {
      if (model.name) {
        modelNames.push(model.name);
      }
    }

    return NextResponse.json({ models: modelNames });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list models";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const parsed = estimateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return jsonError("Invalid image payload", 422);
  }

  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  const image = parsed.data.image.replace(/^data:[^;]+;base64,/, "");

  if (!apiKey) {
    return NextResponse.json(demoEstimate());
  }

  const ai = new GoogleGenAI({ apiKey });

  // List available models first
  try {
    const modelsList = await ai.models.list({ config: { pageSize: 50 } });
    const availableModels: string[] = [];

    for await (const model of modelsList) {
      if (model.name) {
        availableModels.push(model.name);
      }
    }

    console.log("Available models:", availableModels);

    // Try gemini-2.5-flash first, fallback to available models
    let modelToUse = "gemini-2.5-flash";
    if (!availableModels.some(m => m.includes("gemini-2.5-flash"))) {
      const flashModel = availableModels.find(m => m.includes("flash"));
      if (flashModel) {
        modelToUse = flashModel;
        console.log("gemini-2.5-flash not available, using:", modelToUse);
      }
    }

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: [
        {
          parts: [
            {
              text: `Kamu adalah AI yang mengestimasi volume minyak jelantah dari foto.
Kembalikan HANYA JSON dengan format:
{"liters": <angka_desimal>, "confidence": <0-100>, "note": "< satu kalimat penjelasan dalam Bahasa Indonesia >"}

Jika foto tidak jelas atau bukan minyak, tetap berikan estimasi terbaik.
Contoh response: {"liters": 3.5, "confidence": 75, "note": "Minyak terlihat dalam wadah plastic transparan, estimasi 3.5 liter."}`,
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
        temperature: 0.3,
      },
    });

    const text = response.text ?? "";
    console.log("Raw Gemini response:", text);

    const estimate = parseJson(text);
    console.log("Parsed estimate:", estimate);

    if (!estimate?.liters) {
      console.log("No liters found in estimate, returning demo");
      return NextResponse.json(demoEstimate());
    }

    return NextResponse.json({
      liters: Number(Math.max(0.5, estimate.liters).toFixed(1)),
      confidence: Math.round(Math.min(Math.max(estimate.confidence ?? 70, 0), 100)),
      note: estimate.note ?? "Estimasi berhasil dibuat dari foto.",
      source: "gemini",
      modelUsed: modelToUse,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini request failed";
    console.error("Gemini API error:", message);
    return NextResponse.json(demoEstimate());
  }
}

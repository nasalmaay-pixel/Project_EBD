import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const oilPriceSchema = z.object({
  name: z.string().min(1),
  pricePerLiter: z.number().positive(),
  minVolume: z.number().min(0).default(0),
  maxVolume: z.number().positive().default(999999),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const prices = await prisma.oilPrice.findMany({
    orderBy: { minVolume: "asc" },
  });

  return NextResponse.json({ prices });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return jsonError("Admin access required", 403);
  }

  const parsed = oilPriceSchema.safeParse(await request.json());

  if (!parsed.success) {
    return jsonError("Invalid oil price payload", 422);
  }

  const price = await prisma.oilPrice.create({
    data: parsed.data,
  });

  return NextResponse.json({ price }, { status: 201 });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return jsonError("Admin access required", 403);
  }

  const parsed = z.object({
    id: z.string(),
    name: z.string().min(1),
    pricePerLiter: z.number().positive(),
    minVolume: z.number().min(0),
    maxVolume: z.number().positive(),
    isActive: z.boolean(),
  }).safeParse(await request.json());

  if (!parsed.success) {
    return jsonError("Invalid oil price payload", 422);
  }

  const price = await prisma.oilPrice.update({
    where: { id: parsed.data.id },
    data: parsed.data,
  });

  return NextResponse.json({ price });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return jsonError("Admin access required", 403);
  }

  const parsed = z.object({
    id: z.string(),
  }).safeParse(await request.json());

  if (!parsed.success) {
    return jsonError("Invalid payload", 422);
  }

  await prisma.oilPrice.delete({
    where: { id: parsed.data.id },
  });

  return NextResponse.json({ ok: true });
}

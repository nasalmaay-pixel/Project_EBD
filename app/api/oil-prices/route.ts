import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const prices = await prisma.oilPrice.findMany({
    where: { isActive: true },
    orderBy: { minVolume: "asc" },
  });

  return NextResponse.json({ prices });
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const schedules = await prisma.pickupSchedule.findMany({
    where: { isActive: true },
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json({ schedules });
}
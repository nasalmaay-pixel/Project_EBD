import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ScheduleInput = {
  startTime: string;
  endTime: string;
  isActive: boolean;
};

export async function GET() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schedules = await prisma.pickupSchedule.findMany({
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json({ schedules });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as Record<number, ScheduleInput>;

  // Upsert all schedules
  for (const [dayOfWeekStr, data] of Object.entries(body)) {
    const dayOfWeek = parseInt(dayOfWeekStr, 10);

    await prisma.pickupSchedule.upsert({
      where: { dayOfWeek },
      create: {
        dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isActive: data.isActive,
      },
      update: {
        startTime: data.startTime,
        endTime: data.endTime,
        isActive: data.isActive,
      },
    });
  }

  const schedules = await prisma.pickupSchedule.findMany({
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json({ schedules, success: true });
}
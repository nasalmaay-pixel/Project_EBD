import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const blockedDates = await prisma.blockedDate.findMany({
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ blockedDates });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { date, reason } = body;

  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  const blockedDate = new Date(date);
  blockedDate.setHours(0, 0, 0, 0);

  const result = await prisma.blockedDate.upsert({
    where: { date: blockedDate },
    create: {
      date: blockedDate,
      reason: reason || "",
    },
    update: {
      reason: reason || "",
    },
  });

  return NextResponse.json({ blockedDate: result });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  await prisma.blockedDate.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return jsonError("Admin access required", 403);
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true, oilSubmissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

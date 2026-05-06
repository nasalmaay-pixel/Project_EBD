import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { estimateOilPrice } from "@/lib/utils";

const oilSubmissionSchema = z.object({
  location: z.string().min(5),
  quantity: z.number().positive(),
  pickupMethod: z.enum(["PICKUP", "DROPOFF"]),
  schedule: z.string().datetime().or(z.string().min(10)),
});

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Authentication required", 401);
  }

  const submissions = await prisma.oilSubmission.findMany({
    where: user.role === "ADMIN" ? undefined : { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ submissions });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Authentication required", 401);
  }

  const parsed = oilSubmissionSchema.safeParse(await request.json());

  if (!parsed.success) {
    return jsonError("Invalid oil submission payload", 422);
  }

  const earnedPoints = Math.max(Math.floor(parsed.data.quantity), 1);
  const [submission] = await prisma.$transaction([
    prisma.oilSubmission.create({
      data: {
        userId: user.id,
        quantity: parsed.data.quantity,
        location: parsed.data.location,
        pickupMethod: parsed.data.pickupMethod,
        schedule: new Date(parsed.data.schedule),
        priceEstimate: estimateOilPrice(parsed.data.quantity),
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { points: { increment: earnedPoints } },
    }),
  ]);

  return NextResponse.json({ submission, points: earnedPoints }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return jsonError("Admin access required", 403);
  }

  const parsed = z
    .object({
      id: z.string(),
      status: z.enum(["REQUESTED", "SCHEDULED", "PICKED", "COMPLETED"]),
    })
    .safeParse(await request.json());

  if (!parsed.success) {
    return jsonError("Invalid status payload", 422);
  }

  const submission = await prisma.oilSubmission.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ submission });
}

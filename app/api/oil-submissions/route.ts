import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const oilSubmissionSchema = z.object({
  name: z.string().min(1),
  phoneNumber: z.string().min(1),
  accountNumber: z.string().min(1),
  location: z.string().min(5),
  quantity: z.number().positive(),
  pickupMethod: z.enum(["PICKUP", "DROPOFF"]),
  paymentMethod: z.string().optional().default("QRIS"),
  scheduleDate: z.string().min(1),
  schedule: z.string().optional(), // legacy
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

  // Get active price tiers from database
  const priceTiers = await prisma.oilPrice.findMany({
    where: { isActive: true },
    orderBy: { minVolume: "asc" },
  });

  // Calculate price estimate using dynamic tiers
  let priceEstimate = 0;
  const liters = parsed.data.quantity;

  if (priceTiers.length > 0) {
    const tier = priceTiers.find(
      (t) => liters >= t.minVolume && liters <= t.maxVolume,
    );
    if (tier) {
      priceEstimate = Math.round(liters * tier.pricePerLiter);
    } else {
      // Use lowest tier if no match
      const lowestTier = priceTiers[0];
      priceEstimate = Math.round(liters * lowestTier.pricePerLiter);
    }
  } else {
    // Fallback to static calculation
    const baseRate = 5200;
    const volumeBonus = liters >= 25 ? 1.12 : liters >= 10 ? 1.06 : 1;
    priceEstimate = Math.round(liters * baseRate * volumeBonus);
  }

  // Handle both new format (scheduleDate + schedule) and legacy (schedule)
  let scheduleDate: Date;
  const scheduleDateRaw = parsed.data.scheduleDate;
  const scheduleTimeSlot = parsed.data.schedule;

  if (scheduleDateRaw) {
    // New format: date + time slot
    const timeSlot = scheduleTimeSlot || "10:00";
    scheduleDate = new Date(`${scheduleDateRaw}T${timeSlot}:00`);
  } else {
    // Legacy format
    scheduleDate = new Date(parsed.data.schedule || Date.now());
  }

  const earnedPoints = Math.max(Math.floor(parsed.data.quantity), 1);
  const [submission] = await prisma.$transaction([
    prisma.oilSubmission.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        phoneNumber: parsed.data.phoneNumber,
        accountNumber: parsed.data.accountNumber,
        quantity: parsed.data.quantity,
        location: parsed.data.location,
        pickupMethod: parsed.data.pickupMethod,
        schedule: scheduleDate,
        priceEstimate,
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
      status: z.enum(["PENDING", "PAID", "ALREADY_PICK_UP"]),
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

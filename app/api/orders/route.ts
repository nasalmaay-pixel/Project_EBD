import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const checkoutSchema = z.object({
  paymentMethod: z.enum(["QRIS", "BANK_TRANSFER", "E_WALLET"]).default("QRIS"),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    }),
  ).min(1),
});

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Authentication required", 401);
  }

  const orders = await prisma.order.findMany({
    where: user.role === "ADMIN" ? undefined : { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Authentication required", 401);
  }

  const parsed = checkoutSchema.safeParse(await request.json());

  if (!parsed.success) {
    return jsonError("Invalid checkout payload", 422);
  }

  const products = await prisma.product.findMany({
    where: { id: { in: parsed.data.items.map((item) => item.productId) } },
  });

  const totalPrice = parsed.data.items.reduce((total, item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return total + (product?.price ?? 0) * item.quantity;
  }, 0);
  const paymentReference = `CX-${parsed.data.paymentMethod}-${Date.now()}`;
  const earnedPoints = Math.max(Math.floor(totalPrice / 10000), 1);

  const [order] = await prisma.$transaction([
    prisma.order.create({
      data: {
        userId: user.id,
        totalPrice,
        paymentMethod: parsed.data.paymentMethod,
        paymentReference,
        paymentStatus: "WAITING_PAYMENT",
        items: {
          create: parsed.data.items.map((item) => {
            const product = products.find((candidate) => candidate.id === item.productId);

            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product?.price ?? 0,
            };
          }),
        },
      },
      include: { items: true },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { points: { increment: earnedPoints } },
    }),
  ]);

  return NextResponse.json(
    { order, points: earnedPoints, payment: { method: parsed.data.paymentMethod, reference: paymentReference } },
    { status: 201 },
  );
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return jsonError("Admin access required", 403);
  }

  const parsed = z
    .object({
      id: z.string(),
      status: z.enum(["PENDING", "PAID", "SHIPPED", "COMPLETED"]),
    })
    .safeParse(await request.json());

  if (!parsed.success) {
    return jsonError("Invalid order status payload", 422);
  }

  const order = await prisma.order.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ order });
}

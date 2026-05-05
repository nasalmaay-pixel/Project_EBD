import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Authentication required", 401);
  }

  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json({ cart });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Authentication required", 401);
  }

  const parsed = z
    .object({
      productId: z.string(),
      quantity: z.number().int().positive().default(1),
    })
    .safeParse(await request.json());

  if (!parsed.success) {
    return jsonError("Invalid cart item payload", 422);
  }

  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  const item = await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId: parsed.data.productId,
      },
    },
    update: { quantity: { increment: parsed.data.quantity } },
    create: {
      cartId: cart.id,
      productId: parsed.data.productId,
      quantity: parsed.data.quantity,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Authentication required", 401);
  }

  const parsed = z
    .object({
      itemId: z.string(),
      quantity: z.number().int().nonnegative(),
    })
    .safeParse(await request.json());

  if (!parsed.success) {
    return jsonError("Invalid cart update payload", 422);
  }

  if (parsed.data.quantity === 0) {
    await prisma.cartItem.delete({ where: { id: parsed.data.itemId } });
    return NextResponse.json({ ok: true });
  }

  const item = await prisma.cartItem.update({
    where: { id: parsed.data.itemId },
    data: { quantity: parsed.data.quantity },
  });

  return NextResponse.json({ item });
}

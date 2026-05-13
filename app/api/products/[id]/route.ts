import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const productUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.string().min(2).optional(),
  aroma: z.string().min(2).optional(),
  description: z.string().min(8).optional(),
  price: z.number().positive().optional(),
  promoLabel: z.string().max(40).optional(),
  promoDiscount: z.number().int().min(0).max(90).optional(),
  stock: z.number().int().nonnegative().optional(),
  imageUrl: z.string().min(1).optional(),
  imageAlt: z.string().min(2).optional(),
  rating: z.number().min(0).max(5).optional(),
  leadTime: z.string().min(2).optional(),
  aromaOptions: z.array(z.string().min(1)).min(1).optional(),
  containerOptions: z.array(z.string().min(1)).min(1).optional(),
  decorationOptions: z.array(z.string().min(1)).min(1).optional(),
  aromaPrices: z.record(z.string(), z.number()).optional(),
  containerPrices: z.record(z.string(), z.number()).optional(),
  decorationPrices: z.record(z.string(), z.number()).optional(),
  giftCardAvailable: z.boolean().optional(),
  customBuild: z.boolean().optional(),
});

const productCreateSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  aroma: z.string().min(2),
  description: z.string().min(8),
  price: z.number().positive(),
  promoLabel: z.string().max(40).default(""),
  promoDiscount: z.number().int().min(0).max(90).default(0),
  stock: z.number().int().nonnegative(),
  imageUrl: z.string().min(1),
  imageAlt: z.string().min(2),
  rating: z.number().min(0).max(5).default(4.9),
  leadTime: z.string().min(2),
  aromaOptions: z.array(z.string().min(1)).min(1),
  containerOptions: z.array(z.string().min(1)).min(1),
  decorationOptions: z.array(z.string().min(1)).min(1),
  aromaPrices: z.record(z.string(), z.number()).default({}),
  containerPrices: z.record(z.string(), z.number()).default({}),
  decorationPrices: z.record(z.string(), z.number()).default({}),
  giftCardAvailable: z.boolean().default(false),
  customBuild: z.boolean().default(false),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    return jsonError("Product not found", 404);
  }

  return NextResponse.json({ product });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return jsonError("Admin access required", 403);
  }

  const parsed = productUpdateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return jsonError("Invalid product payload", 422);
  }

  const { id } = await params;
  const product = await prisma.product.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ product });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return jsonError("Admin access required", 403);
  }

  const parsed = productCreateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return jsonError("Invalid product payload", 422);
  }

  const { id } = await params;
  const product = await prisma.product.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ product });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return jsonError("Admin access required", 403);
  }

  const { id } = await params;
  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}

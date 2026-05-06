import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const productSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  aroma: z.string().min(2),
  description: z.string().min(8),
  price: z.number().positive(),
  promoLabel: z.string().max(40).default(""),
  promoDiscount: z.number().int().min(0).max(90).default(0),
  stock: z.number().int().nonnegative(),
  imageUrl: z.url(),
  imageAlt: z.string().min(2),
  rating: z.number().min(0).max(5).default(4.9),
  leadTime: z.string().min(2).default("Ready stock"),
  aromaOptions: z.array(z.string().min(1)).min(1),
  containerOptions: z.array(z.string().min(1)).min(1),
  decorationOptions: z.array(z.string().min(1)).min(1),
  giftCardAvailable: z.boolean().default(false),
  customBuild: z.boolean().default(false),
});

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: [{ customBuild: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return jsonError("Admin access required", 403);
  }

  const parsed = productSchema.safeParse(await request.json());

  if (!parsed.success) {
    return jsonError("Invalid product payload", 422);
  }

  const product = await prisma.product.create({ data: parsed.data });

  return NextResponse.json({ product }, { status: 201 });
}

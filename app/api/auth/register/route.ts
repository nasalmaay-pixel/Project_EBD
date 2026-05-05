import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, signToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(["SELLER", "BUYER"]).default("BUYER"),
});

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json());

  if (!parsed.success) {
    return jsonError("Invalid registration payload", 422);
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing) {
    return jsonError("Email is already registered", 409);
  }

  const user = await prisma.user.create({
    data: {
      ...parsed.data,
      password: await hashPassword(parsed.data.password),
      cart: parsed.data.role === "BUYER" ? { create: {} } : undefined,
    },
    select: { id: true, name: true, email: true, role: true },
  });

  const token = signToken(user);
  const response = NextResponse.json({ user, token }, { status: 201 });
  response.cookies.set("candlex_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

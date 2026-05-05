import { NextResponse } from "next/server";
import { z } from "zod";
import { signToken, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());

  if (!parsed.success) {
    return jsonError("Invalid login payload", 422);
  }

  const found = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (!found || !(await verifyPassword(parsed.data.password, found.password))) {
    return jsonError("Invalid email or password", 401);
  }

  const user = {
    id: found.id,
    name: found.name,
    email: found.email,
    role: found.role,
  };
  const token = signToken(user);
  const response = NextResponse.json({ user, token });
  response.cookies.set("candlex_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

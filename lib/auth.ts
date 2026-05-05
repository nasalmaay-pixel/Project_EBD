import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET ?? "candlex-dev-secret-change-me";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "SELLER" | "BUYER" | "ADMIN";
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(user: AuthUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("candlex_token")?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true, name: true, role: true, points: true, createdAt: true },
  });
}

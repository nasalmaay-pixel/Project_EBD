"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");

    const payload = isRegister
      ? {
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
          role: formData.get("role"),
        }
      : {
          email: formData.get("email"),
          password: formData.get("password"),
        };

    const response = await fetch(isRegister ? "/api/auth/register" : "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!response.ok) {
      setError(isRegister ? "Registration failed. Check your data." : "Email or password is incorrect.");
      return;
    }

    const result = await response.json() as { user?: { role?: string } };
    const requestedNext = searchParams.get("next");
    const nextPath = result.user?.role === "ADMIN" ? "/admin" : requestedNext ?? "/dashboard";

    router.push(nextPath);
    router.refresh();
  }

  return (
    <form action={submit} className="glass mx-auto max-w-xl rounded-lg p-6">
      <div className="grid gap-5">
        {isRegister ? (
          <label className="space-y-2">
            <span className="text-sm font-semibold">Name</span>
            <Input name="name" minLength={2} placeholder="Your name" required />
          </label>
        ) : null}

        <label className="space-y-2">
          <span className="text-sm font-semibold">Email</span>
          <Input name="email" type="email" placeholder="you@candlex.id" required />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold">Password</span>
          <Input name="password" type="password" minLength={isRegister ? 6 : 1} required />
        </label>

        {isRegister ? (
          <label className="space-y-2">
            <span className="text-sm font-semibold">Account type</span>
            <Select name="role" defaultValue="BUYER">
              <option value="BUYER">Buyer</option>
              <option value="SELLER">Seller</option>
            </Select>
          </label>
        ) : null}

        {error ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
        ) : null}

        <Button type="submit" variant="warm" size="lg" disabled={loading}>
          {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
          {loading ? "Please wait" : isRegister ? "Create account" : "Login"}
        </Button>
      </div>
    </form>
  );
}

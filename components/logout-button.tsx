"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.push("/login");
    router.refresh();
  }

  return (
    <Button type="button" variant="secondary" className={className} onClick={logout}>
      <LogOut size={16} />
      Logout
    </Button>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border border-stone-200 bg-white/80 px-3 text-sm text-stone-950 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-[var(--ring)]",
        className,
      )}
      {...props}
    />
  );
}

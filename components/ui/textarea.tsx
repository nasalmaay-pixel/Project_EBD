import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-lg border border-stone-200 bg-white/80 px-3 py-3 text-sm text-stone-950 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-[var(--ring)]",
        className,
      )}
      {...props}
    />
  );
}

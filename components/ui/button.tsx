import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-stone-950 text-amber-50 shadow-lg shadow-stone-900/15 hover:-translate-y-0.5 hover:bg-stone-800",
        secondary: "bg-white/70 text-stone-900 ring-1 ring-stone-200 hover:-translate-y-0.5 hover:bg-white",
        ghost: "text-stone-700 hover:bg-white/60",
        warm: "bg-[#d78b37] text-white shadow-lg shadow-amber-800/20 hover:-translate-y-0.5 hover:bg-[#bd7025]",
      },
      size: {
        default: "h-11 px-5",
        lg: "h-13 px-7 text-base",
        icon: "h-11 w-11 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { buttonVariants };

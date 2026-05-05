import Link from "next/link";
import { BookOpen, Flame, ShoppingBag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  ["Marketplace", "/marketplace"],
  ["Sell Oil", "/sell-oil"],
  ["Dashboard", "/dashboard"],
];

export function SiteNav() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/65 bg-[#fffaf0]/75 px-4 py-3 shadow-lg shadow-stone-900/5 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2 font-semibold text-stone-950">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-stone-950 text-amber-100">
            <Flame size={18} />
          </span>
          <span>CandleX</span>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-full px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-white/70 hover:text-stone-950"
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/awareness"
            className={cn(buttonVariants({ variant: "secondary", size: "default" }), "hidden h-10 md:inline-flex")}
          >
            <BookOpen size={16} />
            Awareness
          </Link>
          <Link
            href="/checkout"
            className={cn(buttonVariants({ variant: "default", size: "default" }), "h-10")}
          >
            <ShoppingBag size={16} />
            Cart
          </Link>
        </div>
      </nav>
    </header>
  );
}

"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { ProductCategory, ProductSeed } from "@/lib/data";
import { cn } from "@/lib/utils";

type MarketplaceBrowserProps = {
  categories: ProductCategory[];
  products: ProductSeed[];
};

const allCategory = "All" as const;

export function MarketplaceBrowser({ categories, products }: MarketplaceBrowserProps) {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | typeof allCategory>(allCategory);

  const filteredProducts = useMemo(
    () =>
      activeCategory === allCategory
        ? products
        : products.filter((product) => product.category === activeCategory),
    [activeCategory, products],
  );

  return (
    <div className="mt-12">
      <div className="flex flex-col justify-between gap-4 border-y border-stone-200 py-5 md:flex-row md:items-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-stone-700">
          <SlidersHorizontal size={18} />
          <span>{filteredProducts.length} candle options</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:justify-end md:overflow-visible md:pb-0">
          {([allCategory, ...categories] as const).map((category) => {
            const isActive = activeCategory === category;

            return (
              <Button
                key={category}
                type="button"
                variant={isActive ? "default" : "secondary"}
                className={cn("h-10 shrink-0 px-4", !isActive && "bg-white/55")}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

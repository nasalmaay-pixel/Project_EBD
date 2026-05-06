"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Gift, Palette, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductSeed, productHasPromo, productSalePrice } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

type ProductCardProps = {
  product: ProductSeed;
};

const CART_KEY = "candlex_cart";
const CART_EVENT = "candlex-cart-change";

export function ProductCard({ product }: ProductCardProps) {
  const hasPromo = productHasPromo(product);
  const salePrice = productSalePrice(product);

  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group overflow-hidden rounded-lg border border-white/70 bg-white/70 shadow-[0_22px_70px_rgba(63,45,28,0.12)] backdrop-blur-xl"
    >
      <Link href={`/marketplace/${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-stone-200">
          <img
            src={product.imageUrl}
            alt={product.imageAlt}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {hasPromo ? (
              <span className="rounded-full bg-[#d78b37] px-3 py-1 text-xs font-bold text-white shadow-sm">
                {product.promoLabel || "Promo"} -{product.promoDiscount}%
              </span>
            ) : null}
            <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-stone-900 shadow-sm backdrop-blur">
              {product.category}
            </span>
            {product.customBuild ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#4f6f52] px-3 py-1 text-xs font-bold text-white shadow-sm">
                <Palette size={13} />
                Custom
              </span>
            ) : null}
          </div>
        </div>
      </Link>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9b5b24]">
              {product.aroma}
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold text-stone-950">
              {product.name}
            </h3>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
            <Star size={13} fill="currentColor" />
            {product.rating}
          </div>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-stone-600">{product.description}</p>
        <div className="grid gap-2 text-xs text-stone-600">
          <p>
            <span className="font-semibold text-stone-900">{product.variants.aromas.length}</span> aroma,{" "}
            <span className="font-semibold text-stone-900">{product.variants.containers.length}</span> wadah,{" "}
            <span className="font-semibold text-stone-900">{product.variants.decorations.length}</span> dekorasi
          </p>
          {product.giftCardAvailable ? (
            <p className="inline-flex items-center gap-1 font-medium text-[#7a3f1d]">
              <Gift size={14} />
              Bisa tambah kartu ucapan
            </p>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="grid gap-0.5 font-semibold text-stone-950">
            <span>{formatCurrency(salePrice)}</span>
            {hasPromo ? (
              <span className="text-xs font-medium text-stone-500 line-through">{formatCurrency(product.price)}</span>
            ) : null}
          </span>
          <Button
            variant="warm"
            onClick={() => {
              const raw = localStorage.getItem(CART_KEY) ?? "[]";
              const items = JSON.parse(raw) as {
                id?: string;
                productId: string;
                quantity: number;
                customization?: unknown;
              }[];
              const next = [
                ...items,
                {
                  id: `${product.id}-${Date.now()}`,
                  productId: product.id,
                  quantity: 1,
                  customization: {
                    aroma: product.variants.aromas[0],
                    container: product.variants.containers[0],
                    decoration: product.variants.decorations[0],
                  },
                },
              ];

              localStorage.setItem(CART_KEY, JSON.stringify(next));
              window.dispatchEvent(new Event(CART_EVENT));
            }}
          >
            Add to cart
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

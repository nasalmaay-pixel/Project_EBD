"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductSeed } from "@/lib/data";

type StoredItem = {
  productId: string;
  quantity: number;
};

export function AddToCartButton({ product }: { product: ProductSeed }) {
  return (
    <Button
      variant="warm"
      size="lg"
      onClick={() => {
        const raw = localStorage.getItem("candlex_cart") ?? "[]";
        const items = JSON.parse(raw) as StoredItem[];
        const existing = items.find((item) => item.productId === product.id);
        const next = existing
          ? items.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            )
          : [...items, { productId: product.id, quantity: 1 }];

        localStorage.setItem("candlex_cart", JSON.stringify(next));
      }}
    >
      <ShoppingBag size={18} />
      Add to cart
    </Button>
  );
}

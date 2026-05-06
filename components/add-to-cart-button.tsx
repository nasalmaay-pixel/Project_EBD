"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductSeed } from "@/lib/data";

type StoredItem = {
  productId: string;
  quantity: number;
};

const CART_KEY = "candlex_cart";
const CART_EVENT = "candlex-cart-change";

export function AddToCartButton({ product }: { product: ProductSeed }) {
  return (
    <Button
      variant="warm"
      size="lg"
      onClick={() => {
        const raw = localStorage.getItem(CART_KEY) ?? "[]";
        const items = JSON.parse(raw) as StoredItem[];
        const existing = items.find((item) => item.productId === product.id);
        const next = existing
          ? items.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            )
          : [...items, { productId: product.id, quantity: 1 }];

        localStorage.setItem(CART_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event(CART_EVENT));
      }}
    >
      <ShoppingBag size={18} />
      Add to cart
    </Button>
  );
}

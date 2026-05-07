"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, CheckCircle2, Minus, Plus, QrCode, Trash2, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductSeed, productHasPromo, productSalePrice } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

type CartItem = {
  id?: string;
  productId: string;
  quantity: number;
  customization?: {
    aroma?: string;
    container?: string;
    decoration?: string;
    giftCardMessage?: string;
    designNotes?: string;
  };
};

const CART_KEY = "candlex_cart";
const CART_EVENT = "candlex-cart-change";
const paymentOptions = [
  {
    id: "QRIS",
    label: "QRIS",
    detail: "Belum tersedia",
    Icon: QrCode,
    available: false,
  },
  {
    id: "BANK_TRANSFER",
    label: "Bank Transfer",
    detail: "BRI 011001037801539 a.n CandleX",
    Icon: Building2,
    available: true,
  },
  {
    id: "E_WALLET",
    label: "E-Wallet",
    detail: "Belum tersedia",
    Icon: WalletCards,
    available: false,
  },
] as const;

export function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]") as CartItem[];
  } catch {
    return [];
  }
}

export function CartClient({ products }: { products: ProductSeed[] }) {
  const [items, setItems] = useState<CartItem[]>(() => readCart());
  const [paymentMethod, setPaymentMethod] = useState<(typeof paymentOptions)[number]["id"]>("BANK_TRANSFER");
  const [checkoutResult, setCheckoutResult] = useState<{
    reference: string;
    points: number;
    method: string;
    instruction: string;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CART_EVENT));
  }, [items]);

  const lines = useMemo(
    () =>
      items
        .map((item, itemIndex) => ({
          ...item,
          itemIndex,
          product: products.find((product) => product.id === item.productId),
        }))
        .filter((item) => item.product),
    [items, products],
  );

  const total = lines.reduce(
    (sum, item) => sum + (item.product ? productSalePrice(item.product) : 0) * item.quantity,
    0,
  );

  function update(itemIndex: number, quantity: number) {
    setItems((current) =>
      quantity <= 0
        ? current.filter((_, index) => index !== itemIndex)
        : current.map((item, index) =>
            index === itemIndex ? { ...item, quantity } : item,
          ),
    );
  }

  async function checkout() {
    setCheckoutResult(null);

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentMethod,
        items: lines.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }),
    }).catch(() => null);

    if (!response?.ok) {
      setCheckoutResult({
        reference: "Login required",
        points: 0,
        method: "Please login before checkout",
        instruction: "",
      });
      return;
    }

    const result = await response.json() as { payment?: { reference?: string }, points?: number };
    const selectedPayment = paymentOptions.find((option) => option.id === paymentMethod);
    setItems([]);
    setCheckoutResult({
      reference: result.payment?.reference ?? "CX-PAY",
      points: result.points ?? 0,
      method: selectedPayment?.label ?? paymentMethod.replace("_", " "),
      instruction: selectedPayment?.detail ?? "",
    });
  }

  if (!lines.length) {
    return (
      <>
        <div className="rounded-lg border border-dashed border-stone-300 bg-white/60 p-10 text-center">
          <p className="font-display text-3xl font-bold">Your cart is quiet.</p>
          <p className="mt-3 text-stone-600">Add candles from the marketplace to start checkout.</p>
        </div>
        {checkoutResult ? (
          <CheckoutOverlay result={checkoutResult} onClose={() => setCheckoutResult(null)} />
        ) : null}
      </>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {lines.map(({ product, quantity, productId, customization, itemIndex }) => (
          <div
            key={`${productId}-${itemIndex}`}
            className="grid gap-4 rounded-lg border border-white/70 bg-white/70 p-4 shadow-lg shadow-stone-900/5 md:grid-cols-[120px_1fr_auto]"
          >
            <img
              src={product?.imageUrl}
              alt={product?.name}
              className="h-32 w-full rounded-lg object-cover md:h-full"
            />
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#9b5b24]">{product?.aroma}</p>
              <h2 className="mt-1 font-display text-2xl font-bold">{product?.name}</h2>
              <p className="mt-2 text-sm text-stone-600">{product?.description}</p>
              {customization ? (
                <div className="mt-4 grid gap-1 rounded-lg bg-stone-50/80 p-3 text-xs leading-5 text-stone-600">
                  <p>
                    <span className="font-semibold text-stone-900">Aroma:</span> {customization.aroma}
                  </p>
                  <p>
                    <span className="font-semibold text-stone-900">Wadah:</span> {customization.container}
                  </p>
                  <p>
                    <span className="font-semibold text-stone-900">Dekorasi:</span> {customization.decoration}
                  </p>
                  {customization.giftCardMessage ? (
                    <p>
                      <span className="font-semibold text-stone-900">Kartu:</span>{" "}
                      {customization.giftCardMessage}
                    </p>
                  ) : null}
                  {customization.designNotes ? (
                    <p>
                      <span className="font-semibold text-stone-900">Catatan:</span>{" "}
                      {customization.designNotes}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="flex items-center gap-2 md:flex-col md:items-end md:justify-between">
              <div className="text-right">
                <p className="font-semibold">{formatCurrency((product ? productSalePrice(product) : 0) * quantity)}</p>
                {product && productHasPromo(product) ? (
                  <p className="text-xs font-semibold text-[#9b5b24]">
                    {product.promoLabel || "Promo"} -{product.promoDiscount}%
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="icon" onClick={() => update(itemIndex, quantity - 1)}>
                  <Minus size={16} />
                </Button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <Button variant="secondary" size="icon" onClick={() => update(itemIndex, quantity + 1)}>
                  <Plus size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => update(itemIndex, 0)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <aside className="h-fit rounded-lg border border-white/70 bg-white/75 p-6 shadow-xl shadow-stone-900/10 backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.22em] text-stone-500">Secure payment</p>
        <h2 className="mt-2 font-display text-3xl font-bold">Checkout</h2>
        <div className="mt-5 grid gap-3">
          {paymentOptions.map(({ id, label, detail, Icon, available }) => {
            const isActive = paymentMethod === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => available && setPaymentMethod(id)}
                disabled={!available}
                className={`rounded-lg border p-4 text-left transition ${
                  isActive
                    ? "border-[#d78b37] bg-amber-50 shadow-lg shadow-amber-900/10"
                    : !available
                      ? "cursor-not-allowed border-stone-200 bg-stone-100/70 opacity-70"
                    : "border-stone-200 bg-white/65 hover:bg-white"
                }`}
              >
                <span className="flex items-center gap-2 font-semibold">
                  <Icon size={17} />
                  {label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-stone-600">{detail}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-5">
          <span>Total</span>
          <span className="text-xl font-bold">{formatCurrency(total)}</span>
        </div>
        <Button className="mt-6 w-full" variant="warm" size="lg" onClick={checkout}>
          Place order
        </Button>
      </aside>

      {checkoutResult ? (
        <CheckoutOverlay result={checkoutResult} onClose={() => setCheckoutResult(null)} />
      ) : null}
    </div>
  );
}

function CheckoutOverlay({
  result,
  onClose,
}: {
  result: { reference: string; points: number; method: string; instruction: string };
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-stone-950/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg bg-[#fffaf0] p-6 shadow-2xl shadow-stone-950/30">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4f6f52] text-white">
          <CheckCircle2 size={28} />
        </div>
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.22em] text-[#9b5b24]">Order received</p>
        <h2 className="mt-2 font-display text-4xl font-bold">Payment instructions ready.</h2>
        <div className="mt-5 grid gap-3 rounded-lg bg-white/75 p-4 text-sm">
          <p>
            <span className="font-semibold">Method:</span> {result.method}
          </p>
          {result.instruction ? (
            <p>
              <span className="font-semibold">Payment:</span> {result.instruction}
            </p>
          ) : null}
          <p>
            <span className="font-semibold">Reference:</span> {result.reference}
          </p>
          <p>
            <span className="font-semibold">Points earned:</span> {result.points}
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard" className="flex-1">
            <Button variant="warm" className="w-full">
              View dashboard
            </Button>
          </Link>
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

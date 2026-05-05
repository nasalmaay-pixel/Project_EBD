"use client";

import { useMemo, useState } from "react";
import { Gift, Palette, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductSeed } from "@/lib/data";

type Customization = {
  aroma: string;
  container: string;
  decoration: string;
  giftCardMessage?: string;
  designNotes?: string;
};

type StoredItem = {
  id: string;
  productId: string;
  quantity: number;
  customization: Customization;
};

const CART_KEY = "candlex_cart";

export function ProductConfigurator({ product }: { product: ProductSeed }) {
  const [aroma, setAroma] = useState(product.variants.aromas[0]);
  const [container, setContainer] = useState(product.variants.containers[0]);
  const [decoration, setDecoration] = useState(product.variants.decorations[0]);
  const [giftCardMessage, setGiftCardMessage] = useState("");
  const [designNotes, setDesignNotes] = useState("");
  const [added, setAdded] = useState(false);

  const summary = useMemo(
    () => [aroma, container, decoration].filter(Boolean).join(" / "),
    [aroma, container, decoration],
  );

  function addToCart() {
    const raw = localStorage.getItem(CART_KEY) ?? "[]";
    const items = JSON.parse(raw) as StoredItem[];
    const next = [
      ...items,
      {
        id: `${product.id}-${Date.now()}`,
        productId: product.id,
        quantity: 1,
        customization: {
          aroma,
          container,
          decoration,
          giftCardMessage: giftCardMessage.trim() || undefined,
          designNotes: designNotes.trim() || undefined,
        },
      },
    ];

    localStorage.setItem(CART_KEY, JSON.stringify(next));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="rounded-lg border border-white/70 bg-white/75 p-5 shadow-xl shadow-stone-900/10 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9b5b24]">
            {product.customBuild ? "Custom candle builder" : "Pilih varian"}
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold">Design options</h2>
        </div>
        {product.customBuild ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4f6f52] text-white">
            <Palette size={20} />
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <OptionSelect label="Aroma" value={aroma} options={product.variants.aromas} onChange={setAroma} />
        <OptionSelect label="Wadah" value={container} options={product.variants.containers} onChange={setContainer} />
        <OptionSelect
          label="Dekorasi"
          value={decoration}
          options={product.variants.decorations}
          onChange={setDecoration}
        />
      </div>

      {product.giftCardAvailable ? (
        <label className="mt-5 block">
          <span className="flex items-center gap-2 text-sm font-semibold text-stone-800">
            <Gift size={16} />
            Kartu ucapan
          </span>
          <textarea
            value={giftCardMessage}
            onChange={(event) => setGiftCardMessage(event.target.value)}
            maxLength={160}
            placeholder="Tulis pesan singkat untuk penerima"
            className="mt-2 min-h-24 w-full rounded-lg border border-stone-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-[#d78b37] focus:ring-4 focus:ring-[var(--ring)]"
          />
        </label>
      ) : null}

      {product.customBuild ? (
        <label className="mt-5 block">
          <span className="text-sm font-semibold text-stone-800">Catatan desain sendiri</span>
          <textarea
            value={designNotes}
            onChange={(event) => setDesignNotes(event.target.value)}
            maxLength={240}
            placeholder="Contoh: label nama brand, palet warna, tema acara, atau mood desain"
            className="mt-2 min-h-28 w-full rounded-lg border border-stone-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-[#d78b37] focus:ring-4 focus:ring-[var(--ring)]"
          />
        </label>
      ) : null}

      <div className="mt-6 flex flex-col gap-4 border-t border-stone-200 pt-5 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-6 text-stone-600">
          <span className="font-semibold text-stone-950">Selected:</span> {summary}
        </p>
        <Button variant="warm" size="lg" onClick={addToCart}>
          <ShoppingBag size={18} />
          {added ? "Added" : "Add configured candle"}
        </Button>
      </div>
    </div>
  );
}

function OptionSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-stone-800">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-lg border border-stone-200 bg-white/80 px-3 text-sm font-medium outline-none transition focus:border-[#d78b37] focus:ring-4 focus:ring-[var(--ring)]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

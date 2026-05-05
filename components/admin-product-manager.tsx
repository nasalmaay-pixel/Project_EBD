"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ProductCategory, ProductSeed, productCategories } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

function splitOptions(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AdminProductManager({ products }: { products: ProductSeed[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function createProduct(formData: FormData) {
    setMessage("");

    const payload = {
      name: formData.get("name"),
      category: formData.get("category") as ProductCategory,
      aroma: formData.get("aroma"),
      description: formData.get("description"),
      price: Number(formData.get("price")),
      stock: Number(formData.get("stock")),
      imageUrl: formData.get("imageUrl"),
      imageAlt: formData.get("imageAlt"),
      rating: Number(formData.get("rating") || 4.9),
      leadTime: formData.get("leadTime"),
      aromaOptions: splitOptions(formData.get("aromaOptions")),
      containerOptions: splitOptions(formData.get("containerOptions")),
      decorationOptions: splitOptions(formData.get("decorationOptions")),
      giftCardAvailable: formData.get("giftCardAvailable") === "on",
      customBuild: formData.get("customBuild") === "on",
    };

    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setMessage("Product failed to save. Check required fields and admin login.");
      return;
    }

    setMessage("Product saved.");
    router.refresh();
  }

  async function deleteProduct(productId: string) {
    setMessage("");

    const response = await fetch(`/api/products/${productId}`, { method: "DELETE" });

    if (!response.ok) {
      setMessage("Product failed to delete. It may already be used in an order.");
      return;
    }

    setMessage("Product deleted.");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <form action={createProduct} className="rounded-lg border border-white/70 bg-white/70 p-5 shadow-lg shadow-stone-900/5">
        <div className="flex items-center gap-2">
          <Plus className="text-[#d78b37]" />
          <h2 className="font-display text-3xl font-bold">Tambah barang</h2>
        </div>

        <div className="mt-6 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name">
              <Input name="name" placeholder="Lavender Gift Candle" required />
            </Field>
            <Field label="Category">
              <Select name="category" defaultValue="Signature">
                {productCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Main aroma">
            <Input name="aroma" placeholder="Lavender, vanilla, cedar" required />
          </Field>

          <Field label="Description">
            <Textarea name="description" placeholder="Short product story for customers" required />
          </Field>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Price">
              <Input name="price" type="number" min={1} placeholder="149000" required />
            </Field>
            <Field label="Stock">
              <Input name="stock" type="number" min={0} placeholder="20" required />
            </Field>
            <Field label="Rating">
              <Input name="rating" type="number" min={0} max={5} step={0.1} defaultValue={4.9} required />
            </Field>
          </div>

          <Field label="Image URL">
            <Input name="imageUrl" type="url" placeholder="https://images.unsplash.com/..." required />
          </Field>

          <Field label="Image alt">
            <Input name="imageAlt" placeholder="Relevant candle product photo" required />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Lead time">
              <Input name="leadTime" defaultValue="Ready stock" required />
            </Field>
            <div className="grid content-end gap-3 rounded-lg bg-stone-50/80 p-4 text-sm">
              <label className="flex items-center gap-2 font-medium">
                <input name="giftCardAvailable" type="checkbox" className="h-4 w-4 accent-[#d78b37]" />
                Bisa kartu ucapan
              </label>
              <label className="flex items-center gap-2 font-medium">
                <input name="customBuild" type="checkbox" className="h-4 w-4 accent-[#d78b37]" />
                Produk custom
              </label>
            </div>
          </div>

          <Field label="Aroma options, separated by comma">
            <Input name="aromaOptions" placeholder="Lavender vanilla, Rose tea, Citrus mint" required />
          </Field>
          <Field label="Wadah options, separated by comma">
            <Input name="containerOptions" placeholder="Clear glass jar, Ceramic cup, Amber jar" required />
          </Field>
          <Field label="Dekorasi options, separated by comma">
            <Input name="decorationOptions" placeholder="Dried flowers, Ribbon wrap, Wax seal" required />
          </Field>

          <Button type="submit" variant="warm" size="lg">
            <Plus size={18} />
            Save product
          </Button>

          {message ? <p className="text-sm font-semibold text-[#7a3f1d]">{message}</p> : null}
        </div>
      </form>

      <div className="rounded-lg border border-white/70 bg-white/70 p-5 shadow-lg shadow-stone-900/5">
        <h2 className="font-display text-3xl font-bold">Produk database</h2>
        <div className="mt-6 space-y-3">
          {products.map((product) => (
            <div key={product.id} className="grid gap-4 rounded-lg bg-white/75 p-4 md:grid-cols-[88px_1fr_auto]">
              <img src={product.imageUrl} alt={product.imageAlt} className="aspect-square rounded-lg object-cover" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{product.name}</p>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                    {product.category}
                  </span>
                </div>
                <p className="mt-1 text-sm text-stone-600">
                  {product.stock} stock - {formatCurrency(product.price)}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {product.variants.aromas.length} aroma / {product.variants.containers.length} wadah /{" "}
                  {product.variants.decorations.length} dekorasi
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteProduct(product.id)} aria-label={`Delete ${product.name}`}>
                <Trash2 size={17} />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

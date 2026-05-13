"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { Edit2, Plus, Trash2, X } from "lucide-react";
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

function parsePrices(value: FormDataEntryValue | null) {
  const raw = String(value ?? "{}");
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function AdminProductManager({ products }: { products: ProductSeed[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductSeed | null>(null);

  async function createProduct(formData: FormData) {
    setMessage("");

    const payload = {
      name: formData.get("name"),
      category: formData.get("category") as ProductCategory,
      aroma: formData.get("aroma"),
      description: formData.get("description"),
      price: Number(formData.get("price")),
      promoLabel: formData.get("promoLabel"),
      promoDiscount: Number(formData.get("promoDiscount") || 0),
      stock: Number(formData.get("stock")),
      imageUrl: formData.get("imageUrl"),
      imageAlt: formData.get("imageAlt"),
      rating: 4.9,
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

  async function updatePromo(productId: string, formData: FormData) {
    setMessage("");

    const response = await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        promoLabel: formData.get("promoLabel"),
        promoDiscount: Number(formData.get("promoDiscount") || 0),
      }),
    });

    if (!response.ok) {
      setMessage("Promo failed to save. Discount must be 0-90%.");
      return;
    }

    setMessage("Promo updated.");
    router.refresh();
  }

  function startEdit(product: ProductSeed) {
    setEditingId(product.id);
    setEditingProduct({ ...product });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingProduct(null);
  }

  async function saveEdit(productId: string, formData: FormData) {
    setMessage("");

    const payload = {
      name: formData.get("name"),
      category: formData.get("category") as ProductCategory,
      aroma: formData.get("aroma"),
      description: formData.get("description"),
      price: Number(formData.get("price")),
      promoLabel: formData.get("promoLabel"),
      promoDiscount: Number(formData.get("promoDiscount") || 0),
      stock: Number(formData.get("stock")),
      imageUrl: formData.get("imageUrl"),
      imageAlt: formData.get("imageAlt"),
      rating: 4.9,
      leadTime: formData.get("leadTime"),
      aromaOptions: splitOptions(formData.get("aromaOptions")),
      containerOptions: splitOptions(formData.get("containerOptions")),
      decorationOptions: splitOptions(formData.get("decorationOptions")),
      aromaPrices: parsePrices(formData.get("aromaPrices")),
      containerPrices: parsePrices(formData.get("containerPrices")),
      decorationPrices: parsePrices(formData.get("decorationPrices")),
      giftCardAvailable: formData.get("giftCardAvailable") === "on",
      customBuild: formData.get("customBuild") === "on",
    };

    const response = await fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setMessage("Product failed to update.");
      return;
    }

    setMessage("Product updated.");
    setEditingId(null);
    setEditingProduct(null);
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
            <Field label="Promo %">
              <Input name="promoDiscount" type="number" min={0} max={90} defaultValue={0} />
            </Field>
            <Field label="Stock">
              <Input name="stock" type="number" min={0} placeholder="20" required />
            </Field>
          </div>

          <Field label="Promo label">
            <Input name="promoLabel" placeholder="Weekend glow, Payday sale" />
          </Field>

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
          <Field label="Aroma prices (JSON: {&quot;option&quot;: price})">
            <Input name="aromaPrices" placeholder='{&quot;Lavender vanilla&quot;: 0, &quot;Rose tea&quot;: 5000}' />
          </Field>
          <Field label="Wadah options, separated by comma">
            <Input name="containerOptions" placeholder="Clear glass jar, Ceramic cup, Amber jar" required />
          </Field>
          <Field label="Wadah prices (JSON: {&quot;option&quot;: price})">
            <Input name="containerPrices" placeholder='{&quot;Clear glass jar&quot;: 0, &quot;Ceramic cup&quot;: 10000}' />
          </Field>
          <Field label="Dekorasi options, separated by comma">
            <Input name="decorationOptions" placeholder="Dried flowers, Ribbon wrap, Wax seal" required />
          </Field>
          <Field label="Dekorasi prices (JSON: {&quot;option&quot;: price})">
            <Input name="decorationPrices" placeholder='{&quot;Dried flowers&quot;: 5000, &quot;Ribbon wrap&quot;: 3000}' />
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
            <div key={product.id} className="rounded-lg bg-white/75 p-4">
              {editingId === product.id && editingProduct ? (
                <EditProductForm
                  product={editingProduct}
                  onSave={(formData) => saveEdit(product.id, formData)}
                  onCancel={cancelEdit}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-[88px_1fr_auto]">
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
                    {product.promoDiscount ? (
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[#9b5b24]">
                        {product.promoLabel || "Promo"} - {product.promoDiscount}% off
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-stone-500">
                      {product.variants.aromas.length} aroma / {product.variants.containers.length} wadah /{" "}
                      {product.variants.decorations.length} dekorasi
                    </p>
                    <form action={(formData) => updatePromo(product.id, formData)} className="mt-3 grid gap-2 sm:grid-cols-[1fr_92px_auto]">
                      <Input name="promoLabel" defaultValue={product.promoLabel} placeholder="Promo label" />
                      <Input
                        name="promoDiscount"
                        type="number"
                        min={0}
                        max={90}
                        defaultValue={product.promoDiscount}
                        aria-label={`${product.name} promo discount`}
                      />
                      <Button type="submit" variant="secondary" className="h-11">
                        Save promo
                      </Button>
                    </form>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="secondary" size="icon" onClick={() => startEdit(product)} aria-label={`Edit ${product.name}`}>
                      <Edit2 size={17} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteProduct(product.id)} aria-label={`Delete ${product.name}`}>
                      <Trash2 size={17} />
                    </Button>
                  </div>
                </div>
              )}
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

function EditProductForm({
  product,
  onSave,
  onCancel,
}: {
  product: ProductSeed;
  onSave: (formData: FormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: product.name,
    category: product.category,
    aroma: product.aroma,
    description: product.description,
    price: String(product.price),
    promoLabel: product.promoLabel,
    promoDiscount: String(product.promoDiscount),
    stock: String(product.stock),
    imageUrl: product.imageUrl,
    imageAlt: product.imageAlt,
    leadTime: product.leadTime,
    aromaOptions: product.variants.aromas.join(", "),
    containerOptions: product.variants.containers.join(", "),
    decorationOptions: product.variants.decorations.join(", "),
    aromaPrices: JSON.stringify(product.aromaPrices || {}),
    containerPrices: JSON.stringify(product.containerPrices || {}),
    decorationPrices: JSON.stringify(product.decorationPrices || {}),
    giftCardAvailable: product.giftCardAvailable,
    customBuild: product.customBuild ?? false,
  });

  function handleChange(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      fd.append(key, String(value));
    });
    onSave(fd);
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="flex items-center justify-between">
        <p className="font-bold text-[#9b5b24]">Edit: {product.name}</p>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X size={17} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name">
          <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
        </Field>
        <Field label="Category">
          <Select value={formData.category} onChange={(e) => handleChange("category", e.target.value)}>
            {productCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Main aroma">
        <Input value={formData.aroma} onChange={(e) => handleChange("aroma", e.target.value)} required />
      </Field>

      <Field label="Description">
        <Textarea value={formData.description} onChange={(e) => handleChange("description", e.target.value)} required />
      </Field>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Price">
          <Input type="number" min={1} value={formData.price} onChange={(e) => handleChange("price", e.target.value)} required />
        </Field>
        <Field label="Promo %">
          <Input type="number" min={0} max={90} value={formData.promoDiscount} onChange={(e) => handleChange("promoDiscount", e.target.value)} />
        </Field>
        <Field label="Stock">
          <Input type="number" min={0} value={formData.stock} onChange={(e) => handleChange("stock", e.target.value)} required />
        </Field>
      </div>

      <Field label="Promo label">
        <Input value={formData.promoLabel} onChange={(e) => handleChange("promoLabel", e.target.value)} />
      </Field>

      <Field label="Image URL">
        <Input type="url" value={formData.imageUrl} onChange={(e) => handleChange("imageUrl", e.target.value)} required />
      </Field>

      <Field label="Image alt">
        <Input value={formData.imageAlt} onChange={(e) => handleChange("imageAlt", e.target.value)} required />
      </Field>

      <Field label="Lead time">
        <Input value={formData.leadTime} onChange={(e) => handleChange("leadTime", e.target.value)} required />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid content-end gap-3 rounded-lg bg-stone-50/80 p-4 text-sm">
          <label className="flex items-center gap-2 font-medium">
            <input type="checkbox" checked={formData.giftCardAvailable} onChange={(e) => handleChange("giftCardAvailable", e.target.checked)} className="h-4 w-4 accent-[#d78b37]" />
            Gift card available
          </label>
          <label className="flex items-center gap-2 font-medium">
            <input type="checkbox" checked={formData.customBuild} onChange={(e) => handleChange("customBuild", e.target.checked)} className="h-4 w-4 accent-[#d78b37]" />
            Custom build
          </label>
        </div>
      </div>

      <Field label="Aroma options (comma separated)">
        <Input value={formData.aromaOptions} onChange={(e) => handleChange("aromaOptions", e.target.value)} required />
      </Field>
      <Field label="Aroma prices (JSON)">
        <Input value={formData.aromaPrices} onChange={(e) => handleChange("aromaPrices", e.target.value)} placeholder='{"option": 5000}' />
      </Field>
      <Field label="Container options (comma separated)">
        <Input value={formData.containerOptions} onChange={(e) => handleChange("containerOptions", e.target.value)} required />
      </Field>
      <Field label="Container prices (JSON)">
        <Input value={formData.containerPrices} onChange={(e) => handleChange("containerPrices", e.target.value)} placeholder='{"option": 10000}' />
      </Field>
      <Field label="Decoration options (comma separated)">
        <Input value={formData.decorationOptions} onChange={(e) => handleChange("decorationOptions", e.target.value)} required />
      </Field>
      <Field label="Decoration prices (JSON)">
        <Input value={formData.decorationPrices} onChange={(e) => handleChange("decorationPrices", e.target.value)} placeholder='{"option": 3000}' />
      </Field>

      <div className="flex gap-2">
        <Button type="submit" variant="warm">Save changes</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

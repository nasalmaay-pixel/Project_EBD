"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

type OilPrice = {
  id: string;
  name: string;
  pricePerLiter: number;
  minVolume: number;
  maxVolume: number;
  isActive: boolean;
};

export function AdminOilPriceManager({ prices }: { prices: OilPrice[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<OilPrice | null>(null);

  async function createPrice(formData: FormData) {
    setMessage("");

    const response = await fetch("/api/admin/oil-prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        pricePerLiter: Number(formData.get("pricePerLiter")),
        minVolume: Number(formData.get("minVolume") || 0),
        maxVolume: Number(formData.get("maxVolume") || 999999),
        isActive: true,
      }),
    });

    if (!response.ok) {
      setMessage("Failed to create price tier.");
      return;
    }

    setMessage("Price tier created.");
    router.refresh();
  }

  async function savePrice() {
    if (!editForm) return;
    setMessage("");

    const response = await fetch("/api/admin/oil-prices", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    if (!response.ok) {
      setMessage("Failed to update price tier.");
      return;
    }

    setMessage("Price tier updated.");
    setEditingId(null);
    setEditForm(null);
    router.refresh();
  }

  async function deletePrice(id: string) {
    setMessage("");

    const response = await fetch("/api/admin/oil-prices", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      setMessage("Failed to delete price tier.");
      return;
    }

    setMessage("Price tier deleted.");
    router.refresh();
  }

  function startEdit(price: OilPrice) {
    setEditingId(price.id);
    setEditForm({ ...price });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <form action={createPrice} className="rounded-lg border border-white/70 bg-white/70 p-5 shadow-lg">
        <div className="flex items-center gap-2">
          <Plus className="text-[#d78b37]" />
          <h3 className="font-display text-2xl font-bold">Add price tier</h3>
        </div>
        <div className="mt-4 grid gap-4">
          <Field label="Name">
            <Input name="name" placeholder="Standard rate" required />
          </Field>
          <Field label="Price per liter (IDR)">
            <Input name="pricePerLiter" type="number" min={1} placeholder="5200" required />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Min volume (L)">
              <Input name="minVolume" type="number" min={0} defaultValue={0} />
            </Field>
            <Field label="Max volume (L)">
              <Input name="maxVolume" type="number" min={1} defaultValue={999999} />
            </Field>
          </div>
          <Button type="submit" variant="warm">Add tier</Button>
        </div>
      </form>

      <div className="rounded-lg border border-white/70 bg-white/70 p-5 shadow-lg">
        <h3 className="font-display text-2xl font-bold">Price tiers</h3>
        <div className="mt-4 space-y-3">
          {prices.map((price) => (
            <div key={price.id} className="rounded-lg bg-white/75 p-4">
              {editingId === price.id && editForm ? (
                <div className="grid gap-3">
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Tier name"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      value={editForm.pricePerLiter}
                      onChange={(e) => setEditForm({ ...editForm, pricePerLiter: Number(e.target.value) })}
                    />
                    <Input
                      type="number"
                      value={editForm.minVolume}
                      onChange={(e) => setEditForm({ ...editForm, minVolume: Number(e.target.value) })}
                      placeholder="Min L"
                    />
                    <Input
                      type="number"
                      value={editForm.maxVolume}
                      onChange={(e) => setEditForm({ ...editForm, maxVolume: Number(e.target.value) })}
                      placeholder="Max L"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="warm" onClick={savePrice}>
                      <Save size={14} />
                    </Button>
                    <Button size="icon" variant="secondary" onClick={cancelEdit}>
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{price.name}</p>
                      {!price.isActive && (
                        <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs">Inactive</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-stone-600">
                      {formatCurrency(price.pricePerLiter)}/L &bull; {price.minVolume}-{price.maxVolume} L
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="secondary" onClick={() => startEdit(price)}>
                      <Save size={14} />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deletePrice(price.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {prices.length === 0 && (
            <p className="text-sm text-stone-500">No price tiers configured.</p>
          )}
        </div>
        {message && <p className="mt-3 text-sm font-semibold text-[#7a3f1d]">{message}</p>}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

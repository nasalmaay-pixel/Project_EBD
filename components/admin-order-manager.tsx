"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

type AdminOrder = {
  id: string;
  status: "PENDING" | "PAID" | "SHIPPED" | "COMPLETED";
  totalPrice: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentReference: string;
  user: { name: string };
};

const orderStatuses = ["PENDING", "SHIPPED", "COMPLETED"] as const;

export function AdminOrderManager({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState("");

  async function updateStatus(orderId: string, formData: FormData) {
    setMessage("");
    setSavingId(orderId);

    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: orderId,
        status: formData.get("status"),
      }),
    }).catch(() => null);

    setSavingId("");

    if (!response?.ok) {
      setMessage("Order status failed to update.");
      return;
    }

    setMessage("Order status updated.");
    router.refresh();
  }

  if (!orders.length) {
    return <p className="rounded-lg bg-white/70 p-4 text-sm text-stone-600">No orders yet.</p>;
  }

  return (
    <div className="space-y-3">
      {orders.slice(0, 8).map((order) => (
        <div key={order.id} className="rounded-lg bg-white/70 p-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <p className="font-semibold">{order.id}</p>
              <p className="text-sm text-stone-600">
                {order.user.name} - {formatCurrency(order.totalPrice)}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9b5b24]">
                {order.paymentMethod.replace("_", " ")} / {order.paymentStatus} / {order.paymentReference}
              </p>
            </div>
            <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
              {order.status}
            </span>
          </div>
          <form action={(formData) => updateStatus(order.id, formData)} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Select name="status" defaultValue={order.status} className="sm:max-w-48">
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
            <Button type="submit" variant="secondary" className="h-12" disabled={savingId === order.id}>
              <Save size={16} />
              {savingId === order.id ? "Saving" : "Update status"}
            </Button>
          </form>
        </div>
      ))}
      {message ? <p className="text-sm font-semibold text-[#7a3f1d]">{message}</p> : null}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

type AdminOilSubmission = {
  id: string;
  quantity: number;
  location: string;
  pickupMethod: "PICKUP" | "DROPOFF";
  schedule: Date;
  status: "PENDING" | "PAID" | "ALREADY_PICK_UP";
  priceEstimate: number;
};

const oilStatuses = ["PENDING", "PAID", "ALREADY_PICK_UP"] as const;

function formatOilStatus(status: AdminOilSubmission["status"]) {
  return status.replaceAll("_", " ");
}

export function AdminOilManager({ submissions }: { submissions: AdminOilSubmission[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState("");

  async function updateStatus(submissionId: string, formData: FormData) {
    setMessage("");
    setSavingId(submissionId);

    const response = await fetch("/api/admin/oil-submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: submissionId,
        status: formData.get("status"),
      }),
    }).catch(() => null);

    setSavingId("");

    if (!response?.ok) {
      setMessage("Oil status failed to update.");
      return;
    }

    setMessage("Oil status updated.");
    router.refresh();
  }

  if (!submissions.length) {
    return <p className="rounded-lg bg-white/70 p-4 text-sm text-stone-600">Belum ada submission minyak.</p>;
  }

  return (
    <div className="space-y-3">
      {submissions.map((item) => (
        <div key={item.id} className="rounded-lg bg-white/70 p-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <p className="font-semibold">{item.quantity} L minyak jelantah</p>
              <p className="text-sm text-stone-600">
                {item.location} - {formatCurrency(item.priceEstimate)}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9b5b24]">
                {item.pickupMethod} /{" "}
                {new Date(item.schedule).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
              {formatOilStatus(item.status)}
            </span>
          </div>
          <form action={(formData) => updateStatus(item.id, formData)} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Select name="status" defaultValue={item.status} className="sm:max-w-52">
              {oilStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatOilStatus(status)}
                </option>
              ))}
            </Select>
            <Button type="submit" variant="secondary" className="h-12" disabled={savingId === item.id}>
              <Save size={16} />
              {savingId === item.id ? "Saving" : "Update status"}
            </Button>
          </form>
        </div>
      ))}
      {message ? <p className="text-sm font-semibold text-[#7a3f1d]">{message}</p> : null}
    </div>
  );
}

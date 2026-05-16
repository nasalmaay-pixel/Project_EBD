"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, Calendar, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";

const DAYS = [
  { value: 0, label: "Minggu" },
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" },
];

type PickupSchedule = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

type BlockedDate = {
  id: string;
  date: string;
  reason: string;
};

export function AdminPickupScheduleManager({
  schedules,
  blockedDates,
}: {
  schedules: PickupSchedule[];
  blockedDates: BlockedDate[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [newBlockedReason, setNewBlockedReason] = useState("");

  // Initialize form state with existing schedules
  const [formData, setFormData] = useState<Record<number, { startTime: string; endTime: string; isActive: boolean }>>(() => {
    const initial: Record<number, { startTime: string; endTime: string; isActive: boolean }> = {};
    for (let i = 0; i < 7; i++) {
      const existing = schedules.find((s) => s.dayOfWeek === i);
      initial[i] = {
        startTime: existing?.startTime ?? "08:00",
        endTime: existing?.endTime ?? "17:00",
        isActive: existing?.isActive ?? false,
      };
    }
    return initial;
  });

  async function saveAll() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/pickup-schedules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      setMessage("Jadwal berhasil disimpan!");
      router.refresh();
    } catch {
      setMessage("Gagal menyimpan jadwal.");
    } finally {
      setSaving(false);
    }
  }

  async function addBlockedDate() {
    if (!newBlockedDate) return;

    try {
      const response = await fetch("/api/admin/pickup-schedules/blocked-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newBlockedDate, reason: newBlockedReason }),
      });

      if (!response.ok) {
        throw new Error("Failed to add blocked date");
      }

      setNewBlockedDate("");
      setNewBlockedReason("");
      router.refresh();
    } catch {
      alert("Gagal menambahkan tanggal yang diblokir.");
    }
  }

  async function removeBlockedDate(id: string) {
    try {
      await fetch(`/api/admin/pickup-schedules/blocked-dates?id=${id}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch {
      alert("Gagal menghapus tanggal.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Schedule by day */}
      <div>
        <h3 className="mb-3 font-semibold">Jadwal pickup per hari</h3>
        <div className="grid gap-3">
          {DAYS.map(({ value, label }) => (
            <div
              key={value}
              className="flex items-center gap-4 rounded-lg border bg-white/50 p-3"
            >
              <div className="w-20 font-semibold">{label}</div>
              <Input
                type="time"
                value={formData[value].startTime}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    [value]: { ...prev[value], startTime: e.target.value },
                  }))
                }
                className="w-32"
                disabled={!formData[value].isActive}
              />
              <span className="text-stone-500">-</span>
              <Input
                type="time"
                value={formData[value].endTime}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    [value]: { ...prev[value], endTime: e.target.value },
                  }))
                }
                className="w-32"
                disabled={!formData[value].isActive}
              />
              <Toggle
                pressed={formData[value].isActive}
                onPressedChange={(pressed) =>
                  setFormData((prev) => ({
                    ...prev,
                    [value]: { ...prev[value], isActive: pressed },
                  }))
                }
                className="ml-auto"
              >
                {formData[value].isActive ? (
                  <span className="text-xs font-semibold text-green-600">Aktif</span>
                ) : (
                  <span className="text-xs font-semibold text-stone-400">Nonaktif</span>
                )}
              </Toggle>
            </div>
          ))}
        </div>
        <Button onClick={saveAll} disabled={saving} className="mt-4 w-full">
          <Save size={16} />
          {saving ? "Menyimpan..." : "Simpan Jadwal Pickup"}
        </Button>
      </div>

      {/* Blocked dates */}
      <div className="border-t pt-4">
        <h3 className="mb-3 font-semibold">Tanggal yang diblokir (hari libur)</h3>
        <div className="mb-3 flex gap-2">
          <Input
            type="date"
            value={newBlockedDate}
            onChange={(e) => setNewBlockedDate(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Alasan (opsional)"
            value={newBlockedReason}
            onChange={(e) => setNewBlockedReason(e.target.value)}
            className="flex-1"
          />
          <Button type="button" onClick={addBlockedDate} variant="outline">
            <Plus size={16} />
          </Button>
        </div>
        {blockedDates.length > 0 ? (
          <div className="space-y-2">
            {blockedDates.map((blocked) => (
              <div
                key={blocked.id}
                className="flex items-center justify-between rounded-lg bg-red-50 p-3"
              >
                <div>
                  <p className="font-semibold">
                    {new Date(blocked.date).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  {blocked.reason && (
                    <p className="text-sm text-stone-500">{blocked.reason}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeBlockedDate(blocked.id)}
                  className="rounded-full p-2 text-red-500 hover:bg-red-100"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-500">Tidak ada tanggal yang diblokir.</p>
        )}
      </div>

      {message && (
        <p
          className={`text-sm font-semibold ${
            message.includes("berhasil") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

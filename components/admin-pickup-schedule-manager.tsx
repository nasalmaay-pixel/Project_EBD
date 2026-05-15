"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, Calendar, X } from "lucide-react";
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

export function AdminPickupScheduleManager({ schedules }: { schedules: PickupSchedule[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // Initialize form state with existing schedules
  const [formData, setFormData] = useState<Record<number, { startTime: string; endTime: string; isActive: boolean }>>(() => {
    const initial: Record<number, { startTime: string; endTime: string; isActive: boolean }> = {};
    for (let i = 0; i < 7; i++) {
      const existing = schedules.find(s => s.dayOfWeek === i);
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

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {DAYS.map(({ value, label }) => (
          <div key={value} className="flex items-center gap-4 rounded-lg border bg-white/50 p-3">
            <div className="w-20 font-semibold">{label}</div>
            <Input
              type="time"
              value={formData[value].startTime}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                [value]: { ...prev[value], startTime: e.target.value },
              }))}
              className="w-32"
              disabled={!formData[value].isActive}
            />
            <span className="text-stone-500">-</span>
            <Input
              type="time"
              value={formData[value].endTime}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                [value]: { ...prev[value], endTime: e.target.value },
              }))}
              className="w-32"
              disabled={!formData[value].isActive}
            />
            <Toggle
              pressed={formData[value].isActive}
              onPressedChange={(pressed) => setFormData(prev => ({
                ...prev,
                [value]: { ...prev[value], isActive: pressed },
              }))}
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

      <Button onClick={saveAll} disabled={saving} className="w-full">
        <Save size={16} />
        {saving ? "Menyimpan..." : "Simpan Jadwal Pickup"}
      </Button>

      {message && (
        <p className={`text-sm font-semibold ${message.includes("berhasil") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
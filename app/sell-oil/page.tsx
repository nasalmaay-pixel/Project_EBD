"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Camera, CalendarClock, CheckCircle2, ImageUp, MapPin, Sparkles, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

type OilPriceTier = {
  id: string;
  name: string;
  pricePerLiter: number;
  minVolume: number;
  maxVolume: number;
};

const paymentMethods = [
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "E_WALLET", label: "E-Wallet" },
  { value: "QRIS", label: "QRIS" },
];

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

type PickupSchedule = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

const timeSlots = [
  { value: "08:00", label: "08:00 - 10:00" },
  { value: "10:00", label: "10:00 - 12:00" },
  { value: "13:00", label: "13:00 - 15:00" },
  { value: "15:00", label: "15:00 - 17:00" },
  { value: "17:00", label: "17:00 - 19:00" },
];

export default function SellOilPage() {
  const [quantity, setQuantity] = useState("12");
  const [preview, setPreview] = useState("");
  const [aiEstimate, setAiEstimate] = useState<{
    liters: number;
    confidence: number;
    note: string;
    source: string;
  } | null>(null);
  const [aiError, setAiError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    location: string;
    quantity: number;
    estimate: number;
    points: number;
  } | null>(null);
  const [scheduleError, setScheduleError] = useState("");
  const [priceTiers, setPriceTiers] = useState<OilPriceTier[]>([]);
  const [schedules, setSchedules] = useState<PickupSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const availableTimeSlots = useMemo(() => getTimeSlotsForDate(selectedDate), [selectedDate, schedules]);
  const quantityValue = useMemo(() => parseOilQuantity(quantity), [quantity]);
  const estimate = useMemo(() => calculateEstimate(quantityValue, priceTiers), [quantityValue, priceTiers]);
  const highlights: { Icon: LucideIcon; title: string; body: string }[] = [];

  useEffect(() => {
    Promise.all([
      fetch("/api/oil-prices"),
      fetch("/api/pickup-schedules"),
    ]).then(([pricesRes, schedulesRes]) =>
      Promise.all([pricesRes.json(), schedulesRes.json()])
    ).then(([pricesData, schedulesData]) => {
      if (pricesData.prices && Array.isArray(pricesData.prices)) {
        setPriceTiers(pricesData.prices);
      }
      if (schedulesData.schedules && Array.isArray(schedulesData.schedules)) {
        setSchedules(schedulesData.schedules);
      }
    }).catch(() => {
      // Silently fail, use fallback calculation
    });
  }, []);

  async function submit(formData: FormData) {
    const scheduleDateRaw = formData.get("scheduleDate") as string;
    const scheduleTimeSlot = formData.get("schedule") as string;

    // Validate date against schedule
    if (scheduleDateRaw) {
      const date = new Date(scheduleDateRaw);
      const dayOfWeek = date.getDay();
      const schedule = schedules.find(s => s.dayOfWeek === dayOfWeek && s.isActive);

      if (!schedule) {
        const dayName = DAYS[dayOfWeek];
        setScheduleError(`Pickup tidak tersedia di hari ${dayName}. Pilih tanggal lain.`);
        return;
      }

      // Check if time slot is within schedule hours
      const slotHour = parseInt(scheduleTimeSlot?.split(":")[0] || "10", 10);
      const startHour = parseInt(schedule.startTime.split(":")[0], 10);
      const endHour = parseInt(schedule.endTime.split(":")[0], 10);

      if (slotHour < startHour || slotHour >= endHour) {
        setScheduleError(`Waktu pickup harus antara ${schedule.startTime} - ${schedule.endTime}.`);
        return;
      }
    }

    setScheduleError("");

    const payload = {
      name: formData.get("name"),
      phoneNumber: formData.get("phoneNumber"),
      accountNumber: formData.get("accountNumber"),
      location: formData.get("location"),
      quantity: parseOilQuantity(formData.get("quantity")),
      pickupMethod: formData.get("pickupMethod"),
      paymentMethod: formData.get("paymentMethod"),
      scheduleDate: scheduleDateRaw,
      schedule: scheduleTimeSlot,
    };

    const response = await fetch("/api/oil-submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    const result = await response?.json().catch(() => null) as { points?: number } | null;
    setSubmissionResult({
      location: String(payload.location ?? ""),
      quantity: payload.quantity,
      estimate: calculateEstimate(payload.quantity, priceTiers),
      points: result?.points ?? Math.max(Math.floor(payload.quantity), 1),
    });
    setScheduleError("");
  }

  async function predictOil(file: File | null) {
    if (!file) {
      return;
    }

    setAiLoading(true);
    setAiEstimate(null);
    setAiError("");

    const image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    setPreview(image);

    const response = await fetch("/api/ai/oil-estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image, mimeType: file.type || "image/jpeg" }),
    }).catch(() => null);
    const result = await response?.json().catch(() => null) as {
      liters?: number;
      confidence?: number;
      note?: string;
      source?: string;
      error?: string;
      detail?: string;
    } | null;

    const liters = Number(result?.liters ?? 0);
    setAiLoading(false);

    if (!response?.ok || result?.error) {
      setAiError(result?.detail ?? result?.error ?? "Gemini belum bisa memproses gambar.");
      return;
    }

    if (!liters) {
      setAiError("Gemini tidak mengembalikan angka liter. Coba foto yang lebih jelas.");
      return;
    }

    setAiEstimate({
      liters,
      confidence: result?.confidence ?? 60,
      note: result?.note ?? "Estimasi volume berhasil dibuat.",
      source: result?.source ?? "gemini",
    });
  }

  function getNextAvailableDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find the next day that has an active schedule
    for (let i = 0; i < 30; i++) {
      const date = new Date(tomorrow);
      date.setDate(tomorrow.getDate() + i);
      const dayOfWeek = date.getDay();
      const hasSchedule = schedules.some(s => s.dayOfWeek === dayOfWeek && s.isActive);
      if (hasSchedule) {
        return date;
      }
    }

    // Fallback to tomorrow if no schedules exist
    return tomorrow;
  }

  function isDateAvailable(date: Date) {
    const dayOfWeek = date.getDay();
    return schedules.some(s => s.dayOfWeek === dayOfWeek && s.isActive);
  }

  function getMinScheduleDate() {
    return getNextAvailableDate();
  }

  function getMaxScheduleDate() {
    const future = new Date();
    future.setDate(future.getDate() + 60);
    return future;
  }

  function getTimeSlotsForDate(dateStr: string) {
    if (!dateStr) return timeSlots;

    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const schedule = schedules.find(s => s.dayOfWeek === dayOfWeek);

    if (!schedule) return timeSlots;

    // Filter time slots based on schedule hours
    return timeSlots.filter(slot => {
      const slotHour = parseInt(slot.value.split(":")[0], 10);
      const startHour = parseInt(schedule.startTime.split(":")[0], 10);
      const endHour = parseInt(schedule.endTime.split(":")[0], 10);
      return slotHour >= startHour && slotHour < endHour;
    });
  }

  function formatScheduleDate(date: Date) {
    return date.toISOString().split("T")[0];
  }

  return (
    <main className="min-h-screen px-4 pb-20 pt-32">
      <SiteNav />
      <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#9b5b24]">Jelantah Pay</p>
          <h1 className="mt-4 font-display text-6xl font-bold leading-none text-balance">
            Turn jelantah into tracked earnings.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600">
            Submit location, volume, pickup method, and schedule. CandleX estimates pricing with dynamic volume-based logic and moves your pickup through three clear statuses.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {highlights.map(({ Icon, title, body }) => (
              <Card key={title}>
                <CardHeader>
                  <Icon className="text-[#d78b37]" />
                  <h3 className="font-semibold">{title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-stone-600">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {priceTiers.length > 0 && (
            <div className="mt-6 rounded-lg border border-[#d78b37]/30 bg-amber-50/50 p-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[#9b5b24]">Price tiers</h3>
              <div className="mt-3 space-y-1 text-sm text-stone-600">
                {priceTiers.map((tier) => (
                  <p key={tier.id}>{tier.minVolume}-{tier.maxVolume} L: {formatCurrency(tier.pricePerLiter)}/L</p>
                ))}
              </div>
            </div>
          )}
        </div>

        <form action={submit} className="glass rounded-lg p-6">
          <div className="grid gap-5">
            <div className="rounded-lg border border-white/70 bg-stone-950 p-5 text-amber-50 shadow-xl shadow-stone-900/10">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.22em] text-amber-200">
                    <Sparkles size={16} />
                    Gemini AI predictor
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-bold">Prediksi liter dari foto.</h2>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => uploadInputRef.current?.click()}>
                    <ImageUp size={16} />
                    Upload
                  </Button>
                  <Button type="button" variant="warm" onClick={() => cameraInputRef.current?.click()}>
                    <Camera size={16} />
                    Camera
                  </Button>
                </div>
              </div>
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => predictOil(event.target.files?.[0] ?? null)}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) => predictOil(event.target.files?.[0] ?? null)}
              />
              <div className="mt-5 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                <div className="aspect-video overflow-hidden rounded-lg bg-white/10">
                  {preview ? (
                    <img src={preview} alt="Uploaded used cooking oil preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center px-5 text-center text-sm text-amber-50/70">
                      Upload foto wadah minyak jelantah atau gunakan kamera.
                    </div>
                  )}
                </div>
                <div className="rounded-lg bg-white/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200">AI output</p>
                  {aiEstimate ? (
                    <>
                      <div className="mt-3 flex items-end gap-2">
                        <p className="font-display text-6xl font-bold leading-none">{aiEstimate.liters}</p>
                        <p className="pb-2 text-xl font-semibold">L</p>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
                        <div className="h-full rounded-full bg-[#d78b37]" style={{ width: `${aiEstimate.confidence}%` }} />
                      </div>
                      <p className="mt-2 text-xs text-amber-50/75">
                        Confidence {aiEstimate.confidence}% / {aiEstimate.source === "gemini" ? "Gemini" : "Demo"}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-amber-50/80">{aiEstimate.note}</p>
                      <Button type="button" variant="secondary" className="mt-4 w-full" onClick={() => setQuantity(String(aiEstimate.liters))}>
                        Use this estimate
                      </Button>
                    </>
                  ) : (
                    <div className="mt-5 rounded-lg border border-dashed border-white/20 p-4 text-sm leading-6 text-amber-50/70">
                      {aiLoading
                        ? "Gemini sedang membaca gambar..."
                        : aiError
                          ? aiError
                          : "Angka prediksi akan muncul di sini setelah foto diproses."}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-semibold">Full name</span>
              <Input name="name" placeholder="Budi Santoso" required />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Phone number</span>
              <Input name="phoneNumber" type="tel" placeholder="081234567890" required />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Payment method</span>
              <Select name="paymentMethod" defaultValue="QRIS">
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </Select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Account number</span>
              <Input name="accountNumber" placeholder="1234567890" required />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Location</span>
              <Input name="location" placeholder="Jl. Kemang Raya, Jakarta Selatan" required />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold">Quantity (liters)</span>
                <Input
                  name="quantity"
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]+([,.][0-9]+)?"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="Contoh: 1,5"
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold">Pickup method</span>
                <Select name="pickupMethod" defaultValue="PICKUP">
                  <option value="PICKUP">Pickup (kami datang)</option>
                  <option value="DROPOFF">Drop-off (antar sendiri)</option>
                </Select>
              </label>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold">Schedule date</span>
                <Input
                  name="scheduleDate"
                  type="date"
                  min={formatScheduleDate(getMinScheduleDate())}
                  max={formatScheduleDate(getMaxScheduleDate())}
                  required
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setScheduleError("");
                  }}
                />
                {scheduleError && (
                  <p className="text-sm text-red-500">{scheduleError}</p>
                )}
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold">Schedule time slot</span>
                <Select name="schedule">
                  {availableTimeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </Select>
              </label>
            </div>
            <div className="rounded-lg bg-stone-950 p-5 text-amber-50 pointer-events-none select-none">
              <p className="text-sm uppercase tracking-[0.22em] text-amber-200">Price estimate</p>
              <p className="mt-2 font-display text-4xl font-bold">{formatCurrency(estimate)}</p>
            </div>
            <Button variant="warm" size="lg" type="submit">
              Request pickup
            </Button>
          </div>
        </form>
      </section>
      {submissionResult ? (
        <PickupOverlay result={submissionResult} onClose={() => setSubmissionResult(null)} />
      ) : null}
    </main>
  );
}

function parseOilQuantity(value: FormDataEntryValue | string | null) {
  const quantity = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(quantity) ? quantity : 0;
}

function calculateEstimate(liters: number, priceTiers: OilPriceTier[]) {
  if (liters <= 0) return 0;

  if (priceTiers.length > 0) {
    const tier = priceTiers.find(
      (t) => liters >= t.minVolume && liters <= t.maxVolume,
    );
    if (tier) {
      return Math.round(liters * tier.pricePerLiter);
    }
  }

  // Fallback to static calculation
  const baseRate = 5200;
  const volumeBonus = liters >= 25 ? 1.12 : liters >= 10 ? 1.06 : 1;
  return Math.round(liters * baseRate * volumeBonus);
}

function PickupOverlay({
  result,
  onClose,
}: {
  result: { location: string; quantity: number; estimate: number; points: number };
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-stone-950/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg bg-[#fffaf0] p-6 shadow-2xl shadow-stone-950/30">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4f6f52] text-white">
          <CheckCircle2 size={28} />
        </div>
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.22em] text-[#9b5b24]">Pickup requested</p>
        <h2 className="mt-2 font-display text-4xl font-bold">Jelantah Pay is tracking it.</h2>
        <div className="mt-5 grid gap-3 rounded-lg bg-white/75 p-4 text-sm">
          <p>
            <span className="font-semibold">Location:</span> {result.location}
          </p>
          <p>
            <span className="font-semibold">Volume:</span> {result.quantity} L
          </p>
          <p>
            <span className="font-semibold">Estimate:</span> {formatCurrency(result.estimate)}
          </p>
          <p>
            <span className="font-semibold">Points earned:</span> {result.points}
          </p>
          <p>
            <span className="font-semibold">Status:</span> PENDING - Menunggu konfirmasi pembayaran
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
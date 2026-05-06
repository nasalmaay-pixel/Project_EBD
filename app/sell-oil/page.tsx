"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, CheckCircle2, MapPin, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { estimateOilPrice, formatCurrency } from "@/lib/utils";

export default function SellOilPage() {
  const [quantity, setQuantity] = useState(12);
  const [submissionResult, setSubmissionResult] = useState<{
    location: string;
    quantity: number;
    estimate: number;
    points: number;
  } | null>(null);
  const estimate = useMemo(() => estimateOilPrice(quantity), [quantity]);
  const highlights: { Icon: LucideIcon; title: string; body: string }[] = [
    { Icon: MapPin, title: "Coverage", body: "Pickup or drop-off" },
    { Icon: CalendarClock, title: "Tracking", body: "Requested to completed" },
    { Icon: Wallet, title: "Estimate", body: "Rp5.200/L + bonus" },
  ];

  async function submit(formData: FormData) {
    const payload = {
      location: formData.get("location"),
      quantity: Number(formData.get("quantity")),
      pickupMethod: formData.get("pickupMethod"),
      schedule: formData.get("schedule"),
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
      estimate: estimateOilPrice(payload.quantity),
      points: result?.points ?? Math.max(Math.floor(payload.quantity), 1),
    });
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
            Submit location, volume, pickup method, and schedule. CandleX estimates pricing with static volume-based logic and moves your pickup through four clear statuses.
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
        </div>

        <form action={submit} className="glass rounded-lg p-6">
          <div className="grid gap-5">
            <label className="space-y-2">
              <span className="text-sm font-semibold">Location</span>
              <Input name="location" placeholder="Jl. Kemang Raya, Jakarta Selatan" required />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold">Quantity (liters)</span>
                <Input
                  name="quantity"
                  type="number"
                  min={1}
                  step={0.5}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold">Pickup method</span>
                <Select name="pickupMethod" defaultValue="PICKUP">
                  <option value="PICKUP">Pickup</option>
                  <option value="DROPOFF">Drop-off</option>
                </Select>
              </label>
            </div>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Schedule</span>
              <Input name="schedule" type="datetime-local" required />
            </label>
            <div className="rounded-lg bg-stone-950 p-5 text-amber-50">
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
            <span className="font-semibold">Status:</span> REQUESTED
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

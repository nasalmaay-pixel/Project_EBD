"use client";

import { useMemo, useState } from "react";
import { CalendarClock, MapPin, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { estimateOilPrice, formatCurrency } from "@/lib/utils";

export default function SellOilPage() {
  const [quantity, setQuantity] = useState(12);
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

    await fetch("/api/oil-submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    alert("Oil submission requested. Tracking starts at REQUESTED.");
  }

  return (
    <main className="min-h-screen px-4 pb-20 pt-32">
      <SiteNav />
      <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#9b5b24]">Sell used oil</p>
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
    </main>
  );
}

import Link from "next/link";
import { CreditCard, Gift, Package, Truck, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

function orderItemsLabel(order: {
  items: { quantity: number; product: { name: string } }[];
}) {
  return order.items.map((item) => `${item.product.name} x${item.quantity}`).join(", ");
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  const [oilSubmissions, orders] = await Promise.all([
    prisma.oilSubmission.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const earnings = oilSubmissions.reduce((sum, item) => sum + item.priceEstimate, 0);
  const orderSpend = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const waitingPayments = orders.filter((order) => order.paymentStatus === "WAITING_PAYMENT").length;
  const stats: { Icon: LucideIcon; label: string; value: string; rawValue: number }[] = [
    { Icon: Wallet, label: "Oil earnings", value: formatCurrency(earnings), rawValue: earnings },
    { Icon: Truck, label: "Active pickups", value: `${oilSubmissions.length}`, rawValue: oilSubmissions.length },
    { Icon: Package, label: "Buyer orders", value: `${orders.length}`, rawValue: orders.length },
    { Icon: CreditCard, label: "Waiting payment", value: `${waitingPayments}`, rawValue: waitingPayments },
    { Icon: Gift, label: "Circular points", value: `${user.points}`, rawValue: user.points },
  ].filter((stat) => stat.rawValue > 0);

  return (
    <main className="min-h-screen px-4 pb-20 pt-32">
      <SiteNav />
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#9b5b24]">Customer dashboard</p>
            <h1 className="mt-4 font-display text-6xl font-bold">Welcome, {user.name}.</h1>
            <p className="mt-4 max-w-2xl leading-7 text-stone-600">
              Track your candle orders, payment status, oil pickup requests, and circular-living updates.
            </p>
          </div>
          <LogoutButton />
        </div>

        {stats.length ? (
        <div className="mt-10 grid gap-4 md:grid-cols-5">
          {stats.map(({ Icon, label, value }) => (
            <Card key={label}>
              <CardHeader>
                <Icon className="text-[#d78b37]" />
                <p className="text-sm text-stone-500">{label}</p>
              </CardHeader>
              <CardContent>
                <p className="font-display text-4xl font-bold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        ) : null}

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <h2 className="font-display text-3xl font-bold">Order and payment</h2>
              {orderSpend > 0 ? (
                <p className="text-sm text-stone-600">Total spend: {formatCurrency(orderSpend)}</p>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-3">
              {orders.length ? orders.map((order) => (
                <div key={order.id} className="rounded-lg bg-white/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold">{order.id}</p>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-stone-600">
                    {orderItemsLabel(order)} - {formatCurrency(order.totalPrice)}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9b5b24]">
                    {order.paymentMethod.replace("_", " ")} / {order.paymentStatus} / {order.paymentReference}
                  </p>
                </div>
              )) : (
                <p className="rounded-lg bg-white/70 p-4 text-sm text-stone-600">
                  No orders yet. Visit the marketplace to start a candle order.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-3xl font-bold">Oil submission</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {oilSubmissions.length ? oilSubmissions.map((item) => (
                <div key={`${item.location}-${item.schedule}`} className="rounded-lg bg-white/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold">{item.location}</p>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-stone-600">
                    {item.quantity} L - {item.pickupMethod} - {formatCurrency(item.priceEstimate)}
                  </p>
                </div>
              )) : (
                <p className="rounded-lg bg-white/70 p-4 text-sm text-stone-600">
                  No oil submissions yet.
                </p>
              )}
              <Link href="/sell-oil">
                <Button variant="secondary" className="w-full">
                  <Truck size={16} />
                  Request pickup
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

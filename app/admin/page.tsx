import { Boxes, CalendarDays, ClipboardList, CreditCard, LineChart, PackageCheck, Users, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { AdminOrderManager } from "@/components/admin-order-manager";
import { AdminProductManager } from "@/components/admin-product-manager";
import { LogoutButton } from "@/components/logout-button";
import { SiteNav } from "@/components/site-nav";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { productFromDb } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [productRows, orders, oilSubmissions, userCount] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.order.findMany({
      include: { user: true, items: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.oilSubmission.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);

  const products = productRows.map(productFromDb);
  const omzet = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const estimatedProfit = omzet * 0.38;
  const waitingPayments = orders.filter((order) => order.paymentStatus === "WAITING_PAYMENT").length;
  const monthlyRevenue = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const month = date.toLocaleString("en", { month: "short" });
    const value = orders
      .filter((order) => {
        const createdAt = new Date(order.createdAt);
        return createdAt.getMonth() === date.getMonth() && createdAt.getFullYear() === date.getFullYear();
      })
      .reduce((sum, order) => sum + order.totalPrice, 0);

    return { month, value };
  });
  const maxRevenue = Math.max(...monthlyRevenue.map((item) => item.value), 1);
  const calendarItems = [
    ...orders.slice(0, 4).map((order) => ({
      date: order.createdAt,
      title: `Order ${order.id.slice(0, 8)}`,
      meta: `${order.user.name} / ${formatCurrency(order.totalPrice)}`,
    })),
    ...oilSubmissions.slice(0, 4).map((item) => ({
      date: item.schedule,
      title: `${item.quantity} L oil ${item.pickupMethod.toLowerCase()}`,
      meta: item.location,
    })),
  ].sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date))).slice(0, 6);
  const stats: { Icon: LucideIcon; label: string; value: number }[] = [
    { Icon: Boxes, label: "Products", value: products.length },
    { Icon: PackageCheck, label: "Orders", value: orders.length },
    { Icon: ClipboardList, label: "Oil submissions", value: oilSubmissions.length },
    { Icon: Users, label: "Users", value: userCount },
  ].filter((stat) => stat.value > 0);
  const financialStats = [
    { Icon: Wallet, label: "Omset", value: formatCurrency(omzet), rawValue: omzet },
    { Icon: LineChart, label: "Estimasi laba 38%", value: formatCurrency(estimatedProfit), rawValue: estimatedProfit },
    { Icon: CreditCard, label: "Menunggu pembayaran", value: `${waitingPayments}`, rawValue: waitingPayments },
  ].filter((stat) => stat.rawValue > 0);

  return (
    <main className="min-h-screen px-4 pb-20 pt-32">
      <SiteNav />
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#9b5b24]">Admin panel</p>
            <h1 className="mt-4 font-display text-6xl font-bold">Operate the CandleX loop.</h1>
            <p className="mt-4 max-w-2xl leading-7 text-stone-600">
              Protected by admin email and password. Customer navigation does not expose this panel.
            </p>
          </div>
          <LogoutButton />
        </div>
        {stats.length ? (
        <div className="mt-10 grid gap-4 md:grid-cols-4">
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

        {financialStats.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {financialStats.map(({ Icon, label, value }) => (
            <Card key={label}>
              <CardHeader>
                <Icon className="text-[#4f6f52]" />
                <p className="text-sm text-stone-500">{label}</p>
              </CardHeader>
              <CardContent>
                <p className="font-display text-3xl font-bold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        ) : null}

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <Card>
            <CardHeader>
              <h2 className="font-display text-3xl font-bold">Grafik omset 6 bulan</h2>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-end gap-4 rounded-lg bg-stone-50/80 p-5">
                {monthlyRevenue.map((item) => (
                  <div key={item.month} className="flex h-full flex-1 flex-col justify-end gap-3">
                    <div
                      className="min-h-3 rounded-t-lg bg-[#d78b37]"
                      style={{ height: `${Math.max((item.value / maxRevenue) * 100, item.value ? 8 : 3)}%` }}
                      title={`${item.month}: ${formatCurrency(item.value)}`}
                    />
                    <div className="text-center">
                      <p className="text-xs font-bold text-stone-700">{item.month}</p>
                      <p className="mt-1 text-[11px] text-stone-500">{formatCurrency(item.value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CalendarDays className="text-[#d78b37]" />
              <h2 className="font-display text-3xl font-bold">Penanggalan aktivitas</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {calendarItems.length ? calendarItems.map((item) => (
                <div key={`${item.title}-${item.meta}`} className="rounded-lg bg-white/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9b5b24]">
                    {new Date(item.date).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="mt-2 font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-stone-600">{item.meta}</p>
                </div>
              )) : (
                <p className="rounded-lg bg-white/70 p-4 text-sm text-stone-600">Belum ada aktivitas.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-10">
          <AdminProductManager products={products} />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <h2 className="font-display text-3xl font-bold">Manage orders</h2>
            </CardHeader>
            <CardContent>
              <AdminOrderManager orders={orders} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="font-display text-3xl font-bold">Manage oil</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {oilSubmissions.length ? oilSubmissions.map((item) => (
                <div key={item.location} className="rounded-lg bg-white/70 p-4">
                  <div className="flex justify-between">
                    <p className="font-semibold">{item.quantity} L</p>
                    <span className="text-xs font-bold text-[#9b5b24]">{item.status}</span>
                  </div>
                  <p className="text-sm text-stone-600">{item.location}</p>
                </div>
              )) : (
                <p className="rounded-lg bg-white/70 p-4 text-sm text-stone-600">Belum ada submission minyak.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

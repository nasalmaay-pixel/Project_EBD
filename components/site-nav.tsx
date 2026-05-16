"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  LayoutDashboard,
  LogIn,
  Menu,
  MessageCircle,
  PackageCheck,
  ShoppingBag,
  Store,
  Tag,
  Truck,
  WalletCards,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { label: "Marketplace", href: "/marketplace", Icon: Store },
  { label: "Jelantah Pay", href: "/sell-oil", Icon: WalletCards },
  { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
  { label: "Awareness", href: "/awareness", Icon: BookOpen },
] satisfies { label: string; href: string; Icon: LucideIcon }[];

const CART_KEY = "candlex_cart";
const CART_EVENT = "candlex-cart-change";
const SUPPORT_URL = "https://wa.me/6285232696528?text=Halo%20CandleX%2C%20saya%20butuh%20bantuan.";

type NavUser = {
  name: string;
  role: "SELLER" | "BUYER" | "ADMIN";
};

type ReminderProduct = {
  id: string;
  name: string;
  promoLabel?: string;
  promoDiscount?: number;
};

type ReminderOrder = {
  id: string;
  status: string;
  paymentStatus: string;
  totalPrice: number;
};

type ReminderOilSubmission = {
  id: string;
  status: string;
  quantity: number;
  location: string;
};

function getCartQuantity() {
  if (typeof window === "undefined") {
    return 0;
  }

  try {
    const items = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]") as { quantity?: number }[];
    return items.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  } catch {
    return 0;
  }
}

export function SiteNav() {
  const [cartQuantity, setCartQuantity] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [user, setUser] = useState<NavUser | null>(null);
  const hasCart = cartQuantity > 0;

  useEffect(() => {
    const syncCart = () => setCartQuantity(getCartQuantity());

    syncCart();
    window.addEventListener(CART_EVENT, syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener(CART_EVENT, syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((result: { user?: NavUser | null }) => {
        if (active) {
          setUser(result.user ?? null);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4">
      <div className="mx-auto flex max-w-7xl items-start gap-3">
      <nav className="flex-1 rounded-3xl border border-white/65 bg-[#fffaf0]/75 px-4 py-3 shadow-lg shadow-stone-900/5 backdrop-blur-xl md:rounded-full">
        <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-stone-950">
          <img
            src="/images/logo.png"
            alt="CandleX Logo"
            className="h-9 w-9 rounded-full object-cover"
          />
          <span>CandleX</span>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {links.map(({ label, href, Icon }) => {
            const targetHref = label === "Dashboard" && !user ? "/login?next=/dashboard" : href;

            return (
            <Link
              key={href}
              href={targetHref}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-white/70 hover:text-stone-950"
            >
              <Icon size={16} />
              {label}
            </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Open reminders"
            aria-expanded={remindersOpen}
            onClick={() => setRemindersOpen((current) => !current)}
            className={cn(buttonVariants({ variant: "secondary", size: "icon" }), "relative h-10 w-10")}
          >
            <Bell size={17} />
            {hasCart ? (
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#d78b37] ring-2 ring-[#fffaf0]" />
            ) : null}
          </button>
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "secondary", size: "default" }), "hidden h-10 md:inline-flex")}
          >
            <MessageCircle size={16} />
            Support
          </a>
          {hasCart ? (
          <Link
            href="/checkout"
            className={cn(buttonVariants({ variant: "default", size: "default" }), "h-10")}
          >
            <ShoppingBag size={16} />
            Cart
            <span className="ml-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-amber-100 px-1 text-xs font-bold text-stone-950">
              {cartQuantity}
            </span>
          </Link>
          ) : null}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
            className={cn(buttonVariants({ variant: "secondary", size: "icon" }), "h-10 w-10 md:hidden")}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        </div>
        {remindersOpen ? (
          <ReminderPanel cartQuantity={cartQuantity} onClose={() => setRemindersOpen(false)} />
        ) : null}
        {menuOpen ? (
          <div className="mt-3 grid gap-2 border-t border-stone-200/70 pt-3 md:hidden">
            {links.map(({ label, href, Icon }) => (
              <Link
                key={href}
                href={label === "Dashboard" && !user ? "/login?next=/dashboard" : href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-white/70 hover:text-stone-950"
              >
                <Icon size={17} />
                {label}
              </Link>
            ))}
            {user ? (
              <Link
                href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 text-sm font-semibold text-stone-700"
              >
                <LogIn size={17} />
                {user.name}
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl bg-[#d78b37] px-4 py-3 text-sm font-semibold text-white"
              >
                <LogIn size={17} />
                Login
              </Link>
            )}
            {hasCart ? (
              <Link
                href="/checkout"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-amber-50"
              >
                <ShoppingBag size={17} />
                Cart
                <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-amber-100 px-1 text-xs font-bold text-stone-950">
                  {cartQuantity}
                </span>
              </Link>
            ) : null}
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-2xl bg-[#4f6f52] px-4 py-3 text-sm font-semibold text-white"
            >
              <MessageCircle size={17} />
              Customer support
            </a>
          </div>
        ) : null}
      </nav>
      <div className="hidden shrink-0 md:flex">
        {user ? (
          <Link
            href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
            className={cn(buttonVariants({ variant: "secondary", size: "default" }), "h-10 max-w-36 rounded-full border border-white/65 bg-[#fffaf0]/75 px-4 shadow-lg shadow-stone-900/5 backdrop-blur-xl")}
          >
            <span className="truncate">{user.name}</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "warm", size: "default" }), "h-10 rounded-full px-4 shadow-lg shadow-amber-900/20")}
          >
            <LogIn size={16} />
            Login
          </Link>
        )}
      </div>
      </div>
    </header>
  );
}

function ReminderPanel({
  cartQuantity,
  onClose,
}: {
  cartQuantity: number;
  onClose: () => void;
}) {
  const [promos, setPromos] = useState<ReminderProduct[]>([]);
  const [orders, setOrders] = useState<ReminderOrder[]>([]);
  const [oilSubmissions, setOilSubmissions] = useState<ReminderOilSubmission[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadReminders() {
      const [productResponse, orderResponse, oilResponse] = await Promise.all([
        fetch("/api/products").catch(() => null),
        fetch("/api/orders").catch(() => null),
        fetch("/api/oil-submissions").catch(() => null),
      ]);

      if (!active) {
        return;
      }

      if (productResponse?.ok) {
        const productResult = await productResponse.json().catch(() => ({ products: [] })) as {
          products?: ReminderProduct[];
        };
        setPromos((productResult.products ?? []).filter((product) => (product.promoDiscount ?? 0) > 0).slice(0, 3));
      }

      if (orderResponse?.ok) {
        const orderResult = await orderResponse.json().catch(() => ({ orders: [] })) as {
          orders?: ReminderOrder[];
        };
        setOrders((orderResult.orders ?? []).slice(0, 3));
      }

      if (oilResponse?.ok) {
        const oilResult = await oilResponse.json().catch(() => ({ submissions: [] })) as {
          submissions?: ReminderOilSubmission[];
        };
        setOilSubmissions((oilResult.submissions ?? []).slice(0, 3));
      }

      setLoaded(true);
    }

    loadReminders();

    return () => {
      active = false;
    };
  }, []);

  const hasContent = cartQuantity > 0 || promos.length > 0 || orders.length > 0 || oilSubmissions.length > 0;

  return (
    <div className="absolute right-4 top-[calc(100%+0.75rem)] w-[calc(100vw-2rem)] max-w-md rounded-3xl border border-white/70 bg-[#fffaf0]/95 p-4 shadow-2xl shadow-stone-950/15 backdrop-blur-xl">
      <div className="grid max-h-[70vh] gap-3 overflow-y-auto pr-1">
        {cartQuantity > 0 ? (
          <ReminderLink href="/checkout" onClose={onClose} Icon={ShoppingBag} title="Cart belum checkout">
            {cartQuantity} item sedang menunggu pembayaran.
          </ReminderLink>
        ) : null}

        {promos.map((product) => (
          <ReminderLink
            key={product.id}
            href={`/marketplace/${product.id}`}
            onClose={onClose}
            Icon={Tag}
            title={`${product.promoLabel || "Promo aktif"} -${product.promoDiscount}%`}
          >
            {product.name} sedang punya potongan harga.
          </ReminderLink>
        ))}

        {orders.map((order) => (
          <ReminderLink key={order.id} href="/dashboard" onClose={onClose} Icon={PackageCheck} title={`Order ${order.status}`}>
            {order.id.slice(0, 8)} / {order.paymentStatus}
          </ReminderLink>
        ))}

        {oilSubmissions.map((item) => (
          <ReminderLink key={item.id} href="/dashboard" onClose={onClose} Icon={Truck} title={`Pickup ${item.status}`}>
            {item.quantity} L dari {item.location}
          </ReminderLink>
        ))}

        {loaded && !hasContent ? (
          <div className="rounded-2xl bg-white/75 p-4 text-sm text-stone-600">
            Belum ada reminder aktif. Promo, cart tertunda, dan status order akan muncul di sini.
          </div>
        ) : null}

        {!loaded ? (
          <div className="rounded-2xl bg-white/75 p-4 text-sm text-stone-600">Loading reminders...</div>
        ) : null}
      </div>
    </div>
  );
}

function ReminderLink({
  href,
  onClose,
  Icon,
  title,
  children,
}: {
  href: string;
  onClose: () => void;
  Icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="grid grid-cols-[40px_1fr] gap-3 rounded-2xl bg-white/75 p-3 text-left transition hover:bg-white"
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-amber-100 text-[#9b5b24]">
        <Icon size={17} />
      </span>
      <span>
        <span className="block font-semibold text-stone-950">{title}</span>
        <span className="mt-1 block text-sm leading-5 text-stone-600">{children}</span>
      </span>
    </Link>
  );
}

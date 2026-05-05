import { CartClient } from "@/components/cart-client";
import { SiteNav } from "@/components/site-nav";
import { productFromDb } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const products = (await prisma.product.findMany()).map(productFromDb);

  return (
    <main className="min-h-screen px-4 pb-20 pt-32">
      <SiteNav />
      <section className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#9b5b24]">Cart system</p>
        <h1 className="mt-4 font-display text-6xl font-bold">Checkout</h1>
        <div className="mt-10">
          <CartClient products={products} />
        </div>
      </section>
    </main>
  );
}

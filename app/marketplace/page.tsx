import { MarketplaceBrowser } from "@/components/marketplace-browser";
import { SiteNav } from "@/components/site-nav";
import { productCategories, productFromDb } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getProducts() {
  const rows = await prisma.product.findMany({
    orderBy: [{ customBuild: "desc" }, { createdAt: "desc" }],
  });

  return rows.map(productFromDb);
}

export default async function MarketplacePage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen px-4 pb-20 pt-32">
      <SiteNav />
      <section className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#9b5b24]">Marketplace</p>
        <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h1 className="max-w-3xl font-display text-6xl font-bold leading-none text-balance">
            Premium aromatherapy candles from circular materials.
          </h1>
          <p className="max-w-md leading-7 text-stone-600">
            Browse candles made from processed used cooking oil, refined into low-waste objects for calmer spaces.
          </p>
        </div>
        <MarketplaceBrowser categories={productCategories} products={products} />
      </section>
    </main>
  );
}

import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { ProductConfigurator } from "@/components/product-configurator";
import { productFromDb } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await prisma.product.findUnique({ where: { id } });

  if (!row) {
    notFound();
  }

  const product = productFromDb(row);

  return (
    <main className="min-h-screen px-4 pb-20 pt-32">
      <SiteNav />
      <section className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="overflow-hidden rounded-lg shadow-2xl shadow-stone-900/15">
          <img src={product.imageUrl} alt={product.imageAlt} className="aspect-[4/5] w-full object-cover" />
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            <p className="rounded-full bg-white/70 px-3 py-1 text-sm font-bold uppercase tracking-[0.18em] text-[#9b5b24]">
              {product.category}
            </p>
            <p className="rounded-full bg-[#4f6f52]/10 px-3 py-1 text-sm font-semibold text-[#4f6f52]">
              {product.leadTime}
            </p>
          </div>
          <h1 className="mt-4 font-display text-7xl font-bold leading-none">{product.name}</h1>
          <p className="mt-4 text-sm font-bold uppercase tracking-[0.24em] text-[#9b5b24]">{product.aroma}</p>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">{product.description}</p>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-4">
            {[
              ["Rating", product.rating.toFixed(1)],
              ["Stock", `${product.stock}`],
              ["Price", formatCurrency(product.price)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-white/70 p-4 shadow-lg shadow-stone-900/5">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{label}</p>
                <p className="mt-2 font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["Aroma", product.variants.aromas],
              ["Wadah", product.variants.containers],
              ["Dekorasi", product.variants.decorations],
            ].map(([label, values]) => (
              <div key={label as string} className="rounded-lg border border-stone-200 bg-white/55 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{label as string}</p>
                <p className="mt-2 text-sm leading-6 text-stone-700">{(values as string[]).join(", ")}</p>
              </div>
            ))}
          </div>
          <div className="mt-9">
            <ProductConfigurator product={product} />
          </div>
        </div>
      </section>
    </main>
  );
}

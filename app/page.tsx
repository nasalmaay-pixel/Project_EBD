"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Clock3,
  Droplets,
  Factory,
  Flame,
  Globe2,
  Leaf,
  Recycle,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AwarenessSection } from "@/components/awareness-section";
import { ProductCard } from "@/components/product-card";
import { SiteNav } from "@/components/site-nav";
import { products, steps } from "@/lib/data";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const heroSlides = [
  {
    image:
      "https://images.unsplash.com/photo-1760080938416-2edc02bd8bda?auto=format&fit=crop&w=1800&q=88",
    label: "Jelantah Pay",
    title: "From Waste to Glow",
    body:
      "Jual minyak jelantah, kumpulkan poin, dan bantu mengubah limbah dapur jadi candle aromatherapy premium.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=1800&q=88",
    label: "Circular Marketplace",
    title: "Candles with a cleaner story",
    body:
      "Temukan candle siap hadiah, custom aroma, dan produk promo dari siklus bahan yang lebih bertanggung jawab.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1800&q=88",
    label: "Awareness Loop",
    title: "Small habits, warmer impact",
    body:
      "Pelajari perawatan candle, reuse container, dan cara sederhana menjaga jelantah tidak masuk saluran air.",
  },
];

export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, -90]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, []);

  const slide = heroSlides[activeSlide];

  return (
    <main className="overflow-hidden">
      <SiteNav />
      <section className="relative min-h-[94vh] overflow-hidden px-4 pt-28 text-white md:pt-36">
        {heroSlides.map((item, index) => (
          <motion.img
            key={item.image}
            src={item.image}
            alt=""
            initial={false}
            animate={{ opacity: activeSlide === index ? 1 : 0, scale: activeSlide === index ? 1 : 1.04 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/45 to-stone-950/15" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-stone-950/75 to-transparent" />
        <motion.div style={{ y: heroY }} className="relative z-10 mx-auto flex min-h-[calc(94vh-7rem)] max-w-7xl flex-col justify-center">
          <motion.div
            key={activeSlide}
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.12 }}
            className="max-w-3xl"
          >
            <motion.div
              variants={fadeUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/15 px-4 py-2 text-sm font-semibold text-amber-50 shadow-sm backdrop-blur"
            >
              <Leaf size={16} />
              {slide.label}
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display text-6xl font-bold leading-[0.92] tracking-normal text-balance md:text-8xl"
            >
              {slide.title}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-7 max-w-2xl text-lg leading-8 text-amber-50/90 md:text-xl"
            >
              {slide.body}
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/sell-oil">
                <Button size="lg" variant="warm">
                  Jelantah Pay
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button size="lg" variant="secondary">
                  Shop candles
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          <div className="mt-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex gap-2">
              {heroSlides.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  aria-label={`Show ${item.label}`}
                  onClick={() => setActiveSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    activeSlide === index ? "w-10 bg-amber-200" : "w-2.5 bg-white/55 hover:bg-white"
                  }`}
                />
              ))}
            </div>
            <div className="grid max-w-2xl grid-cols-3 gap-4 border-t border-white/25 pt-5 text-amber-50 md:border-t-0 md:pt-0">
              {[
                ["1.8K L", "Oil routed"],
                ["520", "Candles poured"],
                ["38", "UMKM partners"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="font-display text-2xl font-bold">{value}</p>
                  <p className="text-xs text-amber-50/75">{label}</p>
                </div>
              ))}
              </div>
          </div>
        </motion.div>
      </section>

      {/* <section className="bg-[#fbf7ef] px-4 py-24">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-bold text-[#1f7a3b]">Your Dashboard</p>
          <h2 className="mt-3 font-display text-5xl font-bold text-stone-950">Track Everything in One Place</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-stone-600">
            Monitor orders, oil sales, rewards, and environmental impact from one personal command center.
          </p>

          <div className="mt-16 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl shadow-stone-900/10">
            <div className="flex items-center justify-between border-b border-stone-200 bg-[#f4f8f2] px-6 py-5 text-left">
              <div>
                <p className="text-sm text-stone-600">Welcome back,</p>
                <p className="font-semibold text-stone-950">Sarah</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f4eadb] px-4 py-2 text-sm font-bold text-stone-950">
                <Trophy size={16} className="text-[#d78b37]" />
                750 Points
              </div>
            </div>
            <div className="grid gap-6 p-6 text-left">
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  ["Total Spent", "Rp 456K", "+12% this month", TrendingUp, "text-[#1f7a3b]"],
                  ["Oil Earnings", "Rp 125K", "+8% this month", TrendingUp, "text-[#d78b37]"],
                  ["Oil Recycled", "15L", "Total contribution", TrendingUp, "text-[#1f7a3b]"],
                  ["Carbon Saved", "45kg", "CO2 equivalent", TrendingUp, "text-emerald-500"],
                ].map(([label, value, caption, Icon, tone]) => (
                  <div key={label as string} className="rounded-2xl bg-[#f8f4ee] p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-stone-600">{label as string}</p>
                      <Icon size={16} className={tone as string} />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-stone-950">{value as string}</p>
                    <p className={`mt-1 text-sm ${tone as string}`}>{caption as string}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
                <div className="rounded-2xl bg-[#f8f4ee] p-5">
                  <h3 className="flex items-center gap-2 text-xl font-bold text-stone-950">
                    <Clock3 size={18} />
                    Recent Activity
                  </h3>
                  <div className="mt-5 grid gap-3">
                    {[
                      [Box, "Lavender Dreams", "Delivered", "+Rp 89.000", "text-[#1f7a3b]"],
                      [Droplets, "Oil Pickup #234", "Completed", "+Rp 35.000", "text-[#d78b37]"],
                      [Box, "Vanilla Comfort", "Shipping", "+Rp 99.000", "text-[#1f7a3b]"],
                    ].map(([Icon, title, status, amount, tone]) => (
                      <div key={title as string} className="flex items-center gap-4 rounded-2xl bg-white p-4">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-[#1f7a3b]">
                          <Icon size={20} className={tone as string} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-stone-950">{title as string}</p>
                          <p className="text-sm text-stone-500">{status as string}</p>
                        </div>
                        <p className="font-bold text-stone-950">{amount as string}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#f8f4ee] p-5">
                  <h3 className="flex items-center gap-2 text-xl font-bold text-stone-950">
                    <Award size={18} className="text-[#d78b37]" />
                    Rewards & Badges
                  </h3>
                  <div className="mt-5 grid gap-3">
                    {[
                      ["Eco Starter", "100 points required", "Earned"],
                      ["Green Champion", "500 points required", "Earned"],
                      ["Sustainability Hero", "1000 points required", ""],
                    ].map(([title, points, status]) => (
                      <div key={title} className="flex items-center gap-4 rounded-2xl bg-white p-4">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-100 text-[#d78b37]">
                          <CheckCircle2 size={19} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-stone-950">{title}</p>
                          <p className="text-sm text-stone-500">{points}</p>
                        </div>
                        {status ? (
                          <span className="rounded-full bg-[#fff7ed] px-3 py-1 text-xs font-medium text-[#d78b37]">{status}</span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      <section className="relative overflow-hidden bg-stone-950 px-4 py-24 text-amber-50">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/90 to-[#4f6f52]/80" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <p className="inline-flex items-center gap-2 rounded-full border border-amber-100/25 bg-white/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.22em] text-amber-200 backdrop-blur">
                <Globe2 size={15} />
                Wawasan lingkungan
              </p>
              <h2 className="mt-5 font-display text-5xl font-bold text-balance">
                Kenali dampak jelantah sebelum masuk saluran air.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-amber-50/80">
                Minyak jelantah yang dibuang sembarangan bisa mencemari air, menyumbat pipa, dan menghilangkan nilai ekonomi yang seharusnya bisa kembali ke warga.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/sell-oil">
                  <Button size="lg" variant="warm">
                    Setor jelantah
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link href="/awareness">
                  <Button size="lg" variant="secondary">
                    Baca awareness
                  </Button>
                </Link>
              </div>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["3 Juta", "Liter jelantah terbuang per hari", Droplets],
                ["70%", "Berakhir di saluran air", Recycle],
                ["15 Tahun", "Waktu degradasi di lingkungan", Clock3],
                ["2.5x", "Emisi dari pembuangan tidak tepat", Factory],
              ].map(([value, label, Icon]) => (
                <motion.div
                  key={value as string}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-lg border border-white/15 bg-white/10 p-5 shadow-lg shadow-stone-950/10 backdrop-blur-xl"
                >
                  <Icon className="text-[#d78b37]" size={24} />
                  <p className="mt-6 font-display text-4xl font-bold">{value as string}</p>
                  <p className="mt-2 text-sm leading-6 text-amber-50/75">{label as string}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {[
              [Droplets, "Mencemari air tanah", "1 liter jelantah bisa mencemari air bersih dan merusak habitat mikro yang menjaga kualitas air.", "1 juta L", "potensi air tercemar"],
              [Recycle, "Merusak ekosistem sungai", "Lapisan minyak menghalangi oksigen masuk ke air dan mengganggu kehidupan biota akuatik.", "40%", "risiko kerusakan sungai"],
              [Trash2, "Menyumbat saluran air", "Minyak yang mengeras di pipa memperbesar risiko genangan, bau, dan biaya perbaikan lingkungan.", "Rp500 juta", "potensi biaya tahunan"],
              [Factory, "Menghilangkan nilai bahan", "Jelantah yang dikelola dapat menjadi bahan bernilai untuk produk circular seperti candle aromatherapy.", "2x", "nilai dampak ekonomi"],
            ].map(([Icon, title, body, value, label]) => (
              <motion.div
                key={title as string}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-lg border border-white/15 bg-[#fffaf0]/95 p-5 text-left text-stone-950 shadow-2xl shadow-stone-950/10"
              >
                <div className="flex gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-stone-950 text-amber-100">
                    <Icon size={21} />
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-bold">{title as string}</h3>
                    <p className="mt-3 leading-7 text-stone-600">{body as string}</p>
                    <div className="mt-4 rounded-lg bg-[#f9efe0] p-4">
                      <p className="text-2xl font-bold text-[#9b5b24]">{value as string}</p>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{label as string}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f9efe0] px-4 py-24">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#9b5b24]">Problem</p>
            <h2 className="mt-4 font-display text-5xl font-bold text-balance">
              Used cooking oil should not end in drains, soil, or waterways.
            </h2>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              [Droplets, "Pollution", "Improper disposal can contaminate water and damage local ecosystems."],
              [Factory, "Lost value", "Cafes and UMKM often lack a clean channel to monetize jelantah."],
              [Sparkles, "Demand", "Customers want beautiful products with transparent sustainability stories."],
            ].map(([Icon, title, body]) => (
              <motion.div
                key={title as string}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-lg border border-white/70 bg-white/60 p-5 shadow-lg shadow-stone-900/5"
              >
                <Icon className="text-[#d78b37]" size={26} />
                <h3 className="mt-5 font-semibold">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">{body as string}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#9b5b24]">Solution</p>
              <h2 className="mt-4 font-display text-5xl font-bold text-balance">
                One platform for supply, production, and glowing retail.
              </h2>
              <p className="mt-5 text-lg leading-8 text-stone-600">
                Sellers submit oil, operators track pickup and processing, and buyers discover candles with an elevated marketplace experience.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {steps.map(([title, body], index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="glass rounded-lg p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-950 text-amber-100">
                    {index === 0 ? <Droplets /> : index === 1 ? <Recycle /> : index === 2 ? <Flame /> : <Sparkles />}
                  </div>
                  <p className="mt-8 text-sm font-semibold text-stone-500">0{index + 1}</p>
                  <h3 className="mt-1 font-display text-3xl font-bold">{title}</h3>
                  <p className="mt-3 leading-7 text-stone-600">{body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-stone-950 px-4 py-24 text-amber-50">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-amber-300">Marketplace</p>
              <h2 className="mt-4 font-display text-5xl font-bold">Candles with a past life.</h2>
            </div>
            <Link href="/marketplace">
              <Button variant="secondary">View all products</Button>
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f9efe0] px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <AwarenessSection />
        </div>
      </section>

      <section className="px-4 py-24">
        <div className="mx-auto flex max-w-5xl flex-col items-center rounded-lg bg-[#d78b37] px-6 py-16 text-center text-white shadow-2xl shadow-amber-900/20">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-amber-100">Join the loop</p>
          <h2 className="mt-4 max-w-3xl font-display text-5xl font-bold text-balance">
            Start with a liter of jelantah. End with a room full of glow.
          </h2>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/sell-oil">
              <Button size="lg">Open Jelantah Pay</Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="secondary">Open dashboard</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Droplets,
  Factory,
  Flame,
  Leaf,
  Recycle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { SiteNav } from "@/components/site-nav";
import { products, steps } from "@/lib/data";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, -90]);

  return (
    <main className="overflow-hidden">
      <SiteNav />
      <section className="warm-gradient relative min-h-[94vh] px-4 pt-28 md:pt-36">
        <motion.div style={{ y: heroY }} className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.12 }}
            className="relative z-10"
          >
            <motion.div
              variants={fadeUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm backdrop-blur"
            >
              <Leaf size={16} />
              Circular economy for minyak jelantah
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display text-6xl font-bold leading-[0.92] tracking-normal text-stone-950 text-balance md:text-8xl"
            >
              From Waste to Glow
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-7 max-w-2xl text-lg leading-8 text-stone-700 md:text-xl"
            >
              CandleX connects jelantah suppliers with a premium aromatherapy candle marketplace, turning kitchen waste into a warm, traceable, beautiful product cycle.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/sell-oil">
                <Button size="lg" variant="warm">
                  Sell used oil
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

          <motion.div
            initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="glass relative overflow-hidden rounded-lg p-4"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1602526432604-029a709e131c?auto=format&fit=crop&w=1400&q=88"
                alt="Premium aromatherapy candle"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute bottom-8 left-8 right-8 rounded-lg border border-white/70 bg-[#fffaf0]/80 p-5 backdrop-blur-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9b5b24]">
                Impact loop
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                {[
                  ["1.8K L", "Oil routed"],
                  ["520", "Candles poured"],
                  ["38", "UMKM partners"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <p className="font-display text-2xl font-bold">{value}</p>
                    <p className="text-xs text-stone-600">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
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

      <section className="px-4 py-24">
        <div className="mx-auto flex max-w-5xl flex-col items-center rounded-lg bg-[#d78b37] px-6 py-16 text-center text-white shadow-2xl shadow-amber-900/20">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-amber-100">Join the loop</p>
          <h2 className="mt-4 max-w-3xl font-display text-5xl font-bold text-balance">
            Start with a liter of jelantah. End with a room full of glow.
          </h2>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/sell-oil">
              <Button size="lg">Submit oil</Button>
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

"use client";

import Link from "next/link";
import { useApp } from "@/components/app-provider";
import { ProductCard } from "@/components/product-card";
import { IconArrow } from "@/components/icons";
import { NICHES, PRODUCT_TYPES } from "@/lib/types";

export default function HomePage() {
  const { products } = useApp();
  const live = products.filter((p) => p.status !== "paused");
  const featured = live.slice(0, 8);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="grid-fade pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:pt-24">
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-indigo-2">
            For independent developers & vibe coders
          </p>
          <h1 className="font-serif max-w-3xl text-4xl leading-[1.1] text-foreground sm:text-6xl">
            Discover, buy and sell software built by independent developers and vibe coders.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Websites, SaaS, AI agents, apps, templates. Browse in rupees. Bid or buy now. Handover stays
            private after purchase.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/market" className="btn-primary gap-2">
              Explore marketplace <IconArrow />
            </Link>
            <Link href="/add" className="btn-ghost">
              List a product
            </Link>
            <Link href="/hub" className="btn-ghost">
              VibersHub
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <p className="mb-3 text-xs uppercase tracking-wide text-muted">Types</p>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_TYPES.map((t) => (
            <Link
              key={t}
              href={`/category/${encodeURIComponent(t)}`}
              className="rounded-full border border-border bg-white px-3 py-1 text-xs text-foreground hover:border-indigo-2"
            >
              {t}
            </Link>
          ))}
        </div>
        <p className="mb-3 mt-6 text-xs uppercase tracking-wide text-muted">Niches</p>
        <div className="flex flex-wrap gap-2">
          {NICHES.slice(0, 10).map((t) => (
            <Link
              key={t}
              href={`/search?q=${encodeURIComponent(t)}`}
              className="rounded-full bg-[#F5F6F8] px-3 py-1 text-xs text-muted"
            >
              {t}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Recently listed</h2>
          <Link href="/market" className="text-sm font-medium text-indigo-2">
            View all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

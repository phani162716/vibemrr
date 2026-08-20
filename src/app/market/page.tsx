"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/app-provider";
import { ProductCard } from "@/components/product-card";
import { PRODUCT_TYPES } from "@/lib/types";
import { IconSearch } from "@/components/icons";

export default function MarketPage() {
  const { products } = useApp();
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const [sort, setSort] = useState<"new" | "views" | "interest" | "bids" | "price">("new");

  const list = useMemo(() => {
    let rows = products.filter((p) => p.status !== "paused");
    if (type !== "All") rows = rows.filter((p) => p.productType === type);
    if (q.trim()) {
      const n = q.toLowerCase();
      rows = rows.filter((p) =>
        [p.name, p.shortDescription, p.productType, p.niche, ...p.tags].join(" ").toLowerCase().includes(n)
      );
    }
    return [...rows].sort((a, b) => {
      if (sort === "views") return b.views - a.views;
      if (sort === "interest") return b.interested - a.interested;
      if (sort === "bids") return b.bidCount - a.bidCount;
      if (sort === "price") return a.askingInr - b.askingInr;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
  }, [products, q, type, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-serif text-4xl">Explore</h1>
          <p className="mt-2 text-sm text-zinc-400">Software from independent builders. Filter by type, niche, or price.</p>
        </div>
        <Link href="/add" className="rounded-xl bg-saffron px-4 py-2 text-sm font-semibold text-zinc-950">
          List product
        </Link>
      </div>
      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-white/8 bg-card p-3 sm:flex-row">
        <label className="relative flex-1">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="AI agent, real estate, GST…"
            className="w-full rounded-lg border border-white/8 bg-black/30 py-2 pl-9 pr-3 text-sm outline-none"
          />
        </label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-sm">
          <option>All</option>
          {PRODUCT_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-sm"
        >
          <option value="new">Recently added</option>
          <option value="views">Most viewed</option>
          <option value="interest">Most interested</option>
          <option value="bids">Most bids</option>
          <option value="price">Price: low to high</option>
        </select>
      </div>
      <p className="mt-4 text-xs text-zinc-500">{list.length} products</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}

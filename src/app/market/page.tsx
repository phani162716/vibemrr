"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/app-provider";
import { ProductCard } from "@/components/product-card";
import { NICHES, PRODUCT_TYPES } from "@/lib/types";
import { IconSearch } from "@/components/icons";
import { searchProducts, type SearchSort } from "@/lib/search-index";

export default function MarketPage() {
  const { products } = useApp();
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const [niche, setNiche] = useState("All");
  const [sort, setSort] = useState<SearchSort>("new");

  const list = useMemo(
    () =>
      searchProducts(products, {
        q,
        type,
        niche,
        sort: q.trim() && sort === "new" ? "relevance" : sort,
      }),
    [products, q, type, niche, sort]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-serif text-4xl">Explore</h1>
          <p className="mt-2 text-sm text-muted">Software from independent builders. Filter by type, niche, or price.</p>
        </div>
        <Link href="/add" className="btn-primary">
          List product
        </Link>
      </div>
      <div className="card-shadow mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-white p-3 sm:flex-row sm:flex-wrap">
        <label className="relative flex-1">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="AI agent, real estate, GST…"
            className="field py-2 pl-9"
          />
        </label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="field">
          <option value="All">All types</option>
          {PRODUCT_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select value={niche} onChange={(e) => setNiche(e.target.value)} className="field">
          <option value="All">All niches</option>
          {NICHES.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as SearchSort)} className="field">
          <option value="new">Recently added</option>
          <option value="relevance">Best match</option>
          <option value="views">Most viewed</option>
          <option value="interest">Most interested</option>
          <option value="bids">Most bids</option>
          <option value="rating">Highest rated</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>
      <p className="mt-4 text-xs text-muted">{list.length} products</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}

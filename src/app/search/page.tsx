"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/components/app-provider";
import { ProductCard } from "@/components/product-card";
import { IconSearch } from "@/components/icons";
import { NICHES, PRODUCT_TYPES } from "@/lib/types";
import { searchProducts, type SearchSort } from "@/lib/search-index";

function SearchInner() {
  const params = useSearchParams();
  const { products } = useApp();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [type, setType] = useState(params.get("type") ?? "All");
  const [niche, setNiche] = useState(params.get("niche") ?? "All");
  const [minPrice, setMinPrice] = useState(params.get("min") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("max") ?? "");
  const [sort, setSort] = useState<SearchSort>((params.get("sort") as SearchSort) || "relevance");

  const rows = useMemo(
    () =>
      searchProducts(products, {
        q,
        type,
        niche,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sort: q.trim() && sort === "relevance" ? "relevance" : sort === "relevance" && !q.trim() ? "new" : sort,
      }),
    [products, q, type, niche, minPrice, maxPrice, sort]
  );

  useEffect(() => {
    const usp = new URLSearchParams();
    if (q.trim()) usp.set("q", q.trim());
    if (type !== "All") usp.set("type", type);
    if (niche !== "All") usp.set("niche", niche);
    if (minPrice) usp.set("min", minPrice);
    if (maxPrice) usp.set("max", maxPrice);
    if (sort && sort !== "relevance") usp.set("sort", sort);
    const next = usp.toString();
    const path = next ? `/search?${next}` : "/search";
    if (`${window.location.pathname}${window.location.search}` !== path) {
      window.history.replaceState(null, "", path);
    }
  }, [q, type, niche, minPrice, maxPrice, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-4xl">Search</h1>
      <p className="mt-2 text-sm text-muted">
        Indexed by name, description, type, niche and tags. Try type <span className="font-medium">AI Agent</span> and
        query <span className="font-medium">real estate</span>.
      </p>
      <label className="relative mt-6 block">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="real estate, GST, WhatsApp…"
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm outline-none"
        />
      </label>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
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
        <input
          type="number"
          min={0}
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="Min ₹"
          className="field"
        />
        <input
          type="number"
          min={0}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Max ₹"
          className="field"
        />
        <select value={sort} onChange={(e) => setSort(e.target.value as SearchSort)} className="field">
          <option value="relevance">Best match</option>
          <option value="new">Recently added</option>
          <option value="views">Most viewed</option>
          <option value="interest">Most interested</option>
          <option value="bids">Most bids</option>
          <option value="rating">Highest rated</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>
      <p className="mt-3 text-xs text-muted">{rows.length} results</p>
      {rows.length === 0 ? (
        <p className="mt-10 text-sm text-muted">No products match. Clear a filter or try another word.</p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchInner />
    </Suspense>
  );
}

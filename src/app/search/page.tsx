"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/components/app-provider";
import { ProductCard } from "@/components/product-card";
import { IconSearch } from "@/components/icons";
import { Suspense } from "react";

function SearchInner() {
  const params = useSearchParams();
  const { products } = useApp();
  const [q, setQ] = useState(params.get("q") ?? "");
  const rows = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return products.filter((p) => p.status !== "paused");
    return products.filter((p) =>
      [p.name, p.shortDescription, p.fullDescription, p.productType, p.niche, ...p.tags]
        .join(" ")
        .toLowerCase()
        .includes(n)
    );
  }, [q, products]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-4xl">Search</h1>
      <label className="relative mt-6 block">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="AI Agent + real estate"
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm outline-none"
        />
      </label>
      <p className="mt-3 text-xs text-muted">{rows.length} results</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
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

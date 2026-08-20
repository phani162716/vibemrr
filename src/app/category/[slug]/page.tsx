"use client";

import { use } from "react";
import Link from "next/link";
import { useApp } from "@/components/app-provider";
import { ProductCard } from "@/components/product-card";
import { PRODUCT_TYPES } from "@/lib/types";
import { searchProducts } from "@/lib/search-index";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const name = decodeURIComponent(slug);
  const { products } = useApp();
  const isType = PRODUCT_TYPES.some((t) => t.toLowerCase() === name.toLowerCase());
  const type = PRODUCT_TYPES.find((t) => t.toLowerCase() === name.toLowerCase());
  const rows = searchProducts(products, {
    type: type,
    niche: isType ? undefined : name,
    sort: "new",
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs uppercase tracking-wider text-muted">Category</p>
      <h1 className="mt-1 font-serif text-4xl">{name}</h1>
      <p className="mt-2 text-sm text-muted">
        {rows.length} products ·{" "}
        <Link href={`/search?${isType ? `type=${encodeURIComponent(type || name)}` : `niche=${encodeURIComponent(name)}`}`} className="text-indigo-2">
          Search in {name}
        </Link>
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}

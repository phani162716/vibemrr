"use client";

import { use } from "react";
import { useApp } from "@/components/app-provider";
import { ProductCard } from "@/components/product-card";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const name = decodeURIComponent(slug);
  const { products } = useApp();
  const rows = products.filter(
    (p) => p.productType.toLowerCase() === name.toLowerCase() || p.niche.toLowerCase() === name.toLowerCase()
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs uppercase tracking-wider text-zinc-500">Category</p>
      <h1 className="mt-1 font-serif text-4xl">{name}</h1>
      <p className="mt-2 text-sm text-zinc-500">{rows.length} products</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}

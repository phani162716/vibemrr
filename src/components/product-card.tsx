"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { money } from "@/lib/format";
import { useApp } from "./app-provider";

export function ProductCard({ product }: { product: Product }) {
  const { currency } = useApp();
  const letter = product.name.charAt(0).toUpperCase();
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col rounded-2xl border border-white/8 bg-card p-4 transition hover:-translate-y-0.5 hover:border-white/16"
    >
      <div
        className="mb-3 flex h-28 items-center justify-center rounded-xl text-3xl font-semibold text-zinc-950"
        style={{ background: `hsl(${(letter.charCodeAt(0) * 24) % 360} 60% 55%)` }}
      >
        {letter}
      </div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-zinc-50">{product.name}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{product.shortDescription}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-zinc-400">
          {product.productType}
        </span>
      </div>
      <p className="mt-3 text-lg font-semibold tabular-nums">{money(product.askingInr, currency)}</p>
      <p className="mt-1 text-[11px] text-zinc-500">
        {product.ownerName} · {product.views} views · {product.interested} interested · {product.bidCount}{" "}
        bids
        {product.rating ? ` · ${product.rating}★` : ""}
      </p>
      <p className="mt-3 text-xs font-medium text-saffron">View product</p>
    </Link>
  );
}

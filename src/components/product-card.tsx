"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { money } from "@/lib/format";
import { useApp } from "./app-provider";

export function ProductCard({ product }: { product: Product }) {
  const { currency } = useApp();
  const letter = product.name.charAt(0).toUpperCase();
  const sold = product.status === "sold";
  return (
    <Link
      href={`/product/${product.slug}`}
      className="card-shadow group flex flex-col rounded-2xl border border-border bg-white p-4 transition hover:-translate-y-0.5"
    >
      <div
        className="relative mb-3 flex h-28 items-center justify-center rounded-xl text-3xl font-semibold text-white"
        style={{ background: "#1E2A5A" }}
      >
        {letter}
        {sold && (
          <span className="absolute right-2 top-2 rounded-full bg-success px-2 py-0.5 text-[10px] font-semibold text-white">
            Sold
          </span>
        )}
      </div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-foreground">{product.name}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted">{product.shortDescription}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#F5F6F8] px-2 py-0.5 text-[10px] text-muted">{product.productType}</span>
      </div>
      <p className="mt-3 text-lg font-semibold tabular-nums text-indigo">{money(product.askingInr, currency)}</p>
      <p className="mt-1 text-[11px] text-muted">
        {product.ownerName} · {product.views} views · {product.interested} interested · {product.bidCount} bids
        {product.rating ? ` · ${product.rating}★` : ""}
      </p>
      <p className="mt-3 text-xs font-medium text-indigo-2">View product</p>
    </Link>
  );
}

"use client";

import { use } from "react";
import Link from "next/link";
import { useApp } from "@/components/app-provider";

export default function AnalyticsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { products, bids } = useApp();
  const p = products.find((x) => x.slug === slug);
  if (!p) return <p className="px-4 py-16">Not found</p>;
  const bidN = bids.filter((b) => b.productSlug === slug).length;
  const conv = p.views === 0 ? 0 : Math.round((p.interested / p.views) * 100);
  const bidConv = p.interested === 0 ? 0 : Math.round((bidN / p.interested) * 100);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href={`/product/${p.slug}`} className="text-xs text-zinc-500">
        ← {p.name}
      </Link>
      <h1 className="mt-2 font-serif text-4xl">Analytics</h1>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Tile label="Views" value={String(p.views)} />
        <Tile label="Interested" value={String(p.interested)} />
        <Tile label="Bids" value={String(bidN || p.bidCount)} />
      </div>
      <p className="mt-8 text-sm text-zinc-400">
        Funnel: Views → Interested ({conv}%) → Bids ({bidConv}%) → {p.status === "sold" ? "Sold" : "Open"}
      </p>
      <div className="mt-6 space-y-3">
        <Bar label="Views" pct={100} />
        <Bar label="Interested" pct={Math.min(100, conv || 8)} />
        <Bar label="Bids" pct={Math.min(100, bidConv || 4)} />
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 p-4">
      <p className="text-[11px] uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Bar({ label, pct }: { label: string; pct: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-zinc-500">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
        <div className="h-full bg-saffron" style={{ width: `${Math.max(pct, 4)}%` }} />
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/app-provider";
import { StartupCard } from "@/components/startup-card";
import { CATEGORIES, CITIES } from "@/lib/providers";
import { IconSearch, IconSpark } from "@/components/icons";

export default function AcquirePage() {
  const { startups } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [city, setCity] = useState("All");
  const [vibeOnly, setVibeOnly] = useState(false);
  const [sort, setSort] = useState<"new" | "multiple" | "revenue" | "price">("new");

  const list = useMemo(() => {
    let rows = startups.filter((s) => s.forSale);
    if (q.trim()) {
      const n = q.toLowerCase();
      rows = rows.filter(
        (s) =>
          s.name.toLowerCase().includes(n) ||
          s.tagline.toLowerCase().includes(n) ||
          s.category.toLowerCase().includes(n) ||
          s.city.toLowerCase().includes(n)
      );
    }
    if (cat !== "All") rows = rows.filter((s) => s.category === cat);
    if (city !== "All") rows = rows.filter((s) => s.city === city);
    if (vibeOnly) rows = rows.filter((s) => s.vibeCoded);
    rows = [...rows].sort((a, b) => {
      if (sort === "revenue") return b.revenue30dInr - a.revenue30dInr;
      if (sort === "price") return (a.askingInr ?? 0) - (b.askingInr ?? 0);
      if (sort === "multiple") {
        const ma = a.askingInr && a.revenue30dInr ? a.askingInr / (a.revenue30dInr * 12) : 99;
        const mb = b.askingInr && b.revenue30dInr ? b.askingInr / (b.revenue30dInr * 12) : 99;
        return ma - mb;
      }
      return a.founded < b.founded ? 1 : -1;
    });
    return rows;
  }, [startups, q, cat, city, vibeOnly, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-serif text-4xl text-zinc-50">Acquire profitable startups</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            The verified rupee marketplace. Revenue is pulled from Razorpay, Cashfree, PhonePe,
            PayU, Stripe, Dodo, and Lemon Squeezy — not a screenshot in a Google Drive.
          </p>
        </div>
        <Link
          href="/add"
          className="rounded-xl bg-saffron px-4 py-2 text-sm font-semibold text-zinc-950"
        >
          Sell startup
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-white/8 bg-card p-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search GST tools, WhatsApp CRM, clinic OS…"
            className="w-full rounded-lg border border-white/8 bg-black/30 py-2 pl-9 pr-3 text-sm outline-none focus:border-saffron/40"
          />
        </label>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-sm"
        >
          <option>All</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-sm"
        >
          <option>All</option>
          {CITIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-sm"
        >
          <option value="new">Newest</option>
          <option value="multiple">Best multiple</option>
          <option value="revenue">Highest revenue</option>
          <option value="price">Lowest price</option>
        </select>
        <button
          onClick={() => setVibeOnly((v) => !v)}
          className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium ${
            vibeOnly ? "bg-saffron/15 text-saffron" : "border border-white/8 text-zinc-400"
          }`}
        >
          <IconSpark className="h-3.5 w-3.5" /> Vibe-coded
        </button>
      </div>

      <p className="mt-4 text-xs text-zinc-500">{list.length} startups for sale</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <StartupCard key={s.slug} startup={s} />
        ))}
      </div>
      {list.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center">
          <p className="text-sm text-zinc-300">No real startups for sale yet.</p>
          <p className="mt-1 text-sm text-zinc-500">
            Demo cards are hidden. List yours, or invite a founder who wants to sell.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/add" className="rounded-lg bg-saffron px-4 py-2 text-sm font-semibold text-zinc-950">
              Sell startup
            </Link>
            <Link href="/invite" className="rounded-lg border border-white/10 px-4 py-2 text-sm">
              Invite founders
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

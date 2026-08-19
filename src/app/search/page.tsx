"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { StartupCard } from "@/components/startup-card";
import { IconSearch } from "@/components/icons";

export default function SearchPage() {
  const { startups } = useApp();
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return startups.slice(0, 12);
    return startups.filter((s) =>
      [s.name, s.tagline, s.category, s.city, s.founder.name, ...(s.vibeTools ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(n)
    );
  }, [q, startups]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-4xl">Search</h1>
      <label className="relative mt-6 block">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="WhatsApp CRM, GST, vibe-coded, Pune…"
          className="w-full rounded-xl border border-white/10 bg-card py-3 pl-10 pr-4 text-sm outline-none focus:border-saffron/40"
        />
      </label>
      <p className="mt-3 text-xs text-zinc-500">{rows.length} results</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((s) => (
          <StartupCard key={s.slug} startup={s} />
        ))}
      </div>
    </div>
  );
}

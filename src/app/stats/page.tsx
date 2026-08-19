"use client";

import { useMemo } from "react";
import { useApp } from "@/components/app-provider";
import { money } from "@/lib/format";
import { PROVIDERS } from "@/lib/providers";
import { StartupRow } from "@/components/startup-card";

export default function StatsPage() {
  const { startups, currency } = useApp();

  const stats = useMemo(() => {
    const all = startups.reduce((a, s) => a + s.allTimeInr, 0);
    const mrr = startups.reduce((a, s) => a + s.mrrInr, 0);
    const vibe = startups.filter((s) => s.vibeCoded).length;
    const buckets = [
      { label: "₹0 – ₹1L", test: (n: number) => n < 1_00_000 },
      { label: "₹1L – ₹10L", test: (n: number) => n >= 1_00_000 && n < 10_00_000 },
      { label: "₹10L – ₹1Cr", test: (n: number) => n >= 10_00_000 && n < 1_00_00_000 },
      { label: "₹1Cr+", test: (n: number) => n >= 1_00_00_000 },
    ].map((b) => ({
      ...b,
      pct: Math.round((startups.filter((s) => b.test(s.allTimeInr)).length / startups.length) * 100),
    }));

    const byProvider = PROVIDERS.map((p) => {
      const rows = startups.filter((s) => s.provider === p.id);
      const med = median(rows.map((s) => s.allTimeInr));
      return {
        ...p,
        count: rows.length,
        share: startups.length ? Math.round((rows.length / startups.length) * 1000) / 10 : 0,
        median: med,
      };
    }).sort((a, b) => b.count - a.count);

    const byCity = rollup(startups, (s) => s.city, (s) => s.mrrInr);
    const byCat = rollup(startups, (s) => s.category, (s) => s.mrrInr);
    const board = [...startups].sort((a, b) => b.mrrInr - a.mrrInr).slice(0, 12);
    const quietGiants = [...startups]
      .filter((s) => s.founder.followers < 500 && s.allTimeInr > 5_00_000)
      .sort((a, b) => b.allTimeInr - a.allTimeInr)
      .slice(0, 5);

    return { all, mrr, vibe, buckets, byProvider, byCity, byCat, board, quietGiants };
  }, [startups]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-4xl text-zinc-50">Startup statistics</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Daily snapshot of {money(stats.all, currency)} verified revenue across {startups.length}{" "}
        Indian startups. Times in IST.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Tile label="All-time verified" value={money(stats.all, currency)} />
        <Tile label="Combined MRR" value={money(stats.mrr, currency)} />
        <Tile
          label="Vibe-coded share"
          value={`${Math.round((stats.vibe / Math.max(startups.length, 1)) * 100)}%`}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card title="Revenue distribution">
          {stats.buckets.map((b) => (
            <Bar key={b.label} label={b.label} pct={b.pct} />
          ))}
        </Card>
        <Card title="Payment providers (median all-time)">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wide text-zinc-600">
              <tr>
                <th className="pb-2">Provider</th>
                <th className="pb-2 text-right">Share</th>
                <th className="pb-2 text-right">Median</th>
              </tr>
            </thead>
            <tbody>
              {stats.byProvider.map((p) => (
                <tr key={p.id} className="border-t border-white/6">
                  <td className="py-2">
                    {p.name}
                    {p.indiaFirst && (
                      <span className="ml-2 text-[10px] text-saffron">India</span>
                    )}
                  </td>
                  <td className="text-right tabular-nums text-zinc-400">{p.share}%</td>
                  <td className="text-right tabular-nums">{p.count ? money(p.median, currency) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title="Cities by MRR">
          {stats.byCity.slice(0, 8).map((c) => (
            <Bar key={c.key} label={c.key} pct={Math.round((c.value / stats.mrr) * 100)} extra={money(c.value, currency)} />
          ))}
        </Card>
        <Card title="Categories by MRR">
          {stats.byCat.map((c) => (
            <Bar key={c.key} label={c.key} pct={Math.round((c.value / stats.mrr) * 100)} extra={money(c.value, currency)} />
          ))}
        </Card>
      </div>

      <h2 className="mt-12 text-lg font-semibold">High revenue, quiet founders</h2>
      <p className="mb-3 text-sm text-zinc-500">₹5L+ all-time · under 500 followers on X</p>
      <div className="overflow-hidden rounded-2xl border border-white/8 bg-card">
        {stats.quietGiants.map((s, i) => (
          <StartupRow key={s.slug} startup={s} rank={i + 1} />
        ))}
      </div>

      <h2 className="mt-12 text-lg font-semibold">Leaderboard</h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-white/8 bg-card">
        {stats.board.map((s, i) => (
          <StartupRow key={s.slug} startup={s} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-card px-5 py-4">
      <p className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Bar({ label, pct, extra }: { label: string; pct: number; extra?: string }) {
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-xs text-zinc-400">
        <span>{label}</span>
        <span className="tabular-nums">{extra ?? `${pct}%`}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full bg-saffron" style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
    </div>
  );
}

function median(nums: number[]) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function rollup(rows: { city: string; category: string; mrrInr: number }[], key: (s: typeof rows[0]) => string, val: (s: typeof rows[0]) => number) {
  const map = new Map<string, number>();
  for (const r of rows) map.set(key(r), (map.get(key(r)) ?? 0) + val(r));
  return [...map.entries()].map(([k, value]) => ({ key: k, value })).sort((a, b) => b.value - a.value);
}

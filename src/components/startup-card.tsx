"use client";

import Link from "next/link";
import type { Startup } from "@/lib/types";
import { formatMultiple, money } from "@/lib/format";
import { useApp } from "./app-provider";
import { IconSpark } from "./icons";

export function LogoMark({
  letter,
  color,
  size = "md",
}: {
  letter: string;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "lg" ? "h-14 w-14 text-xl" : size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <div
      className={`flex ${dim} shrink-0 items-center justify-center rounded-xl font-bold text-zinc-950`}
      style={{ background: color }}
    >
      {letter}
    </div>
  );
}

export function StartupCard({ startup }: { startup: Startup }) {
  const { currency } = useApp();
  return (
    <Link
      href={`/startup/${startup.slug}`}
      className="group flex flex-col rounded-2xl border border-white/8 bg-card p-4 transition hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/[0.035]"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <LogoMark letter={startup.logoLetter} color={startup.logoColor} />
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="font-medium text-zinc-50">{startup.anonymous ? "Anonymous startup" : startup.name}</p>
              {startup.forSale && (
                <span className="rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                  For sale
                </span>
              )}
              {startup.verified && (
                <span className="rounded-full bg-emerald-400/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                  Verified
                </span>
              )}
              {startup.isDemo && (
                <span className="rounded-full bg-white/8 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                  Demo
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500">{startup.category}</p>
          </div>
        </div>
        {startup.vibeCoded && (
          <span className="inline-flex items-center gap-1 rounded-full bg-saffron/12 px-1.5 py-0.5 text-[10px] font-medium text-saffron">
            <IconSpark className="h-3 w-3" />
            Vibe
          </span>
        )}
      </div>
      <div className="mt-auto grid grid-cols-3 gap-2 text-sm">
        <Stat label="Revenue" value={money(startup.revenue30dInr, currency)} />
        {startup.forSale ? (
          <>
            <Stat label="Price" value={money(startup.askingInr ?? 0, currency)} />
            <Stat label="Multiple" value={formatMultiple(startup.askingInr, startup.revenue30dInr)} />
          </>
        ) : (
          <>
            <Stat label="MRR" value={money(startup.mrrInr, currency)} />
            <Stat
              label="MoM"
              value={startup.momGrowth !== undefined ? `${startup.momGrowth > 0 ? "+" : ""}${startup.momGrowth}%` : "—"}
            />
          </>
        )}
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-zinc-600">{label}</p>
      <p className="font-semibold tabular-nums text-zinc-100">{value}</p>
    </div>
  );
}

export function StartupRow({ startup, rank }: { startup: Startup; rank: number }) {
  const { currency } = useApp();
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}`;
  return (
    <Link
      href={`/startup/${startup.slug}`}
      className="grid grid-cols-[40px_1fr_110px_80px] items-center gap-3 border-b border-white/6 px-3 py-3 text-sm last:border-0 hover:bg-white/[0.03] sm:grid-cols-[48px_1fr_140px_90px]"
    >
      <span className="text-center text-zinc-500">{medal}</span>
      <div className="flex min-w-0 items-center gap-3">
        <LogoMark letter={startup.logoLetter} color={startup.logoColor} size="sm" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium text-zinc-100">
              {startup.anonymous ? "Stealth company" : startup.name}
            </p>
            {startup.forSale && (
              <span className="hidden rounded bg-amber-400/15 px-1.5 py-px text-[10px] font-semibold text-amber-300 sm:inline">
                FOR SALE
              </span>
            )}
          </div>
          <p className="truncate text-xs text-zinc-500">{startup.tagline}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold tabular-nums text-zinc-50">{money(startup.mrrInr, currency)}</p>
        <p className="text-[10px] text-zinc-600">MRR</p>
      </div>
      <div className="text-right tabular-nums text-zinc-400">
        {startup.momGrowth === undefined ? "—" : `${startup.momGrowth > 0 ? "+" : ""}${startup.momGrowth}%`}
      </div>
    </Link>
  );
}

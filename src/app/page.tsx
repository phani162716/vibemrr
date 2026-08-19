"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useApp } from "@/components/app-provider";
import { StartupCard, StartupRow } from "@/components/startup-card";
import { IconArrow, IconShield, IconSpark } from "@/components/icons";
import { money } from "@/lib/format";

export default function HomePage() {
  const { startups, currency } = useApp();

  const { recent, deals, board, totals } = useMemo(() => {
    const sale = startups.filter((s) => s.forSale);
    const recent = [...sale].sort((a, b) => (a.founded < b.founded ? 1 : -1)).slice(0, 10);
    const deals = [...sale]
      .sort((a, b) => {
        const ma = a.askingInr && a.revenue30dInr ? a.askingInr / (a.revenue30dInr * 12) : 99;
        const mb = b.askingInr && b.revenue30dInr ? b.askingInr / (b.revenue30dInr * 12) : 99;
        return ma - mb;
      })
      .slice(0, 10);
    const board = [...startups].sort((a, b) => b.mrrInr - a.mrrInr).slice(0, 20);
    const totals = {
      mrr: startups.reduce((a, s) => a + s.mrrInr, 0),
      all: startups.reduce((a, s) => a + s.allTimeInr, 0),
      sale: sale.length,
      vibe: startups.filter((s) => s.vibeCoded).length,
    };
    return { recent, deals, board, totals };
  }, [startups]);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="grid-fade pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:pt-24">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs text-zinc-400">
            <IconShield className="h-3.5 w-3.5 text-emerald-400" />
            Razorpay · Cashfree · Stripe — live pull, free to list
          </p>
          <h1 className="font-serif max-w-3xl text-4xl leading-[1.1] text-zinc-50 sm:text-6xl">
            The database of verified startup revenues — built for India.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            Browse SaaS, WhatsApp tools, and weekend vibe-coded products with live MRR in{" "}
            <span className="text-zinc-200">rupees</span>. No fake screenshots. Deals close on
            WhatsApp. Listing is free.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/acquire"
              className="inline-flex items-center gap-2 rounded-xl bg-saffron px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-saffron-2"
            >
              Explore the marketplace <IconArrow />
            </Link>
            <Link
              href="/add"
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-5 py-2.5 text-sm text-zinc-200 hover:bg-white/5"
            >
              <IconSpark className="text-saffron" /> Add a startup in 60s
            </Link>
          </div>
          <dl className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <HeroStat label="Verified all-time" value={money(totals.all, currency)} />
            <HeroStat label="Live MRR on platform" value={money(totals.mrr, currency)} />
            <HeroStat label="For sale right now" value={String(totals.sale)} />
            <HeroStat label="Vibe-coded listings" value={String(totals.vibe)} />
          </dl>
        </div>
      </section>

      {startups.length === 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="rounded-2xl border border-dashed border-white/12 px-6 py-16 text-center">
            <h2 className="text-xl font-semibold">The marketplace is live — and empty on purpose</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-zinc-400">
              Fake demo listings are hidden. Only real Indian founders show up here. List yours, then
              invite five people you already know.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/add" className="rounded-xl bg-saffron px-4 py-2 text-sm font-semibold text-zinc-950">
                Add your startup
              </Link>
              <Link href="/invite" className="rounded-xl border border-white/12 px-4 py-2 text-sm">
                Invite 5 founders
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <>
          <Section
            title="Recently listed"
            href="/acquire"
            hint="New Indian SaaS and side projects on the block"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((s) => (
                <StartupCard key={s.slug} startup={s} />
              ))}
            </div>
            {recent.length === 0 && (
              <p className="text-sm text-zinc-500">Nothing for sale yet. Browse the leaderboard or list one.</p>
            )}
          </Section>

          {deals.length > 0 && (
            <Section title="Best deals this week" href="/acquire" hint="Lowest multiples on verified 30-day revenue">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {deals.map((s) => (
                  <StartupCard key={s.slug} startup={s} />
                ))}
              </div>
            </Section>
          )}

          <Section title="Leaderboard" href="/stats" hint="Ranked by verified MRR · IST">
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-card">
              <div className="grid grid-cols-[40px_1fr_110px_80px] gap-3 border-b border-white/8 px-3 py-2 text-[11px] uppercase tracking-wide text-zinc-600 sm:grid-cols-[48px_1fr_140px_90px]">
                <span className="text-center">#</span>
                <span>Startup</span>
                <span className="text-right">MRR</span>
                <span className="text-right">MoM</span>
              </div>
              {board.map((s, i) => (
                <StartupRow key={s.slug} startup={s} rank={i + 1} />
              ))}
            </div>
          </Section>
        </>
      )}
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <dt className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="mt-1 text-xl font-semibold tabular-nums text-zinc-50">{value}</dd>
    </div>
  );
}

function Section({
  title,
  href,
  hint,
  children,
}: {
  title: string;
  href: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-50">{title}</h2>
          <p className="text-sm text-zinc-500">{hint}</p>
        </div>
        <Link href={href} className="text-sm text-saffron hover:text-saffron-2">
          View all
        </Link>
      </div>
      {children}
    </section>
  );
}

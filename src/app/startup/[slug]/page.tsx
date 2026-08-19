"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { LogoMark, StartupCard } from "@/components/startup-card";
import { OfferModal } from "@/components/offer-modal";
import { IconHeart, IconShield, IconSpark, IconWhatsApp } from "@/components/icons";
import { COMPANY_TYPES, PROVIDERS, VIBE_TOOLS } from "@/lib/providers";
import { formatDate, formatMultiple, formatWhen, money, moneyFull } from "@/lib/format";

export default function StartupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { startups, currency, saved, toggleSaved, session } = useApp();
  const [offer, setOffer] = useState(false);

  const startup = startups.find((s) => s.slug === slug);
  const isOwner =
    !!session &&
    !!startup &&
    !startup.isDemo &&
    ((session.id && startup.ownerId === session.id) ||
      (session.email && startup.ownerEmail === session.email));

  const similar = useMemo(() => {
    if (!startup) return [];
    return startups
      .filter((s) => s.slug !== startup.slug && (s.category === startup.category || s.forSale === startup.forSale))
      .slice(0, 3);
  }, [startups, startup]);

  if (!startup) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Startup not found</h1>
        <Link href="/acquire" className="mt-4 inline-block text-saffron">
          Back to marketplace
        </Link>
      </div>
    );
  }

  const provider = PROVIDERS.find((p) => p.id === startup.provider);
  const company = COMPANY_TYPES.find((c) => c.id === startup.companyType);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex items-start gap-4">
            <LogoMark letter={startup.logoLetter} color={startup.logoColor} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight">
                  {startup.anonymous ? "Anonymous startup" : startup.name}
                </h1>
                {startup.forSale && (
                  <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-semibold text-amber-300">
                    FOR SALE
                  </span>
                )}
                {startup.vibeCoded && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-saffron/12 px-2 py-0.5 text-xs text-saffron">
                    <IconSpark className="h-3 w-3" /> Vibe-coded
                  </span>
                )}
                {startup.isDemo && (
                  <span className="rounded-full bg-white/8 px-2 py-0.5 text-xs text-zinc-400">
                    Demo listing
                  </span>
                )}
              </div>
              <p className="mt-1 text-zinc-400">{startup.tagline}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
                <Link href={`/category/${encodeURIComponent(startup.category)}`} className="hover:text-white">
                  {startup.category}
                </Link>
                <span>·</span>
                <span>{startup.city}</span>
                <span>·</span>
                <span>Founded {formatDate(startup.founded)}</span>
              </div>
            </div>
          </div>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-zinc-300">{startup.description}</p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Last 30 days" value={money(startup.revenue30dInr, currency)} />
            <Metric label="MRR" value={money(startup.mrrInr, currency)} />
            <Metric label="All-time" value={money(startup.allTimeInr, currency)} />
            <Metric
              label="MoM growth"
              value={startup.momGrowth !== undefined ? `${startup.momGrowth > 0 ? "+" : ""}${startup.momGrowth}%` : "—"}
            />
            <Metric label="Active subs" value={String(startup.activeSubs)} />
            <Metric label="Profit margin" value={startup.profitMargin ? `${startup.profitMargin}%` : "—"} />
            <Metric label="Team" value={`${startup.teamSize} ${startup.teamSize === 1 ? "person" : "people"}`} />
            <Metric label="Funding" value={startup.funding} />
            {startup.details?.hoursPerWeek != null && (
              <Metric label="Hours / week" value={`${startup.details.hoursPerWeek} hrs`} />
            )}
            {startup.details?.monthlyCostInr != null && (
              <Metric label="Monthly costs" value={money(startup.details.monthlyCostInr, currency)} />
            )}
            {startup.details?.churnPct != null && <Metric label="Churn" value={`${startup.details.churnPct}%`} />}
            {startup.details?.trafficMonthly != null && (
              <Metric label="Monthly visits" value={startup.details.trafficMonthly.toLocaleString("en-IN")} />
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
            <IconShield className={`h-3.5 w-3.5 ${startup.verified ? "text-emerald-400" : "text-zinc-500"}`} />
            {startup.verified
              ? `Revenue pulled live from ${provider?.name} · Last synced ${formatWhen(startup.lastSynced)} IST`
              : "Unverified — founder has not connected Razorpay / Cashfree / Stripe yet. Treat numbers as claims."}
          </div>

          <section className="mt-10">
            <h2 className="text-lg font-semibold">Startup insights</h2>
            <dl className="mt-4 space-y-4 text-sm">
              {startup.valueProp && <Insight k="Value proposition" v={startup.valueProp} />}
              {startup.problem && <Insight k="Problem solved" v={startup.problem} />}
              <Insight k="Audience" v={`${startup.audience} · ~${startup.users ?? startup.customers ?? "—"} users`} />
              {startup.pricing && <Insight k="Pricing" v={startup.pricing} />}
              <Insight k="Entity" v={`${company?.label ?? startup.companyType}${startup.gstin ? ` · GSTIN ${startup.gstin}` : ""}`} />
              {startup.details?.revenueMix && <Insight k="Revenue mix" v={startup.details.revenueMix} />}
              {startup.details?.assetsIncluded && <Insight k="What's included" v={startup.details.assetsIncluded} />}
              {startup.details?.whySelling && <Insight k="Why selling" v={startup.details.whySelling} />}
              {startup.details?.handoverWeeks != null && (
                <Insight k="Handover" v={`${startup.details.handoverWeeks} weeks`} />
              )}
              {startup.details?.competitors && <Insight k="Competitors" v={startup.details.competitors} />}
              {startup.details?.biggestRisk && <Insight k="Biggest risk" v={startup.details.biggestRisk} />}
              {startup.details?.githubUrl && <Insight k="GitHub" v={startup.details.githubUrl} />}
              {startup.lookingForCofounder && <Insight k="Open to" v="Co-founder / operator, not only a full sale" />}
              {startup.additionalInfo && <Insight k="Additional info" v={startup.additionalInfo} />}
            </dl>
          </section>

          {startup.vibeTools.length > 0 && (
            <section className="mt-8">
              <h3 className="text-sm font-semibold">Shipped with</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {startup.vibeTools.map((t) => (
                  <span key={t} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-300">
                    {VIBE_TOOLS.find((v) => v.id === t)?.label ?? t}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold">Tech stack</h3>
              <p className="mt-2 text-xs uppercase tracking-wide text-zinc-600">Frontend</p>
              <Chips items={startup.tech.frontend} />
              <p className="mt-3 text-xs uppercase tracking-wide text-zinc-600">Backend</p>
              <Chips items={startup.tech.backend} />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Marketing channels</h3>
              <Chips items={startup.channels} />
            </div>
          </section>

          {startup.sellerMessage && (
            <blockquote className="mt-10 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Message from the founder</p>
              <p className="mt-2 text-sm leading-7 text-zinc-200">“{startup.sellerMessage}”</p>
              <p className="mt-3 text-xs text-zinc-500">— {startup.founder.name}</p>
            </blockquote>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {startup.forSale && (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
              <p className="text-xs uppercase tracking-wide text-amber-200/80">Asking price</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                {startup.askingInr ? moneyFull(startup.askingInr, currency) : "Make an offer"}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                {formatMultiple(startup.askingInr, startup.revenue30dInr)} trailing 12-month multiple
              </p>
              <button
                onClick={() => setOffer(true)}
                className="mt-4 w-full rounded-xl bg-saffron py-2.5 text-sm font-semibold text-zinc-950"
              >
                Contact seller
              </button>
              {startup.founder.whatsapp && (
                <a
                  href={`https://wa.me/${startup.founder.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm"
                >
                  <IconWhatsApp /> WhatsApp
                </a>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-white/8 bg-card p-5">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Founder</p>
            <Link href={`/founder/${startup.founder.handle}`} className="mt-2 block font-medium hover:text-saffron">
              {startup.founder.name}
            </Link>
            <p className="text-xs text-zinc-500">
              @{startup.founder.handle} · {startup.founder.followers.toLocaleString("en-IN")} on X
            </p>
            {startup.website && !startup.anonymous && (
              <a
                href={startup.website}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm text-saffron"
              >
                Visit site →
              </a>
            )}
            <button
              onClick={() => void toggleSaved(startup.slug).catch((e) => alert(e instanceof Error ? e.message : "Sign in to save"))}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2 text-sm text-zinc-300"
            >
              <IconHeart filled={saved.includes(startup.slug)} className="h-4 w-4 text-saffron" />
              {saved.includes(startup.slug) ? "Saved" : "Save"}
            </button>
            {isOwner && (
              <Link
                href={`/startup/${startup.slug}/edit`}
                className="mt-2 flex w-full items-center justify-center rounded-xl border border-saffron/40 py-2 text-sm text-saffron"
              >
                Edit listing
              </Link>
            )}
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 text-lg font-semibold">More startups</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {similar.map((s) => (
              <StartupCard key={s.slug} startup={s} />
            ))}
          </div>
        </section>
      )}

      {offer && <OfferModal startup={startup} onClose={() => setOffer(false)} />}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-card px-3 py-3">
      <p className="text-[11px] uppercase tracking-wide text-zinc-600">{label}</p>
      <p className="mt-1 font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Insight({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-zinc-600">{k}</dt>
      <dd className="mt-1 text-zinc-200">{v}</dd>
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((t) => (
        <span key={t} className="rounded-full bg-white/6 px-2.5 py-1 text-xs text-zinc-300">
          {t}
        </span>
      ))}
    </div>
  );
}

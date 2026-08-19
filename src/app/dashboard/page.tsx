"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { AuthPanel } from "@/components/auth-panel";
import { LogoMark } from "@/components/startup-card";
import { formatWhen, moneyFull } from "@/lib/format";

type Tab = "startups" | "offers" | "saved" | "profile";

export default function DashboardPage() {
  const { session, signIn, signOut, updateProfile, startups, offers, saved, currency, persistence } =
    useApp();
  const [tab, setTab] = useState<Tab>("startups");
  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [whatsapp, setWhatsapp] = useState(session?.whatsapp ?? "");

  const mine = useMemo(
    () =>
      session
        ? startups.filter(
            (s) =>
              !s.isDemo &&
              ((session.id && s.ownerId === session.id) ||
                (session.email && s.ownerEmail === session.email))
          )
        : [],
    [session, startups]
  );
  const incoming = useMemo(() => {
    const slugs = new Set(mine.map((s) => s.slug));
    return offers.filter((o) => slugs.has(o.startupSlug));
  }, [offers, mine]);
  const savedRows = startups.filter((s) => saved.includes(s.slug));

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-serif text-4xl">Sign in</h1>
        {persistence === "supabase" ? (
          <>
            <p className="mt-2 text-sm text-zinc-400">
              Email + password is free. No Google Cloud. Your account lives in Supabase, not this
              browser.
            </p>
            <div className="mt-6">
              <AuthPanel next="/dashboard" />
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-zinc-400">
              Supabase is not connected yet, so this sign-in stays in your browser.{" "}
              <Link href="/setup" className="text-saffron">
                Connect free auth →
              </Link>
            </p>
            <form
              className="mt-6 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                signIn({ name: name || "Founder", email: email || "you@vibemrr.in", whatsapp });
              }}
            >
              <Input label="Name" value={name} onChange={setName} />
              <Input label="Email" value={email} onChange={setEmail} />
              <Input label="WhatsApp" value={whatsapp} onChange={setWhatsapp} />
              <button className="w-full rounded-xl bg-saffron py-2.5 text-sm font-semibold text-zinc-950">
                Continue
              </button>
            </form>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-3">
          {session.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.avatarUrl} alt="" className="h-10 w-10 rounded-full" />
          )}
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-sm text-zinc-500">Namaste, {session.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/invite" className="rounded-lg border border-white/10 px-3 py-2 text-sm">
            Invite founders
          </Link>
          <Link href="/add" className="rounded-lg bg-saffron px-3 py-2 text-sm font-semibold text-zinc-950">
            Add startup
          </Link>
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto text-sm">
        {(
          [
            ["startups", "My startups"],
            ["offers", `Offers (${incoming.length})`],
            ["saved", "Saved"],
            ["profile", "Profile"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-lg px-3 py-1.5 ${tab === id ? "bg-white/10 text-white" : "text-zinc-500"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "startups" && (
        <div className="mt-6 space-y-3">
          {mine.length === 0 && (
            <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
              You haven&apos;t listed yet. The 60-second flow is on the Add page.
            </p>
          )}
          {mine.map((s) => (
            <div
              key={s.slug}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-card p-4"
            >
              <Link href={`/startup/${s.slug}`} className="flex items-center gap-3">
                <LogoMark letter={s.logoLetter} color={s.logoColor} />
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-zinc-500">
                    {s.forSale ? "On marketplace" : "Database only"} · {s.listingTier}
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-3 text-sm">
                <span className="tabular-nums text-zinc-300">{moneyFull(s.mrrInr, currency)} MRR</span>
                <Link href={`/startup/${s.slug}/edit`} className="text-saffron">
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "offers" && (
        <div className="mt-6 space-y-3">
          {incoming.length === 0 && (
            <p className="text-sm text-zinc-500">No offers yet. Share your listing in indie WhatsApp groups.</p>
          )}
          {incoming.map((o) => {
            const s = startups.find((x) => x.slug === o.startupSlug);
            return (
              <div key={o.id} className="rounded-2xl border border-white/8 bg-card p-4">
                <div className="flex justify-between text-sm">
                  <p className="font-medium">
                    {o.buyerName} → {s?.name}
                  </p>
                  <p className="tabular-nums">{moneyFull(o.amountInr, currency)}</p>
                </div>
                <p className="mt-2 text-sm text-zinc-400">{o.message}</p>
                <p className="mt-2 text-xs text-zinc-600">
                  {o.buyerEmail}
                  {o.buyerWhatsapp ? ` · ${o.buyerWhatsapp}` : ""} · {formatWhen(o.createdAt)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {tab === "saved" && (
        <div className="mt-6 space-y-3">
          {savedRows.length === 0 && <p className="text-sm text-zinc-500">Save listings while you browse.</p>}
          {savedRows.map((s) => (
            <Link key={s.slug} href={`/startup/${s.slug}`} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-card p-4">
              <LogoMark letter={s.logoLetter} color={s.logoColor} />
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-zinc-500">{s.city}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {tab === "profile" && (
        <div className="mt-6 max-w-md space-y-3">
          <Input label="Name" value={name} onChange={setName} />
          <Input label="Email" value={email} onChange={setEmail} />
          <Input label="WhatsApp" value={whatsapp} onChange={setWhatsapp} />
          <button
            onClick={() => updateProfile({ name, email, whatsapp })}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm"
          >
            Save profile
          </button>
          <button onClick={() => void signOut()} className="ml-2 text-sm text-zinc-500">
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-xs text-zinc-400">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
      />
    </label>
  );
}

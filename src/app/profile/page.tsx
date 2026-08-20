"use client";

import Link from "next/link";
import { useApp } from "@/components/app-provider";
import { ProductCard } from "@/components/product-card";
import { moneyFull } from "@/lib/format";

export default function ProfilePage() {
  const { session, products, bids, orders, currency } = useApp();
  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Sign in to see your profile</h1>
        <Link href="/dashboard" className="mt-4 inline-block text-saffron">
          Sign in
        </Link>
      </div>
    );
  }

  const listings = products.filter((p) => p.ownerId === session.id);
  const purchases = orders.filter((o) => o.buyerId === session.id && o.paymentStatus === "paid");
  const initial = session.name.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {session.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-saffron text-2xl font-semibold text-zinc-950">
              {initial}
            </span>
          )}
          <div>
            <h1 className="text-3xl font-semibold">{session.name}</h1>
            <p className="text-sm text-zinc-500">{session.email}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-saffron">
              {session.role ?? "member"} · @{session.handle || session.email.split("@")[0]}
            </p>
            {session.bio && <p className="mt-2 max-w-lg text-sm text-zinc-400">{session.bio}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/settings" className="rounded-lg border border-white/10 px-3 py-2 text-sm">
            Edit profile
          </Link>
          <Link href="/dashboard" className="rounded-lg bg-saffron px-3 py-2 text-sm font-semibold text-zinc-950">
            Dashboard
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Tile label="Listings" value={String(listings.length)} />
        <Tile label="Bids placed" value={String(bids.filter((b) => b.buyerEmail === session.email).length)} />
        <Tile
          label="Purchases"
          value={`${purchases.length} · ${moneyFull(
            purchases.reduce((a, o) => a + o.amountInr, 0),
            currency
          )}`}
        />
      </div>

      <h2 className="mt-10 text-lg font-semibold">Listings</h2>
      {listings.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500">
          Nothing listed yet.{" "}
          <Link href="/add" className="text-saffron">
            Add a product
          </Link>
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-card px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

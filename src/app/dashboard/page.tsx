"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/components/app-provider";
import { AuthPanel } from "@/components/auth-panel";
import { moneyFull } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type Tab = "overview" | "products" | "bids" | "sales" | "saved" | "purchases";

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  );
}

function DashboardInner() {
  const {
    session,
    signIn,
    signOut,
    setRole,
    products,
    bids,
    orders,
    interestedSlugs,
    currency,
    setStatus,
    deleteProduct,
    respondBid,
    checkout,
  } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>("overview");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const t = params.get("tab") as Tab | null;
    if (t && ["overview", "products", "bids", "sales", "saved", "purchases"].includes(t)) {
      setTab(t);
      return;
    }
    if (session?.role === "buyer") setTab("saved");
    if (session?.role === "seller") setTab("overview");
  }, [session?.role, params]);

  const mine = useMemo(
    () => (session?.id ? products.filter((p) => p.ownerId === session.id) : []),
    [session, products]
  );
  const incoming = bids.filter(
    (b) => (session?.id && b.sellerId === session.id) || mine.some((p) => p.slug === b.productSlug)
  );
  const myBids = session ? bids.filter((b) => b.buyerEmail === session.email || b.buyerId === session.id) : [];
  const myOrders = session ? orders.filter((o) => o.buyerId === session.id) : [];
  const sales = session ? orders.filter((o) => o.sellerId === session.id) : [];
  const saved = products.filter((p) => interestedSlugs.includes(p.slug));

  const views = mine.reduce((a, p) => a + p.views, 0);
  const interest = mine.reduce((a, p) => a + p.interested, 0);
  const revenue = sales.filter((o) => o.paymentStatus === "paid").reduce((a, o) => a + o.amountInr, 0);

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-serif text-4xl">Sign in</h1>
        <p className="mt-2 text-sm text-muted">Same account can buy and sell.</p>
        {isSupabaseConfigured() ? (
          <div className="mt-6">
            <AuthPanel next="/dashboard" />
          </div>
        ) : (
          <form
            className="mt-6 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              signIn({ name: name || "User", email: email || "you@vibers.co" });
            }}
          >
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm" />
            <button className="w-full rounded-xl bg-indigo py-2.5 text-sm font-semibold text-white">Continue</button>
          </form>
        )}
      </div>
    );
  }

  if (!session.role) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-serif text-4xl">How will you use Vibers?</h1>
        <p className="mt-2 text-sm text-muted">You can switch later from the dashboard or Settings.</p>
        <div className="mt-6 grid gap-3">
          <button onClick={() => void setRole("buyer")} className="rounded-2xl border border-border p-4 text-left hover:border-accent/40">
            <p className="font-medium">Buyer</p>
            <p className="text-xs text-muted">Browse, bid, and purchase products.</p>
          </button>
          <button onClick={() => void setRole("seller")} className="rounded-2xl border border-border p-4 text-left hover:border-accent/40">
            <p className="font-medium">Seller</p>
            <p className="text-xs text-muted">List products and receive bids.</p>
          </button>
        </div>
      </div>
    );
  }

  const seller = session.role === "seller";
  const tabs: Tab[] = seller ? ["overview", "products", "bids", "sales"] : ["saved", "bids", "purchases"];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{seller ? "Seller" : "Buyer"} dashboard</h1>
          <p className="text-sm text-muted">
            {session.name} · {session.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/profile" className="rounded-lg border border-border px-3 py-2 text-sm">
            Profile
          </Link>
          <button
            onClick={() => void setRole(seller ? "buyer" : "seller")}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          >
            Switch to {seller ? "buyer" : "seller"}
          </button>
          {seller && (
            <Link href="/add" className="rounded-lg bg-indigo px-3 py-2 text-sm font-semibold text-white">
              Add product
            </Link>
          )}
          <button
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
            className="rounded-lg border border-danger/40 px-3 py-2 text-sm text-danger"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        {tabs.map((id) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-lg px-3 py-1.5 capitalize ${tab === id ? "bg-indigo text-white" : "text-muted"}`}
          >
            {id === "saved" ? "Interested" : id}
          </button>
        ))}
      </div>

      {tab === "overview" && seller && (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Tile label="Active listings" value={String(mine.filter((p) => p.status !== "paused").length)} />
          <Tile label="Views" value={String(views)} />
          <Tile label="Interested" value={String(interest)} />
          <Tile label="Bids" value={String(incoming.length)} />
          <Tile label="Sales" value={String(sales.filter((o) => o.paymentStatus === "paid").length)} />
          <Tile label="Revenue" value={moneyFull(revenue, currency)} />
        </div>
      )}

      {tab === "products" && (
        <div className="mt-6 space-y-3">
          {mine.length === 0 && (
            <Empty
              title="No listings yet"
              hint="Publish a product in a few minutes."
              href="/add"
              cta="Add product"
            />
          )}
          {mine.map((p) => (
            <div key={p.slug} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4">
              <div>
                <Link href={`/product/${p.slug}`} className="font-medium hover:text-indigo-2">
                  {p.name}
                </Link>
                <p className="text-xs text-muted">
                  {p.status} · {p.views} views · {p.interested} interested · {p.bidCount} bids
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <Link href={`/product/${p.slug}/analytics`} className="text-indigo-2">
                  Analytics
                </Link>
                <Link href={`/product/${p.slug}/edit`} className="text-muted">
                  Edit
                </Link>
                <button onClick={() => void setStatus(p.slug, p.status === "paused" ? "available" : "paused")}>
                  {p.status === "paused" ? "Unpause" : "Pause"}
                </button>
                <button onClick={() => void setStatus(p.slug, "sold")}>Mark sold</button>
                <button onClick={() => void deleteProduct(p.slug)} className="text-danger">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "bids" && (
        <div className="mt-6 space-y-4">
          {(seller ? incoming : myBids).length === 0 && (
            <Empty title="No bids yet" hint={seller ? "When buyers offer, they show up here." : "Make an offer on a product."} href="/market" cta="Explore" />
          )}
          {(seller ? incoming : myBids).map((b) => (
            <div
              key={b.id}
              className={`rounded-2xl border p-4 text-sm ${
                b.status === "counter" ? "border-accent/40 bg-accent/10" : "border-border"
              }`}
            >
              {b.status === "counter" && !seller && b.messages[b.messages.length - 1]?.role === "seller" && (
                <p className="mb-2 text-xs font-semibold text-accent">
                  Seller countered — {moneyFull(b.amountInr, currency)}. Accept, reject, or send a counter offer.
                </p>
              )}
              {b.status === "counter" && seller && b.messages[b.messages.length - 1]?.role === "buyer" && (
                <p className="mb-2 text-xs font-semibold text-accent">
                  Buyer countered — {moneyFull(b.amountInr, currency)}. Accept, reject, or counter again.
                </p>
              )}
              <p className="font-medium">
                {b.productName} · {b.status}
              </p>
              <p className="text-muted">
                Asking {moneyFull(b.askingInr, currency)} · current {moneyFull(b.amountInr, currency)} · {b.buyerName}
              </p>
              <ol className="mt-3 space-y-1 text-xs text-muted">
                {b.messages.map((m) => (
                  <li key={m.id}>
                    {m.actorName} ({m.kind}
                    {m.amountInr ? ` ₹${m.amountInr}` : ""}): {m.message}
                  </li>
                ))}
              </ol>
              {seller && b.status !== "accepted" && b.status !== "rejected" && b.status !== "purchased" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => void respondBid(b.id, "accept")} className="rounded-lg bg-indigo px-3 py-1 text-xs font-semibold text-white">
                    Accept
                  </button>
                  <button onClick={() => void respondBid(b.id, "reject")} className="rounded-lg border border-border px-3 py-1 text-xs">
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      const n = prompt("Counter amount in ₹", String(b.amountInr));
                      if (n) void respondBid(b.id, "counter", Number(n), "Counter offer");
                    }}
                    className="rounded-lg border border-accent/40 bg-accent px-3 py-1 text-xs font-semibold text-white"
                  >
                    Counter offer
                  </button>
                </div>
              )}
              {!seller && b.status !== "accepted" && b.status !== "rejected" && b.status !== "purchased" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {b.messages[b.messages.length - 1]?.role === "seller" && (
                    <button onClick={() => void respondBid(b.id, "accept")} className="rounded-lg bg-indigo px-3 py-1 text-xs font-semibold text-white">
                      Accept counter
                    </button>
                  )}
                  <button onClick={() => void respondBid(b.id, "reject")} className="rounded-lg border border-border px-3 py-1 text-xs">
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      const n = prompt("Your counter offer in ₹", String(b.amountInr));
                      if (n) void respondBid(b.id, "counter", Number(n), "Counter offer");
                    }}
                    className="rounded-lg border border-accent/40 bg-accent px-3 py-1 text-xs font-semibold text-white"
                  >
                    Counter offer
                  </button>
                </div>
              )}
              {!seller && b.status === "accepted" && (
                <button
                  type="button"
                  onClick={async () => {
                    const p = products.find((x) => x.slug === b.productSlug);
                    if (!p) return;
                    const o = await checkout(p, b.amountInr, b.id);
                    router.push(`/checkout/${o.id}`);
                  }}
                  className="mt-3 text-xs text-indigo-2"
                >
                  Go to checkout
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "saved" && (
        <div className="mt-6 space-y-2">
          {saved.length === 0 && <Empty title="Nothing saved" hint="Tap I'm interested on a product." href="/market" cta="Explore" />}
          {saved.map((p) => (
            <Link key={p.slug} href={`/product/${p.slug}`} className="block rounded-xl border border-border p-4">
              {p.name}
            </Link>
          ))}
        </div>
      )}

      {(tab === "purchases" || tab === "sales") && (
        <div className="mt-6 space-y-2">
          {(tab === "sales" ? sales : myOrders).length === 0 && (
            <Empty
              title={tab === "sales" ? "No sales yet" : "No purchases yet"}
              hint={tab === "sales" ? "Accepted bids convert to checkout." : "Buy now or accept a counter, then pay."}
              href="/market"
              cta="Explore"
            />
          )}
          {(tab === "sales" ? sales : myOrders).map((o) => (
            <Link key={o.id} href={`/checkout/${o.id}`} className="block rounded-xl border border-border p-4 text-sm">
              {o.productName} · {moneyFull(o.amountInr, currency)} · {o.paymentStatus}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Empty({ title, hint, href, cta }: { title: string; hint: string; href: string; cta: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted">{hint}</p>
      <Link href={href} className="mt-4 inline-block text-sm text-indigo-2">
        {cta} →
      </Link>
    </div>
  );
}

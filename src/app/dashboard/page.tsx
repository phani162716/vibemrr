"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app-provider";
import { AuthPanel } from "@/components/auth-panel";
import { moneyFull } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type Tab = "overview" | "products" | "bids" | "sales" | "saved" | "purchases";

export default function DashboardPage() {
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
  const [tab, setTab] = useState<Tab>("overview");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (session?.role === "buyer") setTab("saved");
    if (session?.role === "seller") setTab("overview");
  }, [session?.role]);

  const mine = useMemo(
    () => (session?.id ? products.filter((p) => p.ownerId === session.id) : []),
    [session, products]
  );
  const incoming = bids.filter((b) => mine.some((p) => p.slug === b.productSlug));
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
        <p className="mt-2 text-sm text-zinc-400">Same account can buy and sell.</p>
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
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm" />
            <button className="w-full rounded-xl bg-saffron py-2.5 text-sm font-semibold text-zinc-950">Continue</button>
          </form>
        )}
      </div>
    );
  }

  if (!session.role) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-serif text-4xl">How will you use Vibers?</h1>
        <p className="mt-2 text-sm text-zinc-400">You can switch later from the dashboard or Settings.</p>
        <div className="mt-6 grid gap-3">
          <button onClick={() => void setRole("buyer")} className="rounded-2xl border border-white/10 p-4 text-left hover:border-saffron/40">
            <p className="font-medium">Buyer</p>
            <p className="text-xs text-zinc-500">Browse, bid, and purchase products.</p>
          </button>
          <button onClick={() => void setRole("seller")} className="rounded-2xl border border-white/10 p-4 text-left hover:border-saffron/40">
            <p className="font-medium">Seller</p>
            <p className="text-xs text-zinc-500">List products and receive bids.</p>
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
          <p className="text-sm text-zinc-500">
            {session.name} · {session.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/profile" className="rounded-lg border border-white/10 px-3 py-2 text-sm">
            Profile
          </Link>
          <button
            onClick={() => void setRole(seller ? "buyer" : "seller")}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm"
          >
            Switch to {seller ? "buyer" : "seller"}
          </button>
          {seller && (
            <Link href="/add" className="rounded-lg bg-saffron px-3 py-2 text-sm font-semibold text-zinc-950">
              Add product
            </Link>
          )}
          <button
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
            className="rounded-lg border border-red-400/40 px-3 py-2 text-sm text-red-400"
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
            className={`rounded-lg px-3 py-1.5 capitalize ${tab === id ? "bg-white/10 text-white" : "text-zinc-500"}`}
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
            <div key={p.slug} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 p-4">
              <div>
                <Link href={`/product/${p.slug}`} className="font-medium hover:text-saffron">
                  {p.name}
                </Link>
                <p className="text-xs text-zinc-500">
                  {p.status} · {p.views} views · {p.interested} interested · {p.bidCount} bids
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <Link href={`/product/${p.slug}/analytics`} className="text-saffron">
                  Analytics
                </Link>
                <Link href={`/product/${p.slug}/edit`} className="text-zinc-300">
                  Edit
                </Link>
                <button onClick={() => void setStatus(p.slug, p.status === "paused" ? "available" : "paused")}>
                  {p.status === "paused" ? "Unpause" : "Pause"}
                </button>
                <button onClick={() => void setStatus(p.slug, "sold")}>Mark sold</button>
                <button onClick={() => void deleteProduct(p.slug)} className="text-red-400">
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
            <div key={b.id} className="rounded-2xl border border-white/8 p-4 text-sm">
              <p className="font-medium">
                {b.productName} · {b.status}
              </p>
              <p className="text-zinc-400">
                Asking {moneyFull(b.askingInr, currency)} · current {moneyFull(b.amountInr, currency)} · {b.buyerName}
              </p>
              <ol className="mt-3 space-y-1 text-xs text-zinc-500">
                {b.messages.map((m) => (
                  <li key={m.id}>
                    {m.actorName} ({m.kind}
                    {m.amountInr ? ` ₹${m.amountInr}` : ""}): {m.message}
                  </li>
                ))}
              </ol>
              {seller && b.status !== "accepted" && b.status !== "rejected" && b.status !== "purchased" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => void respondBid(b.id, "accept")} className="rounded-lg bg-saffron px-3 py-1 text-xs font-semibold text-zinc-950">
                    Accept
                  </button>
                  <button onClick={() => void respondBid(b.id, "reject")} className="rounded-lg border border-white/10 px-3 py-1 text-xs">
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      const n = prompt("Counter amount in ₹", String(b.amountInr));
                      if (n) void respondBid(b.id, "counter", Number(n), "Counter offer");
                    }}
                    className="rounded-lg border border-white/10 px-3 py-1 text-xs"
                  >
                    Counter
                  </button>
                </div>
              )}
              {!seller && b.status === "counter" && (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => void respondBid(b.id, "accept")} className="rounded-lg bg-saffron px-3 py-1 text-xs font-semibold text-zinc-950">
                    Accept counter
                  </button>
                  <button onClick={() => void respondBid(b.id, "reject")} className="text-xs text-zinc-500">
                    Reject
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
                  className="mt-3 text-xs text-saffron"
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
            <Link key={p.slug} href={`/product/${p.slug}`} className="block rounded-xl border border-white/8 p-4">
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
            <Link key={o.id} href={`/checkout/${o.id}`} className="block rounded-xl border border-white/8 p-4 text-sm">
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
    <div className="rounded-2xl border border-white/8 bg-card px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Empty({ title, hint, href, cta }: { title: string; hint: string; href: string; cta: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/12 px-6 py-12 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{hint}</p>
      <Link href={href} className="mt-4 inline-block text-sm text-saffron">
        {cta} →
      </Link>
    </div>
  );
}

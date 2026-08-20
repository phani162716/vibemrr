"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app-provider";
import { formatDate, money, moneyFull } from "@/lib/format";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const {
    products,
    session,
    currency,
    recordView,
    toggleInterest,
    interestedSlugs,
    placeBid,
    bids,
    reviews,
    checkout,
  } = useApp();
  const product = products.find((p) => p.slug === slug);
  const [offerOpen, setOfferOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (product) recordView(product.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.slug]);

  const productReviews = useMemo(
    () => reviews.filter((r) => r.productId === product?.id || r.productId === product?.slug),
    [reviews, product]
  );
  const productBids = bids.filter((b) => b.productSlug === slug);
  const isOwner = !!session && product && (session.id === product.ownerId || session.name === product.ownerName);

  if (!product) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <Link href="/market" className="mt-4 inline-block text-indigo-2">
          Explore
        </Link>
      </div>
    );
  }

  async function onBid(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    setErr(null);
    try {
      await placeBid(product, Number(amount), message);
      setOfferOpen(false);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Could not bid");
    }
  }

  async function buyNow() {
    if (!session) {
      router.push("/dashboard");
      return;
    }
    if (!product) return;
    if (!session.whatsapp) {
      setErr("Add your WhatsApp in Settings first.");
      router.push("/settings");
      return;
    }
    try {
      const order = await checkout(product, product.askingInr);
      const { buyerToSellerMessage, peerWhatsAppHref } = await import("@/lib/whatsapp");
      const href = peerWhatsAppHref(
        order.sellerWhatsapp,
        session.whatsapp,
        buyerToSellerMessage(order.productName, order.amountInr)
      );
      if (href) {
        try {
          sessionStorage.setItem(`wa-opened-${order.id}-b`, "1");
        } catch {
          /* ignore */
        }
        window.open(href, "_blank");
      }
      router.push(`/checkout/${order.id}`);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Could not start deal");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">
            {product.productType} · {product.niche}
          </p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight">{product.name}</h1>
          <p className="mt-2 text-muted">{product.shortDescription}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.map((t) => (
              <span key={t} className="rounded-full bg-[#F5F6F8] px-2.5 py-1 text-xs text-muted">
                {t}
              </span>
            ))}
            <span
              className={`rounded-full px-2.5 py-1 text-xs ${
                product.status === "sold" ? "bg-success/15 text-success" : "bg-accent/15 text-accent"
              }`}
            >
              {product.status === "available" ? "New" : product.status}
            </span>
          </div>
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt="" className="mt-6 w-full rounded-2xl border border-border" />
          ) : (
            <div className="mt-6 flex h-48 items-center justify-center rounded-2xl border border-border bg-indigo text-5xl text-white">
              {product.name[0]}
            </div>
          )}
          <article className="mt-8 whitespace-pre-wrap text-sm leading-7 text-foreground">{product.fullDescription}</article>
          <dl className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
            <Meta k="Listed" v={formatDate(product.createdAt)} />
            <div>
              <dt className="text-xs text-muted">Seller</dt>
              <dd>
                {isOwner ? (
                  <Link href="/profile" className="text-indigo-2">
                    {product.ownerName} (you)
                  </Link>
                ) : (
                  product.ownerName
                )}
              </dd>
            </div>
            <Meta k="Views" v={String(product.views)} />
            <Meta k="Interested" v={String(product.interested)} />
            <Meta k="Bids" v={String(product.bidCount || productBids.length)} />
            {product.demoUrl && (
              <div>
                <dt className="text-xs text-muted">Demo</dt>
                <dd>
                  <a href={product.demoUrl} className="text-indigo-2" target="_blank" rel="noreferrer">
                    Open demo
                  </a>
                </dd>
              </div>
            )}
          </dl>
          <section className="mt-10">
            <h2 className="text-lg font-semibold">Reviews</h2>
            {productReviews.length === 0 && <p className="mt-2 text-sm text-muted">No verified reviews yet.</p>}
            <div className="mt-3 space-y-3">
              {productReviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-white p-4 text-sm card-shadow">
                  <p className="font-medium">
                    {r.buyerName} · {"★".repeat(r.rating)}
                  </p>
                  <p className="mt-1 text-muted">{r.comment}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="card-shadow rounded-2xl border border-border bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-muted">Asking price</p>
            <p className="mt-1 text-3xl font-semibold text-indigo">{moneyFull(product.askingInr, currency)}</p>
            {product.status === "sold" ? (
              <p className="mt-4 text-sm font-medium text-success">Sold</p>
            ) : isOwner ? (
              <Link href={`/product/${product.slug}/edit`} className="btn-ghost mt-4 block w-full">
                Edit listing
              </Link>
            ) : (
              <div className="mt-4 space-y-2">
                <button onClick={() => void buyNow()} className="btn-accent w-full">
                  Buy now
                </button>
                <button onClick={() => setOfferOpen(true)} className="btn-accent w-full bg-accent-2 hover:bg-accent">
                  Make an offer
                </button>
                {err && <p className="text-xs text-danger">{err}</p>}
                <button
                  onClick={() => void toggleInterest(product).catch((e) => alert(e.message))}
                  className="btn-ghost w-full"
                >
                  {interestedSlugs.includes(product.slug) ? "Interested ✓" : "I'm interested"}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {offerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <form onSubmit={onBid} className="w-full max-w-md rounded-2xl border border-border bg-white p-5 card-shadow">
            <h3 className="text-lg font-semibold">Make an offer</h3>
            <p className="mt-1 text-xs text-muted">Asking {money(product.askingInr, currency)}</p>
            <label className="mt-4 block text-xs text-muted">
              Bid amount (₹)
              <input
                required
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="field mt-1"
              />
            </label>
            <label className="mt-3 block text-xs text-muted">
              Message (optional)
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Can you include the domain and existing users?"
                className="field mt-1"
              />
            </label>
            {err && <p className="mt-2 text-xs text-danger">{err}</p>}
            <div className="mt-4 flex gap-2">
              <button type="submit" className="btn-accent">
                Submit bid
              </button>
              <button type="button" onClick={() => setOfferOpen(false)} className="text-sm text-muted">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

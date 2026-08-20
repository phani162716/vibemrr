"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/app-provider";
import { moneyFull } from "@/lib/format";
import { lookupProfileWhatsapp } from "@/lib/profile";
import { buyerToSellerMessage, peerWhatsAppHref, sameWhatsApp, sellerToBuyerMessage } from "@/lib/whatsapp";

export default function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { orders, session, currency, markDeal, addReview } = useApp();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [peerOverride, setPeerOverride] = useState<string | undefined>();
  const [looked, setLooked] = useState(false);
  const order = orders.find((o) => o.id === id);
  const isBuyer =
    !!session &&
    !!order &&
    ((!!session.id && session.id === order.buyerId) ||
      (!!session.email && !!order.buyerEmail && session.email === order.buyerEmail));
  const isSeller = !!session && !!order && !!session.id && session.id === order.sellerId;
  const isParty = isBuyer || isSeller;

  const storedPeer = isBuyer ? order?.sellerWhatsapp : isSeller ? order?.buyerWhatsapp : undefined;
  const peerPhone = peerOverride || storedPeer;
  const msg = order
    ? isBuyer
      ? buyerToSellerMessage(order.productName, order.amountInr)
      : sellerToBuyerMessage(order.productName, order.amountInr)
    : "";
  const wa = peerWhatsAppHref(peerPhone, session?.whatsapp, msg);
  const open = order?.dealStatus === "accepted";

  useEffect(() => {
    setPeerOverride(undefined);
    setLooked(false);
  }, [id]);

  useEffect(() => {
    if (!order || !session || (!isBuyer && !isSeller)) return;
    const existing = isBuyer ? order.sellerWhatsapp : order.buyerWhatsapp;
    if (existing && !sameWhatsApp(existing, session.whatsapp)) {
      setLooked(true);
      return;
    }
    const otherId = isBuyer ? order.sellerId : order.buyerId;
    if (!otherId) {
      setLooked(true);
      return;
    }
    let cancelled = false;
    lookupProfileWhatsapp(otherId)
      .then((n) => {
        if (cancelled) return;
        if (n && !sameWhatsApp(n, session.whatsapp)) setPeerOverride(n);
        setLooked(true);
      })
      .catch(() => {
        if (!cancelled) setLooked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [order, isBuyer, isSeller, session]);

  useEffect(() => {
    if (!order || !open || !wa || !isBuyer) return;
    const key = `wa-opened-${order.id}-b`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    window.open(wa, "_blank");
  }, [order, open, wa, isBuyer]);

  const who = useMemo(() => (isBuyer ? "seller" : "buyer"), [isBuyer]);

  if (!order || !session) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Deal not found</h1>
        <Link href="/dashboard" className="mt-4 inline-block text-indigo-2">
          Dashboard
        </Link>
      </div>
    );
  }

  if (!isParty) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">This deal is private</h1>
        <Link href="/dashboard" className="mt-4 inline-block text-indigo-2">
          Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-2">Deal summary</p>
      <h1 className="font-serif mt-1 text-4xl">{order.productName}</h1>
      <p className="mt-4 text-3xl font-semibold text-indigo">{moneyFull(order.amountInr, currency)}</p>
      <dl className="mt-6 space-y-2 text-sm">
        <Row k="Buyer" v={order.buyerName || "Buyer"} />
        <Row k="Seller" v={order.sellerName || "Seller"} />
        <Row k="Agreed price" v={moneyFull(order.amountInr, currency)} />
        <Row k="Accepted" v={new Date(order.acceptedAt).toLocaleString("en-IN")} />
        <Row k="Status" v={order.dealStatus} />
      </dl>
      <p className="mt-4 text-sm text-muted">
        Numbers stay private until a deal is accepted. You chat with the other person, not your own number.
      </p>

      {open && (
        <div className="mt-6 space-y-3">
          {wa ? (
            <a href={wa} target="_blank" rel="noreferrer" className="btn-accent flex w-full">
              Continue on WhatsApp ({isBuyer ? "message seller" : "message buyer"})
            </a>
          ) : !looked ? (
            <p className="rounded-xl border border-border bg-white p-3 text-sm text-muted">Finding the {who}&apos;s WhatsApp…</p>
          ) : (
            <p className="rounded-xl border border-border bg-white p-3 text-sm text-muted">
              The {who}&apos;s WhatsApp is missing. They should add it in Settings (91XXXXXXXXXX).
            </p>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={() => void markDeal(order.id, "completed")} className="btn-primary flex-1">
              Mark deal completed
            </button>
            <button type="button" onClick={() => void markDeal(order.id, "cancelled")} className="btn-ghost flex-1 text-danger">
              Deal cancelled
            </button>
          </div>
        </div>
      )}

      {order.dealStatus === "completed" && (
        <div className="mt-8 space-y-3 rounded-2xl border border-success/30 bg-success/10 p-4">
          <p className="font-medium text-success">Deal completed</p>
          {isBuyer && !reviewed && (
            <form
              className="space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                void addReview(order.productId, order.id, stars, comment);
                setReviewed(true);
              }}
            >
              <p className="text-xs font-medium">Leave a review</p>
              <select value={stars} onChange={(e) => setStars(Number(e.target.value))} className="field">
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} stars
                  </option>
                ))}
              </select>
              <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Short review" className="field" />
              <button className="btn-primary">Submit review</button>
            </form>
          )}
          {reviewed && <p className="text-sm text-success">Review saved.</p>}
        </div>
      )}

      {order.dealStatus === "cancelled" && <p className="mt-6 text-sm text-danger">This deal was cancelled.</p>}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2">
      <dt className="text-muted">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}

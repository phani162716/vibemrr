"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/app-provider";
import { moneyFull } from "@/lib/format";
import { dealWhatsAppMessage, whatsappHref } from "@/lib/whatsapp";

export default function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { orders, session, currency, markDeal, addReview } = useApp();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const order = orders.find((o) => o.id === id);
  const isParty = session && order && (session.id === order.buyerId || session.id === order.sellerId);
  const isBuyer = session && order && session.id === order.buyerId;

  if (!order || !isParty) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Deal not found</h1>
        <p className="mt-2 text-sm text-muted">Deals are private to the buyer and seller.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-indigo-2">
          Dashboard
        </Link>
      </div>
    );
  }

  const msg = dealWhatsAppMessage(order.productName, order.amountInr);
  const wa = order.sellerWhatsapp ? whatsappHref(order.sellerWhatsapp, msg) : null;
  const open = order.dealStatus === "accepted";

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
        Year one: complete payment and handover directly. Vibers recorded this deal before any WhatsApp
        chat. The seller number is not public.
      </p>

      {open && (
        <div className="mt-6 space-y-3">
          {wa ? (
            <a href={wa} target="_blank" rel="noreferrer" className="btn-accent flex w-full">
              Continue on WhatsApp
            </a>
          ) : (
            <p className="rounded-xl border border-border bg-white p-3 text-sm text-muted">
              Seller hasn&apos;t added a WhatsApp number in Settings yet. Ask them to add it, then
              refresh this page.
            </p>
          )}
          <p className="text-xs text-muted">
            Prefilled message: “{msg}”
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => void markDeal(order.id, "completed")} className="btn-primary flex-1">
              Mark deal completed
            </button>
            <button
              type="button"
              onClick={() => void markDeal(order.id, "cancelled")}
              className="btn-ghost flex-1 text-danger"
            >
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

      {order.dealStatus === "cancelled" && (
        <p className="mt-6 text-sm text-danger">This deal was cancelled.</p>
      )}
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

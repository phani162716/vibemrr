"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/app-provider";
import { moneyFull } from "@/lib/format";

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { orders, session, currency, markPaid, saveHandover, addReview } = useApp();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const order = orders.find((o) => o.id === id);
  const [handover, setHandover] = useState(order?.handover ?? {});
  const isSeller = session && order && session.id === order.sellerId;

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Order not found</h1>
        <Link href="/dashboard" className="mt-4 inline-block text-saffron">
          Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="font-serif text-4xl">Checkout</h1>
      <p className="mt-2 text-sm text-zinc-400">{order.productName}</p>
      <p className="mt-4 text-3xl font-semibold">{moneyFull(order.amountInr, currency)}</p>
      <p className="mt-1 text-xs text-zinc-500">Status: {order.paymentStatus}</p>
      <p className="mt-4 text-sm text-zinc-400">
        Payment is modular. Razorpay / Stripe can plug in later. For this MVP, mark the transfer as
        paid after you send UPI / NEFT off-platform.
      </p>
      {order.paymentStatus !== "paid" && (
        <button
          onClick={() => void markPaid(order.id)}
          className="mt-6 w-full rounded-xl bg-saffron py-2.5 text-sm font-semibold text-zinc-950"
        >
          Mark payment successful
        </button>
      )}
      {order.paymentStatus === "paid" && (
        <div className="mt-8 space-y-3 rounded-2xl border border-white/8 p-4">
          <h2 className="font-semibold">Private handover</h2>
          <p className="text-xs text-zinc-500">Never shown on the public listing. Only buyer and seller.</p>
          {["github", "domain", "docs", "notes"].map((k) => (
            <label key={k} className="block text-xs text-zinc-400">
              {k}
              <input
                disabled={!isSeller}
                value={handover[k] ?? ""}
                onChange={(e) => setHandover({ ...handover, [k]: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
              />
            </label>
          ))}
          {isSeller && (
            <button
              onClick={() => void saveHandover(order.id, handover)}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-sm"
            >
              Save handover
            </button>
          )}
          {!isSeller && (
            <form
              className="mt-4 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                void addReview(order.productId, order.id, stars, comment);
                alert("Review saved");
              }}
            >
              <p className="text-xs font-medium text-zinc-300">Leave a verified review</p>
              <select
                value={stars}
                onChange={(e) => setStars(Number(e.target.value))}
                className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-sm"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} stars
                  </option>
                ))}
              </select>
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Short review"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
              />
              <button className="rounded-lg bg-white/10 px-3 py-1.5 text-sm">Submit review</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

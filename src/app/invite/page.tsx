"use client";

import Link from "next/link";

const TEXT = `Check Vibers — buy and sell vibe-coded software in ₹.

https://vibemrr.vercel.app/market`;

export default function InvitePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-4xl">Invite builders</h1>
      <p className="mt-3 text-sm text-zinc-400">Share the marketplace. Listing is free.</p>
      <pre className="mt-6 whitespace-pre-wrap rounded-2xl border border-white/8 p-4 text-sm text-zinc-300">{TEXT}</pre>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(TEXT)}`}
        className="mt-4 inline-block rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-zinc-950"
      >
        Open WhatsApp
      </a>
      <p className="mt-6 text-sm">
        <Link href="/market" className="text-saffron">
          Explore →
        </Link>
      </p>
    </div>
  );
}

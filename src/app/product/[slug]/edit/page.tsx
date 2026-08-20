"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/app-provider";

export default function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { products, session, upsertProduct } = useApp();
  const product = products.find((p) => p.slug === slug);
  const [name, setName] = useState(product?.name ?? "");
  const [shortDescription, setShort] = useState(product?.shortDescription ?? "");
  const [fullDescription, setFull] = useState(product?.fullDescription ?? "");
  const [asking, setAsking] = useState(String(product?.askingInr ?? ""));

  if (!product || (session && product.ownerId && product.ownerId !== session.id && !product.isDemo === false && product.ownerName !== session?.name)) {
    return (
      <div className="px-4 py-16 text-center">
        <p>You can’t edit this listing.</p>
        <Link href="/dashboard" className="text-saffron">
          Dashboard
        </Link>
      </div>
    );
  }

  return (
    <form
      className="mx-auto max-w-2xl space-y-3 px-4 py-10"
      onSubmit={(e) => {
        e.preventDefault();
        if (!product) return;
        void upsertProduct({
          ...product,
          name,
          shortDescription,
          fullDescription,
          askingInr: Number(asking) || 0,
        }).then(() => router.push(`/product/${product.slug}`));
      }}
    >
      <h1 className="font-serif text-4xl">Edit product</h1>
      <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm" />
      <input value={shortDescription} onChange={(e) => setShort(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm" />
      <textarea value={fullDescription} onChange={(e) => setFull(e.target.value)} rows={6} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm" />
      <input type="number" value={asking} onChange={(e) => setAsking(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm" />
      <button className="rounded-xl bg-saffron px-4 py-2 text-sm font-semibold text-zinc-950">Save</button>
    </form>
  );
}

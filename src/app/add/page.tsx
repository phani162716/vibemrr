"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/app-provider";
import { AuthPanel } from "@/components/auth-panel";
import { NICHES, PRODUCT_TYPES, type Product, type ProductType } from "@/lib/types";
import { slugify } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function AddProductPage() {
  const router = useRouter();
  const { session, upsertProduct } = useApp();
  const [name, setName] = useState("");
  const [shortDescription, setShort] = useState("");
  const [fullDescription, setFull] = useState("");
  const [productType, setType] = useState<ProductType>("Web App / SaaS");
  const [niche, setNiche] = useState("Productivity");
  const [tags, setTags] = useState("AI");
  const [asking, setAsking] = useState("");
  const [demoUrl, setDemo] = useState("");
  const [websiteUrl, setSite] = useState("");
  const [images, setImages] = useState("");
  const [whatsapp, setWhatsapp] = useState(session?.whatsapp ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (isSupabaseConfigured() && !session) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-serif text-4xl">Sign in to list</h1>
        <p className="mt-2 text-sm text-muted">A seller can list a product in a few minutes.</p>
        <div className="mt-6">
          <AuthPanel next="/add" />
        </div>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const slug = slugify(name) || `product-${Date.now()}`;
    const img = images
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const product: Product = {
      id: crypto.randomUUID(),
      slug,
      ownerId: session?.id,
      ownerName: session?.name || "Seller",
      name,
      shortDescription,
      fullDescription,
      productType,
      niche,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      askingInr: Number(asking) || 0,
      images: img,
      thumbnailUrl: img[0],
      demoUrl: demoUrl || undefined,
      websiteUrl: websiteUrl || undefined,
      status: "available",
      createdAt: new Date().toISOString(),
      views: 0,
      interested: 0,
      bidCount: 0,
      reviewCount: 0,
      sellerWhatsapp: whatsapp || session?.whatsapp,
    };
    try {
      await upsertProduct(product);
      router.push(`/product/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not list");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-serif text-4xl">Add product</h1>
      <p className="mt-2 text-sm text-muted">Keep it short. You can list in a few minutes.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field label="Product name" value={name} onChange={setName} required />
        <Field label="Short description" value={shortDescription} onChange={setShort} required />
        <label className="block text-xs text-muted">
          Full description
          <textarea
            required
            rows={5}
            value={fullDescription}
            onChange={(e) => setFull(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-muted">
            Product type
            <select
              value={productType}
              onChange={(e) => setType(e.target.value as ProductType)}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              {PRODUCT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-muted">
            Niche
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              {NICHES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>
        <Field label="Tags (comma)" value={tags} onChange={setTags} placeholder="AI, Real Estate" />
        <Field label="Asking price (₹)" value={asking} onChange={setAsking} type="number" required />
        <Field
          label="WhatsApp (private)"
          value={whatsapp}
          onChange={setWhatsapp}
          placeholder="91XXXXXXXXXX"
        />
        <p className="text-xs text-muted">
          Never shown on the public listing. Buyers only get a WhatsApp link after you accept an offer
          or they buy at asking price.
        </p>
        <Field label="Demo URL" value={demoUrl} onChange={setDemo} placeholder="https://" />
        <Field label="Live website (optional)" value={websiteUrl} onChange={setSite} placeholder="https://" />
        <label className="block text-xs text-muted">
          Screenshot URLs (one per line)
          <textarea
            rows={3}
            value={images}
            onChange={(e) => setImages(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          disabled={saving}
          className="rounded-xl bg-indigo px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Publishing…" : "Publish listing"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-xs text-muted">
      {label}
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
      />
    </label>
  );
}

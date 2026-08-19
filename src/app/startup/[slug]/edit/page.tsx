"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app-provider";
import { CATEGORIES, CITIES, COMPANY_TYPES } from "@/lib/providers";
import type { CompanyType, Startup } from "@/lib/types";

export default function EditStartupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { session, startups, addStartup, deleteStartup, ready } = useApp();
  const startup = startups.find((s) => s.slug === slug);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [category, setCategory] = useState("SaaS");
  const [city, setCity] = useState("Bengaluru");
  const [companyType, setCompanyType] = useState<CompanyType>("unregistered");
  const [gstin, setGstin] = useState("");
  const [valueProp, setValueProp] = useState("");
  const [problem, setProblem] = useState("");
  const [pricing, setPricing] = useState("");
  const [sellerMessage, setSellerMessage] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [forSale, setForSale] = useState(false);
  const [asking, setAsking] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!startup) return;
    setName(startup.name);
    setTagline(startup.tagline);
    setDescription(startup.description);
    setWebsite(startup.website ?? "");
    setCategory(startup.category);
    setCity(startup.city);
    setCompanyType(startup.companyType);
    setGstin(startup.gstin ?? "");
    setValueProp(startup.valueProp);
    setProblem(startup.problem);
    setPricing(startup.pricing);
    setSellerMessage(startup.sellerMessage ?? "");
    setWhatsapp(startup.founder.whatsapp ?? "");
    setForSale(startup.forSale);
    setAsking(startup.askingInr ? String(startup.askingInr) : "");
  }, [startup]);

  const isOwner =
    !!session &&
    !!startup &&
    !startup.isDemo &&
    ((session.id && startup.ownerId === session.id) ||
      (session.email && startup.ownerEmail === session.email));

  if (!ready) return <p className="px-4 py-16 text-center text-sm text-zinc-500">Loading…</p>;

  if (!startup || !isOwner) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">You can&apos;t edit this listing</h1>
        <Link href="/dashboard" className="mt-4 inline-block text-saffron">
          Dashboard
        </Link>
      </div>
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!startup) return;
    setSaving(true);
    setError(null);
    const next: Startup = {
      ...startup,
      name,
      tagline,
      description,
      website: website || undefined,
      category,
      city,
      companyType,
      gstin: gstin || undefined,
      valueProp,
      problem,
      pricing,
      sellerMessage: sellerMessage || undefined,
      forSale,
      askingInr: forSale && asking ? Number(asking) : undefined,
      founder: { ...startup.founder, whatsapp: whatsapp || undefined },
    };
    try {
      await addStartup(next);
      router.push(`/startup/${startup.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
      setSaving(false);
    }
  }

  async function remove() {
    if (!startup || !confirm(`Delete ${startup.name}? This cannot be undone.`)) return;
    await deleteStartup(startup.slug);
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wider text-saffron">Edit listing</p>
      <h1 className="font-serif mt-1 text-4xl">{startup.name}</h1>
      <form onSubmit={save} className="mt-8 space-y-3">
        <Field label="Name" value={name} onChange={setName} />
        <Field label="Tagline" value={tagline} onChange={setTagline} />
        <label className="block text-xs text-zinc-400">
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100"
          />
        </label>
        <Field label="Website" value={website} onChange={setWebsite} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Select label="Category" value={category} onChange={setCategory} options={CATEGORIES} />
          <Select label="City" value={city} onChange={setCity} options={CITIES} />
        </div>
        <Select
          label="Entity"
          value={companyType}
          onChange={(v) => setCompanyType(v as CompanyType)}
          options={COMPANY_TYPES.map((c) => c.id)}
          labels={Object.fromEntries(COMPANY_TYPES.map((c) => [c.id, c.label]))}
        />
        <Field label="GSTIN" value={gstin} onChange={setGstin} />
        <Field label="Value proposition" value={valueProp} onChange={setValueProp} />
        <Field label="Problem" value={problem} onChange={setProblem} />
        <Field label="Pricing" value={pricing} onChange={setPricing} />
        <Field label="WhatsApp (91…)" value={whatsapp} onChange={setWhatsapp} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={forSale} onChange={(e) => setForSale(e.target.checked)} />
          Listed for sale
        </label>
        {forSale && <Field label="Asking price (₹)" value={asking} onChange={setAsking} type="number" />}
        <label className="block text-xs text-zinc-400">
          Message to buyers
          <textarea
            value={sellerMessage}
            onChange={(e) => setSellerMessage(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100"
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-saffron px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <Link href={`/startup/${startup.slug}`} className="rounded-lg px-4 py-2 text-sm text-zinc-400">
            Cancel
          </Link>
          <button type="button" onClick={() => void remove()} className="ml-auto text-sm text-red-400">
            Delete listing
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-xs text-zinc-400">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <label className="block text-xs text-zinc-400">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {labels?.[o] ?? o}
          </option>
        ))}
      </select>
    </label>
  );
}

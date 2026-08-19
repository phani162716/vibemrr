"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { AuthPanel } from "@/components/auth-panel";
import { IconCheck, IconSpark } from "@/components/icons";
import {
  CATEGORIES,
  CITIES,
  COMPANY_TYPES,
  LISTING_PLANS,
  PROVIDERS,
  VIBE_TOOLS,
} from "@/lib/providers";
import { formatInrFull, hashMetrics, slugify } from "@/lib/format";
import type { CompanyType, ListingTier, ProviderId, Startup, VibeTool } from "@/lib/types";

const STEPS = ["Basics", "Verify", "Story", "Publish"];

export default function AddPage() {
  const router = useRouter();
  const { session, signIn, addStartup, persistence } = useApp();
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState("SaaS");
  const [city, setCity] = useState("Bengaluru");
  const [provider, setProvider] = useState<ProviderId>("razorpay");
  const [demo, setDemo] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [vibeCoded, setVibeCoded] = useState(true);
  const [vibeTools, setVibeTools] = useState<VibeTool[]>(["cursor"]);
  const [companyType, setCompanyType] = useState<CompanyType>("unregistered");
  const [gstin, setGstin] = useState("");
  const [valueProp, setValueProp] = useState("");
  const [problem, setProblem] = useState("");
  const [pricing, setPricing] = useState("₹499 / month");
  const [forSale, setForSale] = useState(false);
  const [asking, setAsking] = useState("");
  const [tier, setTier] = useState<ListingTier>("free");
  const [email, setEmail] = useState(session?.email ?? "");
  const [founderName, setFounderName] = useState(session?.name ?? "");
  const [whatsapp, setWhatsapp] = useState(session?.whatsapp ?? "");
  const [handle, setHandle] = useState("");

  const metrics = useMemo(() => hashMetrics(name || website || "demo"), [name, website]);

  function toggleTool(id: VibeTool) {
    setVibeTools((cur) => (cur.includes(id) ? cur.filter((t) => t !== id) : [...cur, id]));
  }

  async function publish() {
    const slug = slugify(name) || `startup-${Date.now()}`;
    const ownerEmail = session?.email || email || "founder@vibemrr.in";
    if (!session && persistence === "local") {
      signIn({ email: ownerEmail, name: founderName || "Founder", whatsapp });
    }
    const startup: Startup = {
      slug,
      name: name || "Untitled startup",
      tagline: tagline || "A new Indian SaaS",
      description: valueProp || tagline || "Listed on VibeMRR with verified demo revenue.",
      category,
      website: website || undefined,
      logoLetter: (name || "V").charAt(0).toUpperCase(),
      logoColor: "#FF6B1A",
      forSale,
      askingInr: forSale && asking ? Number(asking) : undefined,
      ...metrics,
      provider,
      lastSynced: new Date().toISOString(),
      founded: new Date().toISOString(),
      city,
      companyType,
      gstin: gstin || undefined,
      founder: {
        name: founderName || "Founder",
        handle: handle.replace("@", "") || slugify(founderName || "founder"),
        followers: 0,
        whatsapp: whatsapp || undefined,
      },
      vibeCoded,
      vibeTools,
      funding: "Bootstrapped",
      teamSize: 1,
      audience: "B2B",
      pricing,
      valueProp: valueProp || tagline,
      problem: problem || "Founders still paste fake MRR screenshots.",
      sellerMessage: forSale ? "Listed from the 60-second VibeMRR flow." : undefined,
      tech: { frontend: ["Next.js"], backend: [provider === "razorpay" ? "Razorpay" : "Stripe"] },
      channels: ["Twitter", "WhatsApp"],
      listingTier: forSale ? (tier === "free" ? "starter" : tier) : "free",
      ownerEmail,
      ownerId: session?.id,
      isDemo: false,
    };
    setError(null);
    setPublishing(true);
    try {
      await addStartup(startup);
      router.push(`/startup/${slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not publish");
      setPublishing(false);
    }
  }

  if (persistence === "supabase" && !session) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <p className="text-xs font-semibold uppercase tracking-wider text-saffron">60-second listing</p>
        <h1 className="font-serif mt-1 text-4xl">Sign in to list</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Create a free email account. The listing is saved to the database, not this browser. No
          Google Cloud.
        </p>
        <div className="mt-6">
          <AuthPanel next="/add" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wider text-saffron">60-second listing</p>
      <h1 className="font-serif mt-1 text-4xl text-zinc-50">Add your startup</h1>
      <p className="mt-2 text-sm text-zinc-400">
        TrustMRR asks for a live Stripe key before you can exist. Here you can demo-verify instantly
        — then swap in a Razorpay/Cashfree restricted key when you&apos;re ready.
      </p>

      <ol className="mt-6 flex gap-2 text-xs">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={`flex-1 rounded-full px-2 py-1 text-center ${
              i === step ? "bg-saffron text-zinc-950" : i < step ? "bg-emerald-500/20 text-emerald-300" : "bg-white/6 text-zinc-500"
            }`}
          >
            {s}
          </li>
        ))}
      </ol>

      <div className="mt-8 space-y-4">
        {step === 0 && (
          <>
            <Field label="Startup name" value={name} onChange={setName} placeholder="FilGST" />
            <Field label="Website" value={website} onChange={setWebsite} placeholder="https://filgst.com" />
            <Field label="One-line pitch" value={tagline} onChange={setTagline} placeholder="GST filing CAs don't hate" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Select label="Category" value={category} onChange={setCategory} options={CATEGORIES} />
              <Select label="City" value={city} onChange={setCity} options={CITIES} />
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" checked={vibeCoded} onChange={(e) => setVibeCoded(e.target.checked)} />
              I vibe-coded this (Cursor / Claude / Grok / friends)
            </label>
          </>
        )}

        {step === 1 && (
          <>
            <p className="text-sm text-zinc-400">
              Pick how we verify rupees. Demo verify is for shipping the page today. Production keys
              stay read-only.
            </p>
            <div className="grid gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  className={`rounded-xl border px-4 py-3 text-left ${
                    provider === p.id ? "border-saffron/50 bg-saffron/10" : "border-white/8 bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{p.name}</span>
                    {p.indiaFirst && <span className="text-[10px] text-saffron">India-first</span>}
                  </div>
                  <p className="text-xs text-zinc-500">{p.blurb}</p>
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={demo} onChange={(e) => setDemo(e.target.checked)} />
              Demo-verify now (no API key) — recommended for vibe coders
            </label>
            {!demo && (
              <Field
                label={`Restricted ${PROVIDERS.find((p) => p.id === provider)?.name} key`}
                value={apiKey}
                onChange={setApiKey}
                placeholder="rzp_test_… or rk_live_…"
              />
            )}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-4 text-sm">
              <p className="font-medium text-emerald-300">Preview metrics</p>
              <p className="mt-1 text-zinc-300">
                MRR {formatInrFull(metrics.mrrInr)} · 30d {formatInrFull(metrics.revenue30dInr)} ·{" "}
                {metrics.activeSubs} subs
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                In production these come from the payment API. Demo hashes your name so every listing
                looks different.
              </p>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Your name" value={founderName} onChange={setFounderName} />
            <Field label="Email" value={email} onChange={setEmail} />
            <Field label="WhatsApp (91…)" value={whatsapp} onChange={setWhatsapp} />
            <Field label="X handle" value={handle} onChange={setHandle} placeholder="ananyaBuilds" />
            <Select
              label="Entity"
              value={companyType}
              onChange={(v) => setCompanyType(v as CompanyType)}
              options={COMPANY_TYPES.map((c) => c.id)}
              labels={Object.fromEntries(COMPANY_TYPES.map((c) => [c.id, c.label]))}
            />
            <Field label="GSTIN (optional)" value={gstin} onChange={setGstin} placeholder="29AAAAA0000A1Z5" />
            <Field label="Value proposition" value={valueProp} onChange={setValueProp} />
            <Field label="Problem you solve" value={problem} onChange={setProblem} />
            <Field label="Pricing" value={pricing} onChange={setPricing} />
            {vibeCoded && (
              <div>
                <p className="mb-2 text-xs text-zinc-400">Built with</p>
                <div className="flex flex-wrap gap-2">
                  {VIBE_TOOLS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTool(t.id)}
                      className={`rounded-full px-3 py-1 text-xs ${
                        vibeTools.includes(t.id) ? "bg-saffron text-zinc-950" : "bg-white/8 text-zinc-300"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={forSale} onChange={(e) => setForSale(e.target.checked)} />
              Also list this on the marketplace
            </label>
            {forSale && (
              <>
                <Field label="Asking price (₹)" value={asking} onChange={setAsking} type="number" />
                <div className="grid gap-2">
                  {LISTING_PLANS.filter((p) => p.id !== "free").map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setTier(p.id)}
                      className={`rounded-xl border p-4 text-left ${
                        tier === p.id ? "border-saffron/50 bg-saffron/10" : "border-white/8"
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{p.name}</span>
                        <span>{p.priceInr === 0 ? "Free" : formatInrFull(p.priceInr)}</span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">{p.perks.join(" · ")}</p>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-zinc-500">
                  Checkout is mocked in this build. Plans are priced for India (not $29 / $199 / $499).
                </p>
              </>
            )}
            <div className="rounded-xl border border-white/8 bg-card p-4 text-sm text-zinc-300">
              <p className="font-medium text-zinc-100">{name || "Untitled"}</p>
              <p>{city} · {category} · {provider}</p>
              <p className="mt-1">{formatInrFull(metrics.mrrInr)} MRR</p>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
          className="rounded-lg px-4 py-2 text-sm text-zinc-400 disabled:opacity-30"
        >
          Back
        </button>
        {step < 3 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="rounded-lg bg-saffron px-4 py-2 text-sm font-semibold text-zinc-950"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={publish}
            disabled={publishing}
            className="inline-flex items-center gap-2 rounded-lg bg-saffron px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-60"
          >
            <IconCheck /> {publishing ? "Publishing…" : "Publish"}
          </button>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      <p className="mt-6 flex items-center gap-2 text-xs text-zinc-600">
        <IconSpark className="text-saffron" />
        Vibe coder path: name → demo verify → WhatsApp → live page.
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block text-xs text-zinc-400">
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-saffron/40"
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

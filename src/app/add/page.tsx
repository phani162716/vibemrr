"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/app-provider";
import { AuthPanel } from "@/components/auth-panel";
import { IconCheck, IconSpark } from "@/components/icons";
import { CATEGORIES, CITIES, COMPANY_TYPES, PROVIDERS, VIBE_TOOLS } from "@/lib/providers";
import { formatInrFull, slugify } from "@/lib/format";
import type { CompanyType, ProviderId, Startup, VibeTool } from "@/lib/types";
import type { VerifyMetrics } from "@/lib/verify/types";

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
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [metrics, setMetrics] = useState<VerifyMetrics | null>(null);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [vibeCoded, setVibeCoded] = useState(true);
  const [vibeTools, setVibeTools] = useState<VibeTool[]>(["cursor"]);
  const [companyType, setCompanyType] = useState<CompanyType>("unregistered");
  const [gstin, setGstin] = useState("");
  const [valueProp, setValueProp] = useState("");
  const [problem, setProblem] = useState("");
  const [pricing, setPricing] = useState("₹499 / month");
  const [forSale, setForSale] = useState(false);
  const [asking, setAsking] = useState("");
  const [email, setEmail] = useState(session?.email ?? "");
  const [founderName, setFounderName] = useState(session?.name ?? "");
  const [whatsapp, setWhatsapp] = useState(session?.whatsapp ?? "");
  const [handle, setHandle] = useState("");

  const zeros: VerifyMetrics = {
    mrrInr: 0,
    revenue30dInr: 0,
    allTimeInr: 0,
    activeSubs: 0,
    customers: 0,
    momGrowth: 0,
  };

  function toggleTool(id: VibeTool) {
    setVibeTools((cur) => (cur.includes(id) ? cur.filter((t) => t !== id) : [...cur, id]));
  }

  async function runVerify() {
    setVerifying(true);
    setError(null);
    try {
      const res = await fetch("/api/verify-revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, keyId, keySecret }),
      });
      const data = (await res.json()) as { error?: string; metrics?: VerifyMetrics };
      if (!res.ok || !data.metrics) throw new Error(data.error || "Verification failed");
      setMetrics(data.metrics);
      setVerified(true);
    } catch (e) {
      setVerified(false);
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
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
      description: valueProp || tagline || "Listed on VibeMRR.",
      category,
      website: website || undefined,
      logoLetter: (name || "V").charAt(0).toUpperCase(),
      logoColor: "#FF6B1A",
      forSale,
      askingInr: forSale && asking ? Number(asking) : undefined,
      ...(metrics ?? zeros),
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
      tech: {
        frontend: ["Next.js"],
        backend: [provider === "razorpay" ? "Razorpay" : "Stripe"],
        verified,
      },
      verified,
      channels: ["Twitter", "WhatsApp"],
      listingTier: "free",
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
        Listing is free. Connect Razorpay, Cashfree, or Stripe so the rupee numbers come from the
        payment API — not a screenshot, not a hash.
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
              Live verify uses Razorpay, Cashfree, or Stripe. Keys are sent to our server, used once
              to pull totals, and never stored. The site is free.
            </p>
            <div className="grid gap-2">
              {PROVIDERS.filter((p) => ["razorpay", "cashfree", "stripe"].includes(p.id)).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setProvider(p.id);
                    setVerified(false);
                    setMetrics(null);
                  }}
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
            {provider !== "stripe" && (
              <Field
                label={provider === "cashfree" ? "Cashfree Client ID" : "Razorpay Key Id (rzp_live_…)"}
                value={keyId}
                onChange={setKeyId}
                placeholder={provider === "cashfree" ? "CF…" : "rzp_live_…"}
              />
            )}
            <Field
              label={
                provider === "stripe"
                  ? "Stripe restricted or secret key"
                  : provider === "cashfree"
                    ? "Cashfree Client Secret"
                    : "Razorpay Key Secret"
              }
              value={keySecret}
              onChange={setKeySecret}
              placeholder={provider === "stripe" ? "rk_live_… or sk_live_…" : "secret"}
              type="password"
            />
            <button
              type="button"
              onClick={() => void runVerify()}
              disabled={verifying || !keySecret}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm disabled:opacity-40"
            >
              {verifying ? "Talking to the payment API…" : "Pull live revenue"}
            </button>
            {verified && metrics && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-4 text-sm">
                <p className="font-medium text-emerald-300">Live numbers from {provider}</p>
                <p className="mt-1 text-zinc-300">
                  MRR {formatInrFull(metrics.mrrInr)} · last 30 days {formatInrFull(metrics.revenue30dInr)} ·
                  all-time {formatInrFull(metrics.allTimeInr)} · {metrics.activeSubs} subs
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setVerified(false);
                setMetrics(zeros);
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Skip for now — list as unverified (₹0)
            </button>
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
            {forSale && <Field label="Asking price (₹)" value={asking} onChange={setAsking} type="number" />}
            <p className="text-xs text-zinc-500">Everything is free. No listing fee this year.</p>
            <div className="rounded-xl border border-white/8 bg-card p-4 text-sm text-zinc-300">
              <p className="font-medium text-zinc-100">{name || "Untitled"}</p>
              <p>
                {city} · {category} · {provider} · {verified ? "provider-verified" : "unverified"}
              </p>
              <p className="mt-1">{formatInrFull((metrics ?? zeros).mrrInr)} MRR</p>
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
        Free forever this year. Connect Razorpay for a Verified badge.
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

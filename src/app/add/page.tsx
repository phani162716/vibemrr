"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/app-provider";
import { AuthPanel } from "@/components/auth-panel";
import { IconCheck, IconSpark } from "@/components/icons";
import { CATEGORIES, CITIES, COMPANY_TYPES, PROVIDERS, VIBE_TOOLS } from "@/lib/providers";
import { formatInrFull, slugify } from "@/lib/format";
import type { Audience, CompanyType, ProviderId, Startup, VibeTool } from "@/lib/types";
import type { VerifyMetrics } from "@/lib/verify/types";

const STEPS = ["Basics", "Verify", "For buyers", "Publish"];

const CHANNELS = [
  "WhatsApp",
  "Twitter / X",
  "LinkedIn",
  "SEO",
  "Cold email",
  "YouTube",
  "Instagram",
  "Peerlist",
  "Product Hunt",
  "Field sales",
];

export default function AddPage() {
  const router = useRouter();
  const { session, signIn, addStartup, persistence } = useApp();
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("SaaS");
  const [city, setCity] = useState("Bengaluru");
  const [founded, setFounded] = useState(() => new Date().toISOString().slice(0, 7));
  const [audience, setAudience] = useState<Audience>("B2B");
  const [funding, setFunding] = useState<Startup["funding"]>("Bootstrapped");
  const [teamSize, setTeamSize] = useState("1");
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
  const [users, setUsers] = useState("");
  const [profitMargin, setProfitMargin] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("5");
  const [monthlyCost, setMonthlyCost] = useState("");
  const [churnPct, setChurnPct] = useState("");
  const [traffic, setTraffic] = useState("");
  const [frontend, setFrontend] = useState("Next.js, Tailwind");
  const [backend, setBackend] = useState("Supabase, Razorpay");
  const [assets, setAssets] = useState("Source code, domain, Razorpay account, socials");
  const [githubUrl, setGithubUrl] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [revenueMix, setRevenueMix] = useState("Mostly monthly subscriptions");
  const [biggestRisk, setBiggestRisk] = useState("");
  const [whySelling, setWhySelling] = useState("");
  const [handoverWeeks, setHandoverWeeks] = useState("2");
  const [sellerMessage, setSellerMessage] = useState("");
  const [channels, setChannels] = useState<string[]>(["WhatsApp", "Twitter / X"]);
  const [lookingForCofounder, setLookingForCofounder] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
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

  function toggleChannel(ch: string) {
    setChannels((cur) => (cur.includes(ch) ? cur.filter((c) => c !== ch) : [...cur, ch]));
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
      anonymous,
      tagline: tagline || "A new Indian SaaS",
      description: description || valueProp || tagline || "Listed on VibeMRR.",
      category,
      website: website || undefined,
      logoLetter: (name || "V").charAt(0).toUpperCase(),
      logoColor: "#FF6B1A",
      forSale,
      askingInr: forSale && asking ? Number(asking) : undefined,
      ...(metrics ?? zeros),
      provider,
      lastSynced: new Date().toISOString(),
      founded: founded ? `${founded}-01` : new Date().toISOString(),
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
      funding,
      teamSize: Number(teamSize) || 1,
      audience,
      pricing,
      valueProp: valueProp || tagline,
      problem: problem || "",
      users: users ? Number(users) : undefined,
      profitMargin: profitMargin ? Number(profitMargin) : undefined,
      lookingForCofounder,
      sellerMessage: sellerMessage || (forSale ? whySelling : undefined) || undefined,
      additionalInfo: biggestRisk || undefined,
      tech: {
        frontend: frontend.split(",").map((s) => s.trim()).filter(Boolean),
        backend: backend.split(",").map((s) => s.trim()).filter(Boolean),
        verified,
      },
      details: {
        hoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : undefined,
        monthlyCostInr: monthlyCost ? Number(monthlyCost) : undefined,
        assetsIncluded: assets || undefined,
        whySelling: whySelling || undefined,
        churnPct: churnPct ? Number(churnPct) : undefined,
        trafficMonthly: traffic ? Number(traffic) : undefined,
        githubUrl: githubUrl || undefined,
        handoverWeeks: handoverWeeks ? Number(handoverWeeks) : undefined,
        biggestRisk: biggestRisk || undefined,
        competitors: competitors || undefined,
        revenueMix: revenueMix || undefined,
      },
      verified,
      channels,
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
        <p className="text-xs font-semibold uppercase tracking-wider text-saffron">Free listing</p>
        <h1 className="font-serif mt-1 text-4xl">Sign in to list</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Create a free email account. The listing is saved to the database, not this browser.
        </p>
        <div className="mt-6">
          <AuthPanel next="/add" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wider text-saffron">Free listing</p>
      <h1 className="font-serif mt-1 text-4xl text-zinc-50">Add your startup</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Buyers underwrite with these fields. Connect Razorpay so the rupees are pulled, not typed.
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

      <div className="mt-8 space-y-5">
        {step === 0 && (
          <>
            <Subhead title="What is this product?" note="Shown at the top of the public page." />
            <Field label="Startup name" value={name} onChange={setName} placeholder="FilGST" hint="Brand buyers will search for." />
            <Field label="Website" value={website} onChange={setWebsite} placeholder="https://filgst.com" hint="Live URL. Skip if stealth." />
            <Field
              label="One-line pitch"
              value={tagline}
              onChange={setTagline}
              placeholder="GST filing CAs don't hate"
              hint="One sentence. What it does, for whom."
            />
            <Area
              label="Short description"
              value={description}
              onChange={setDescription}
              hint="3–5 lines a buyer can screenshot into a WhatsApp chat."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Select label="Category" value={category} onChange={setCategory} options={CATEGORIES} />
              <Select label="City" value={city} onChange={setCity} options={CITIES} />
              <Select label="Audience" value={audience} onChange={(v) => setAudience(v as Audience)} options={["B2B", "B2C", "B2B2C"]} />
              <Select
                label="Funding"
                value={funding}
                onChange={(v) => setFunding(v as Startup["funding"])}
                options={["Bootstrapped", "Angel", "Seed"]}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Founded (month)" value={founded} onChange={setFounded} type="month" hint="Age of the business." />
              <Field label="Team size" value={teamSize} onChange={setTeamSize} type="number" hint="People who run it today." />
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" checked={vibeCoded} onChange={(e) => setVibeCoded(e.target.checked)} />
              I vibe-coded this (Cursor / Claude / Grok / friends)
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
              List as anonymous / stealth (hide brand + website)
            </label>
          </>
        )}

        {step === 1 && (
          <>
            <Subhead
              title="Why connect a payment account?"
              note="Buyers on this site ignore screenshots. A Key Id + Secret lets us read captured payments and active subscriptions from the provider, then throw the secret away."
            />
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

            {provider === "razorpay" && (
              <div className="space-y-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs text-zinc-500">
                  Dashboard →{" "}
                  <a
                    className="text-saffron"
                    href="https://dashboard.razorpay.com/app/keys"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Account &amp; Settings → API Keys
                  </a>{" "}
                  → Generate live keys. Use <span className="text-zinc-300">rzp_live_</span>, not test.
                </p>
                <div>
                  <p className="text-sm font-medium text-zinc-100">Why Razorpay Key Id?</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    The Key Id (starts with <code className="text-zinc-300">rzp_live_</code>) is the public name of
                    your merchant account — like an account number. It tells us which Razorpay
                    business to read. It cannot refund or charge customers by itself. Buyers never
                    see it.
                  </p>
                  <Field
                    label="Key Id"
                    value={keyId}
                    onChange={setKeyId}
                    placeholder="rzp_live_…"
                    hint="Example: rzp_live_AbCdEf123456"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-100">Why Key Secret?</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    The Secret is the password for that Key Id. We send both to our server once, sum
                    captured payments + active plans, then discard the secret. We do not save it in
                    the database. Never paste a key that is sitting in a public GitHub repo.
                  </p>
                  <Field
                    label="Key Secret"
                    value={keySecret}
                    onChange={setKeySecret}
                    placeholder="secret"
                    type="password"
                    hint="Shown only once in Razorpay when you generate the pair."
                  />
                </div>
              </div>
            )}

            {provider === "cashfree" && (
              <div className="space-y-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-zinc-100">Why Cashfree Client ID?</p>
                <p className="text-xs leading-5 text-zinc-500">
                  Client ID is the public app id of your Cashfree PG account (Developers → API Keys).
                  It identifies which merchant we query.
                </p>
                <Field label="Client ID" value={keyId} onChange={setKeyId} placeholder="CF…" />
                <p className="text-sm font-medium text-zinc-100">Why Client Secret?</p>
                <p className="text-xs leading-5 text-zinc-500">
                  Proves you own that app. Used once to list paid orders for the last 30 days. Not
                  stored.
                </p>
                <Field
                  label="Client Secret"
                  value={keySecret}
                  onChange={setKeySecret}
                  type="password"
                  placeholder="secret"
                />
              </div>
            )}

            {provider === "stripe" && (
              <div className="space-y-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-zinc-100">Why a Stripe key?</p>
                <p className="text-xs leading-5 text-zinc-500">
                  Prefer a restricted key <code className="text-zinc-300">rk_live_</code> with read-only
                  charges + subscriptions. A secret <code className="text-zinc-300">sk_live_</code>{" "}
                  also works but is broader. We only list charges and active subs, then drop the key.
                </p>
                <Field
                  label="Restricted or secret key"
                  value={keySecret}
                  onChange={setKeySecret}
                  type="password"
                  placeholder="rk_live_… or sk_live_…"
                />
              </div>
            )}

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
            <Subhead title="Founder contact" note="Buyers use WhatsApp first. Email is for the offer inbox." />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Your name" value={founderName} onChange={setFounderName} />
              <Field label="Email" value={email} onChange={setEmail} />
              <Field
                label="WhatsApp"
                value={whatsapp}
                onChange={setWhatsapp}
                placeholder="91XXXXXXXXXX"
                hint="Country code + number, no + or spaces."
              />
              <Field label="X handle" value={handle} onChange={setHandle} placeholder="ananyaBuilds" />
            </div>

            <Subhead title="Legal entity" note="Matters for GST and how the sale is structured." />
            <Select
              label="Entity"
              value={companyType}
              onChange={(v) => setCompanyType(v as CompanyType)}
              options={COMPANY_TYPES.map((c) => c.id)}
              labels={Object.fromEntries(COMPANY_TYPES.map((c) => [c.id, c.label]))}
            />
            <Field
              label="GSTIN (optional)"
              value={gstin}
              onChange={setGstin}
              placeholder="29AAAAA0000A1Z5"
              hint="If you invoice in India. Leave blank if unregistered."
            />

            <Subhead title="What buyers need to underwrite" note="Empty fields show as — on the public page." />
            <Field
              label="Value proposition"
              value={valueProp}
              onChange={setValueProp}
              hint="The job the customer hires you for."
            />
            <Field label="Problem you solve" value={problem} onChange={setProblem} />
            <Field
              label="Pricing"
              value={pricing}
              onChange={setPricing}
              hint="e.g. ₹499 / month · annual 2 months free"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Users (approx)" value={users} onChange={setUsers} type="number" hint="Signed-up or monthly actives." />
              <Field
                label="Profit margin %"
                value={profitMargin}
                onChange={setProfitMargin}
                type="number"
                hint="Last 30 days, after infra + tools."
              />
              <Field
                label="Hours / week to run"
                value={hoursPerWeek}
                onChange={setHoursPerWeek}
                type="number"
                hint="Owner time. Buyers filter on this."
              />
              <Field
                label="Monthly costs (₹)"
                value={monthlyCost}
                onChange={setMonthlyCost}
                type="number"
                hint="AWS, LLM, WhatsApp, domains."
              />
              <Field label="Monthly churn %" value={churnPct} onChange={setChurnPct} type="number" />
              <Field
                label="Monthly visits"
                value={traffic}
                onChange={setTraffic}
                type="number"
                hint="Unique visitors, not pageviews."
              />
            </div>
            <Field
              label="Revenue mix"
              value={revenueMix}
              onChange={setRevenueMix}
              hint="e.g. 80% subscriptions, 20% one-time."
            />
            <Field
              label="Frontend stack"
              value={frontend}
              onChange={setFrontend}
              hint="Comma-separated. Next.js, Flutter…"
            />
            <Field
              label="Backend / payments"
              value={backend}
              onChange={setBackend}
              hint="Comma-separated. Supabase, Razorpay…"
            />
            <Field label="GitHub (optional)" value={githubUrl} onChange={setGithubUrl} placeholder="https://github.com/…" />
            <Field
              label="Competitors"
              value={competitors}
              onChange={setCompetitors}
              hint="2–3 names a buyer already knows."
            />
            <Field
              label="Biggest risk"
              value={biggestRisk}
              onChange={setBiggestRisk}
              hint="Be honest. Platform risk, one customer, API costs."
            />
            <p className="text-xs text-zinc-400">How customers find you</p>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => toggleChannel(ch)}
                  className={`rounded-full px-3 py-1 text-xs ${
                    channels.includes(ch) ? "bg-saffron text-zinc-950" : "bg-white/8 text-zinc-300"
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
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
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={lookingForCofounder}
                onChange={(e) => setLookingForCofounder(e.target.checked)}
              />
              Open to a co-founder / operator, not only a full sale
            </label>
          </>
        )}

        {step === 3 && (
          <>
            <Subhead title="Sale terms" note="Skip if you are only proving revenue, not selling." />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={forSale} onChange={(e) => setForSale(e.target.checked)} />
              Also list this on the marketplace
            </label>
            {forSale && (
              <>
                <Field label="Asking price (₹)" value={asking} onChange={setAsking} type="number" hint="What you would take this month." />
                <Field
                  label="Why are you selling?"
                  value={whySelling}
                  onChange={setWhySelling}
                  hint="New job, new product, no time. Buyers discount vague answers."
                />
                <Field
                  label="What is included?"
                  value={assets}
                  onChange={setAssets}
                  hint="Code, domain, customers, Razorpay, socials, IP."
                />
                <Field
                  label="Handover (weeks)"
                  value={handoverWeeks}
                  onChange={setHandoverWeeks}
                  type="number"
                />
                <Area
                  label="Message to buyers"
                  value={sellerMessage}
                  onChange={setSellerMessage}
                  hint="Shown as a quote on the listing."
                />
              </>
            )}
            <p className="text-xs text-zinc-500">Everything is free. No listing fee this year.</p>
            <div className="rounded-xl border border-white/8 bg-card p-4 text-sm text-zinc-300">
              <p className="font-medium text-zinc-100">{name || "Untitled"}</p>
              <p>
                {city} · {category} · {audience} · {verified ? "provider-verified" : "unverified"}
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
        Free this year. Verified badge only after a live Razorpay / Cashfree / Stripe pull.
      </p>
    </div>
  );
}

function Subhead({ title, note }: { title: string; note: string }) {
  return (
    <div className="pt-1">
      <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
      <p className="mt-0.5 text-xs leading-5 text-zinc-500">{note}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <label className="block text-xs text-zinc-400">
      {label}
      {hint && <span className="mt-0.5 block text-[11px] font-normal leading-4 text-zinc-600">{hint}</span>}
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

function Area({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <label className="block text-xs text-zinc-400">
      {label}
      {hint && <span className="mt-0.5 block text-[11px] leading-4 text-zinc-600">{hint}</span>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
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

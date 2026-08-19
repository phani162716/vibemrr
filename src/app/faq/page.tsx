import Link from "next/link";

const SECTIONS: { title: string; qas: { q: string; a: string }[] }[] = [
  {
    title: "Getting started",
    qas: [
      {
        q: "What is VibeMRR?",
        a: "A verified-revenue database and acquisition marketplace for Indian SaaS, WhatsApp tools, and vibe-coded side projects. Founders connect Razorpay, Cashfree, PhonePe, PayU, Stripe, Dodo, or Lemon Squeezy. Buyers browse live rupee metrics instead of screenshots.",
      },
      {
        q: "How is this different from TrustMRR?",
        a: "Same core idea — payment-provider-backed MRR — rebuilt for India. INR-first, UPI-native providers, GSTIN and entity type, WhatsApp as the default deal channel, listing prices in rupees, IST timestamps, and a 60-second demo-verify path so vibe coders can ship a public page before they wire a live key.",
      },
      {
        q: "Is listing free?",
        a: "Yes. Adding a startup to the database is ₹0. Marketplace plans are Starter ₹2,499, Growth ₹14,999, and Scale ₹39,999 — PPP-priced, not a copy of $29/$199/$499.",
      },
    ],
  },
  {
    title: "Verification",
    qas: [
      {
        q: "What data do you pull?",
        a: "Aggregates only: all-time revenue, last 30 days, MRR, active subscriptions, customer counts. No customer PII, no charge ability. Restricted / read-only keys.",
      },
      {
        q: "Why demo-verify?",
        a: "Indian indie hackers stall at 'paste a live Stripe key'. Demo-verify publishes a page in a minute so you can share it in WhatsApp groups. Swap the demo hash for a real Razorpay restricted key when you're ready — the URL stays the same.",
      },
      {
        q: "Can I stay anonymous?",
        a: "Yes. Stealth mode hides brand, logo, and website. Metrics, city, and asking price stay public so buyers can still underwrite the deal.",
      },
    ],
  },
  {
    title: "Buying & selling in India",
    qas: [
      {
        q: "How do deals actually close?",
        a: "Most Indian micro-acquisitions close on WhatsApp after an in-app offer. For larger deals we recommend a CA-reviewed asset purchase, GST invoice if it's a going concern, and escrow via a bank / Razorpay third-party or a lawyer-held account. Lump-sum is the default on-platform path.",
      },
      {
        q: "What is the marketplace fee?",
        a: "2.5% of the closing price (cheaper than a 3% US broker cut). Escrow or CA fees sit with the parties.",
      },
      {
        q: "Do you generate Indian legal docs?",
        a: "This demo includes the deal flow UI. Production VibeMRR would generate NDA, LoI, and a simple APA with Indian governing law, stamp-paper guidance, and GST treatment notes. Always have a CA look at share vs asset sale.",
      },
      {
        q: "Why WhatsApp?",
        a: "Because that's where Indian founders already negotiate. Email-only deal rooms convert poorly here. Every listing can deep-link to wa.me with a prefilled offer.",
      },
    ],
  },
  {
    title: "Vibe coders",
    qas: [
      {
        q: "What does the vibe-coded badge mean?",
        a: "The founder shipped primarily with Cursor, Claude Code, Grok, Windsurf, Copilot, Replit, or Lovable. Buyers know the codebase is modern (usually Next.js + a PG) and that a solo operator can take over.",
      },
      {
        q: "I built this last weekend. Can I list?",
        a: "Yes. Tiny MRR is allowed. The leaderboard is honest — most Indian listings will sit under ₹1L all-time. That's the point.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-4xl">FAQ</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Everything founders ask before listing a Bengaluru SaaS or a weekend side project.
      </p>
      <div className="mt-10 space-y-10">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="text-lg font-semibold">{s.title}</h2>
            <div className="mt-4 space-y-5">
              {s.qas.map((qa) => (
                <div key={qa.q}>
                  <h3 className="text-sm font-medium text-zinc-100">{qa.q}</h3>
                  <p className="mt-1 text-sm leading-7 text-zinc-400">{qa.a}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="mt-12 flex gap-3">
        <Link href="/add" className="rounded-lg bg-saffron px-4 py-2 text-sm font-semibold text-zinc-950">
          Add startup
        </Link>
        <Link href="/acquire" className="rounded-lg border border-white/10 px-4 py-2 text-sm">
          Browse marketplace
        </Link>
      </div>
    </div>
  );
}

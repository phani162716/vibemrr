export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 text-sm leading-7 text-zinc-400">
      <h1 className="font-serif text-4xl text-zinc-50">Terms of use</h1>
      <p className="mt-2 text-xs text-zinc-600">Last updated 19 Aug 2026 · India</p>
      <div className="mt-8 space-y-5">
        <p>
          VibeMRR is a listing and discovery site for Indian SaaS and digital businesses. We are not
          a broker, escrow agent, or chartered accountant. A listing is an advertisement, not an
          offer to sell securities.
        </p>
        <h2 className="text-base font-semibold text-zinc-100">Accounts</h2>
        <p>
          You must be 18+ and able to contract under Indian law. You are responsible for your
          password and for activity on your account.
        </p>
        <h2 className="text-base font-semibold text-zinc-100">Listings and metrics</h2>
        <p>
          Revenue figures may be demo-generated or pulled from a payment provider you connect. They
          are not audited financials. Buyers must do their own diligence (code, GST, churn, costs,
          transfer of assets).
        </p>
        <h2 className="text-base font-semibold text-zinc-100">Deals</h2>
        <p>
          Offers sent on VibeMRR or WhatsApp are between buyer and seller. VibeMRR does not take
          custody of funds unless a future paid escrow is explicitly offered. GST, TDS, stamp duty,
          and whether the sale is an asset sale or share sale are your problem and your CA&apos;s.
        </p>
        <h2 className="text-base font-semibold text-zinc-100">Acceptable use</h2>
        <p>
          No fake businesses, no stolen codebases, no listings you do not control, no scraping that
          overloads the site. We may remove listings or accounts.
        </p>
        <h2 className="text-base font-semibold text-zinc-100">Liability</h2>
        <p>
          The service is provided as-is. We are not liable for failed deals, inaccurate numbers, or
          downtime. Not affiliated with TrustMRR or any payment company named on the site.
        </p>
      </div>
    </article>
  );
}

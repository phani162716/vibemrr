export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 text-sm leading-7 text-muted">
      <h1 className="font-serif text-4xl text-foreground">Privacy</h1>
      <p className="mt-2 text-xs text-muted">Last updated 19 Aug 2026 · India</p>
      <div className="mt-8 space-y-5">
        <p>
          We store the minimum needed to run a marketplace: name, email, optional WhatsApp, listing
          content, and offers. Auth and database sit on Supabase.
        </p>
        <h2 className="text-base font-semibold text-foreground">What we collect</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Account: email, name, password hash (Supabase Auth), optional WhatsApp</li>
          <li>Listings: the fields you type, plus demo-verify or payment-provider metrics</li>
          <li>Offers: name, email, WhatsApp, amount, message</li>
        </ul>
        <h2 className="text-base font-semibold text-foreground">Payment API keys</h2>
        <p>
          If you later connect Razorpay or Stripe, use a restricted read-only key. We will only pull
          aggregates (MRR, 30-day revenue, subscriber counts). Do not paste a secret key that can
          refund or charge customers.
        </p>
        <h2 className="text-base font-semibold text-foreground">Sharing</h2>
        <p>
          Listing pages are public. Offers are visible to the buyer and the listing owner. We do not
          sell your data. Hosting and email may use Supabase and the platform you deploy on (for
          example Vercel).
        </p>
        <h2 className="text-base font-semibold text-foreground">Your rights</h2>
        <p>
          You can edit or delete your listing from the dashboard. To delete your account and
          personal data, email the operator from the address on your account.
        </p>
      </div>
    </article>
  );
}

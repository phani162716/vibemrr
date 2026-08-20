export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-4xl">FAQ</h1>
      <div className="mt-8 space-y-6 text-sm leading-7 text-zinc-400">
        <div>
          <h2 className="font-medium text-zinc-100">What is Vibers?</h2>
          <p className="mt-1">
            A marketplace to discover, bid on, and buy software built by independent developers and
            vibe coders — websites, SaaS, AI agents, apps, templates.
          </p>
        </div>
        <div>
          <h2 className="font-medium text-zinc-100">How do payments work?</h2>
          <p className="mt-1">
            MVP checkout records the order, then you mark UPI/NEFT as paid. Razorpay/Stripe can plug
            in later. Source code is never public; handover is private after payment.
          </p>
        </div>
        <div>
          <h2 className="font-medium text-zinc-100">Is listing free?</h2>
          <p className="mt-1">Yes, this year.</p>
        </div>
      </div>
    </div>
  );
}

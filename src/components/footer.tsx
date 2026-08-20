import Link from "next/link";
import { Wordmark } from "./logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:justify-between">
        <div>
          <Wordmark />
          <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-500">
            Verified revenue for Indian SaaS and vibe-coded startups. Numbers come from Razorpay,
            Cashfree, PhonePe, Stripe — not screenshots.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-wider text-zinc-600">Product</p>
            <Link href="/acquire" className="text-zinc-400 hover:text-white">
              Marketplace
            </Link>
            <Link href="/stats" className="text-zinc-400 hover:text-white">
              Stats
            </Link>
            <Link href="/add" className="text-zinc-400 hover:text-white">
              Add startup
            </Link>
            <Link href="/faq" className="text-zinc-400 hover:text-white">
              FAQ
            </Link>
            <Link href="/invite" className="text-zinc-400 hover:text-white">
              Invite
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-wider text-zinc-600">Legal</p>
            <Link href="/terms" className="text-zinc-400 hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="text-zinc-400 hover:text-white">
              Privacy
            </Link>
            <span className="text-zinc-400">INR · WhatsApp deals</span>
            <span className="text-zinc-400">Not affiliated with TrustMRR</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/6 py-4 text-center text-xs text-zinc-600">
        Vibers · vibers.co · Built for vibe coders in India · Not affiliated with TrustMRR
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Wordmark } from "./logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:justify-between">
        <div>
          <Wordmark />
          <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-500">
            Discover, buy and sell software built by independent developers and vibe coders.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-wider text-zinc-600">Marketplace</p>
            <Link href="/market" className="text-zinc-400 hover:text-white">
              Explore
            </Link>
            <Link href="/add" className="text-zinc-400 hover:text-white">
              List a product
            </Link>
            <Link href="/search" className="text-zinc-400 hover:text-white">
              Search
            </Link>
            <Link href="/profile" className="text-zinc-400 hover:text-white">
              Profile
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
          </div>
        </div>
      </div>
      <div className="border-t border-white/6 py-4 text-center text-xs text-zinc-600">
        Vibers · Independent software marketplace · Not affiliated with Flippa, Gumroad, or Product Hunt
      </div>
    </footer>
  );
}

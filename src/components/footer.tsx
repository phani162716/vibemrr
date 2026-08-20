import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-indigo">Vibers</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
            Discover, buy and sell software built by independent developers and vibe coders.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-wider text-muted">Marketplace</p>
            <Link href="/market" className="text-foreground hover:text-indigo-2">
              Explore
            </Link>
            <Link href="/add" className="text-foreground hover:text-indigo-2">
              List a product
            </Link>
            <Link href="/search" className="text-foreground hover:text-indigo-2">
              Search
            </Link>
            <Link href="/profile" className="text-foreground hover:text-indigo-2">
              Profile
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-wider text-muted">Legal</p>
            <Link href="/terms" className="text-foreground hover:text-indigo-2">
              Terms
            </Link>
            <Link href="/privacy" className="text-foreground hover:text-indigo-2">
              Privacy
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        Vibers · Independent software marketplace
      </div>
    </footer>
  );
}

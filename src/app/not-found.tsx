import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-wider text-saffron">404</p>
      <h1 className="mt-2 font-serif text-4xl">This startup isn&apos;t on VibeMRR</h1>
      <p className="mt-3 text-sm text-zinc-400">Either it never listed, or it went stealth.</p>
      <Link href="/acquire" className="mt-6 inline-block rounded-lg bg-saffron px-4 py-2 text-sm font-semibold text-zinc-950">
        Browse marketplace
      </Link>
    </div>
  );
}

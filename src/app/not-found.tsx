import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-wider text-indigo-2">404</p>
      <h1 className="mt-2 font-serif text-4xl">This product isn&apos;t on Vibers</h1>
      <p className="mt-3 text-sm text-muted">It may have been removed or never listed.</p>
      <Link href="/market" className="btn-primary mt-6 inline-block">
        Browse marketplace
      </Link>
    </div>
  );
}

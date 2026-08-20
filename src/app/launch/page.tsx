import Link from "next/link";

export default function LaunchPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-wider text-saffron">Publish</p>
      <h1 className="font-serif mt-1 text-4xl">Go live on Vercel</h1>
      <p className="mt-3 text-sm leading-7 text-zinc-400">
        The product is ready to ship as v1: listings, auth, offers, WhatsApp, invite, terms. Real
        Razorpay verification and paid listing fees can wait until you have 10 founders.
      </p>
      <ol className="mt-8 space-y-5 text-sm leading-7 text-zinc-300">
        <li>
          <p className="font-semibold text-zinc-50">1. Push the repo to GitHub</p>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-black/40 p-3 text-xs">{`cd C:\\Users\\rayap\\OneDrive\\Desktop\\vibemrr
git init
git add .
git commit -m "Launch VibeMRR v1"
git branch -M main
git remote add origin https://github.com/YOUR_USER/vibemrr.git
git push -u origin main`}</pre>
          <p className="mt-2 text-zinc-500">Do not commit .env.local. It is already gitignored.</p>
        </li>
        <li>
          <p className="font-semibold text-zinc-50">2. Import the repo on Vercel</p>
          <p className="text-zinc-400">
            Open{" "}
            <a className="text-saffron" href="https://vercel.com/new" target="_blank" rel="noreferrer">
              vercel.com/new
            </a>
            , import <code className="text-zinc-200">vibemrr</code>, framework Next.js.
          </p>
        </li>
        <li>
          <p className="font-semibold text-zinc-50">3. Add environment variables on Vercel</p>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-black/40 p-3 text-xs">{`NEXT_PUBLIC_SUPABASE_URL=https://omokvloeumvgwjedslsx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=(same anon key as .env.local)
NEXT_PUBLIC_SITE_URL=https://vibers.co`}</pre>
        </li>
        <li>
          <p className="font-semibold text-zinc-50">4. Allow the live URL in Supabase</p>
          <p className="text-zinc-400">
            Authentication → URL Configuration. Site URL = your Vercel URL. Redirect URLs add:
          </p>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-black/40 p-3 text-xs">{`http://localhost:3000/auth/callback
https://YOUR-APP.vercel.app/auth/callback`}</pre>
        </li>
        <li>
          <p className="font-semibold text-zinc-50">5. Deploy → open the .vercel.app link</p>
          <p className="text-zinc-400">
            Sign in, confirm your listing is there, then share{" "}
            <Link href="/invite" className="text-saffron">
              /invite
            </Link>{" "}
            with five founders.
          </p>
        </li>
      </ol>
    </div>
  );
}

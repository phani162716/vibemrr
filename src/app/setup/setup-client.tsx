"use client";

import Link from "next/link";
import { AuthPanel } from "@/components/auth-panel";

export function SetupClient({ configured }: { configured: boolean }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-wider text-saffron">Free setup</p>
      <h1 className="font-serif mt-1 text-4xl">Connect Supabase — no Google Cloud</h1>
      <p className="mt-3 text-sm leading-7 text-zinc-400">
        Auth is email + password (free) or GitHub (also free). You do not need a Google Cloud billing
        account.
      </p>

      <div
        className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
          configured
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
            : "border-amber-400/30 bg-amber-400/10 text-amber-200"
        }`}
      >
        {configured
          ? "Keys detected. Create an account below to confirm it works."
          : "No keys yet. Follow the 4 steps, then restart npm run dev."}
      </div>

      <ol className="mt-8 space-y-6 text-sm leading-7 text-zinc-300">
        <li>
          <p className="font-semibold text-zinc-50">1. Create a free Supabase project</p>
          <p className="text-zinc-400">
            Open{" "}
            <a className="text-saffron" href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">
              supabase.com/dashboard
            </a>
            . Free tier is enough. Region: Mumbai if offered. No card required for the free plan.
          </p>
        </li>
        <li>
          <p className="font-semibold text-zinc-50">2. Run the schema</p>
          <p className="text-zinc-400">
            SQL Editor → paste <code className="text-zinc-200">supabase/schema.sql</code> → Run.
          </p>
        </li>
        <li>
          <p className="font-semibold text-zinc-50">3. Leave Email auth on (default)</p>
          <p className="text-zinc-400">
            Authentication → Providers → Email should already be enabled. Optional: turn off
            &quot;Confirm email&quot; while you test locally so you can sign in immediately.
          </p>
          <p className="mt-2 text-zinc-400">
            Authentication → URL Configuration → add:
          </p>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-black/40 p-3 text-xs text-zinc-300">
            http://localhost:3000/auth/callback
          </pre>
          <p className="mt-2 text-zinc-400">
            Optional GitHub (still free): GitHub → Settings → Developer settings → OAuth Apps →
            callback <code className="text-zinc-200">https://YOUR_REF.supabase.co/auth/v1/callback</code>
            , then paste the client ID/secret into Supabase → Providers → GitHub.
          </p>
        </li>
        <li>
          <p className="font-semibold text-zinc-50">4. Drop keys into .env.local and restart</p>
          <p className="text-zinc-400">
            Copy <code className="text-zinc-200">env.example</code> →{" "}
            <code className="text-zinc-200">.env.local</code>. Values: Project Settings → API.
          </p>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-black/40 p-3 text-xs text-zinc-300">{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...`}</pre>
        </li>
      </ol>

      {configured && (
        <div className="mt-8 space-y-3">
          <AuthPanel next="/dashboard" />
          <Link href="/add" className="block text-center text-sm text-saffron">
            Then list your real startup →
          </Link>
        </div>
      )}
    </div>
  );
}

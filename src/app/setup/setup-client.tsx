"use client";

import Link from "next/link";
import { AuthPanel } from "@/components/auth-panel";

export function SetupClient({ configured }: { configured: boolean }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-2">Free setup</p>
      <h1 className="font-serif mt-1 text-4xl">Connect Supabase — no Google Cloud</h1>
      <p className="mt-3 text-sm leading-7 text-muted">
        Auth is email + password (free) or GitHub (also free). You do not need a Google Cloud billing
        account.
      </p>

      <div
        className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
          configured
            ? "border-emerald-500/30 bg-success/10 text-success"
            : "border-amber-400/30 bg-amber-400/10 text-amber-200"
        }`}
      >
        {configured
          ? "Keys detected. Create an account below to confirm it works."
          : "No keys yet. Follow the 4 steps, then restart npm run dev."}
      </div>

      <ol className="mt-8 space-y-6 text-sm leading-7 text-muted">
        <li>
          <p className="font-semibold text-foreground">1. Create a free Supabase project</p>
          <p className="text-muted">
            Open{" "}
            <a className="text-indigo-2" href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">
              supabase.com/dashboard
            </a>
            . Free tier is enough. Region: Mumbai if offered. No card required for the free plan.
          </p>
        </li>
        <li>
          <p className="font-semibold text-foreground">2. Run the schema</p>
          <p className="text-muted">
            SQL Editor → paste <code className="text-foreground">supabase/schema.sql</code> → Run.
          </p>
        </li>
        <li>
          <p className="font-semibold text-foreground">3. Leave Email auth on (default)</p>
          <p className="text-muted">
            Authentication → Providers → Email should already be enabled. Optional: turn off
            &quot;Confirm email&quot; while you test locally so you can sign in immediately.
          </p>
          <p className="mt-2 text-muted">
            Authentication → URL Configuration → add:
          </p>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-black/40 p-3 text-xs text-muted">
            http://localhost:3000/auth/callback
          </pre>
          <p className="mt-2 text-muted">
            Optional GitHub (still free): GitHub → Settings → Developer settings → OAuth Apps →
            callback <code className="text-foreground">https://YOUR_REF.supabase.co/auth/v1/callback</code>
            , then paste the client ID/secret into Supabase → Providers → GitHub.
          </p>
        </li>
        <li>
          <p className="font-semibold text-foreground">4. Drop keys into .env.local and restart</p>
          <p className="text-muted">
            Copy <code className="text-foreground">env.example</code> →{" "}
            <code className="text-foreground">.env.local</code>. Values: Project Settings → API.
          </p>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-black/40 p-3 text-xs text-muted">{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...`}</pre>
        </li>
      </ol>

      {configured && (
        <div className="mt-8 space-y-3">
          <AuthPanel next="/dashboard" />
          <Link href="/add" className="block text-center text-sm text-indigo-2">
            Then list your real startup →
          </Link>
        </div>
      )}
    </div>
  );
}

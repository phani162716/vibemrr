"use client";

import { useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  signInWithGithub,
  signInWithMagicLink,
  signInWithPassword,
  signUpWithPassword,
} from "@/lib/auth";

export function AuthPanel({ next = "/dashboard" }: { next?: string }) {
  const [mode, setMode] = useState<"password" | "link">("password");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isNew, setIsNew] = useState(true);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSupabaseConfigured()) return null;

  async function onPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (isNew) await signUpWithPassword(email, password, name);
      else await signInWithPassword(email, password);
      window.location.assign(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setPending(false);
    }
  }

  async function onLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await signInWithMagicLink(email, next);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send link");
    } finally {
      setPending(false);
    }
  }

  async function onGithub() {
    setError(null);
    setPending(true);
    try {
      await signInWithGithub(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "GitHub sign-in failed");
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500">Free auth — no Google Cloud, no credit card.</p>

      {mode === "password" ? (
        <form onSubmit={onPassword} className="space-y-3">
          {isNew && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (6+ characters)"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-saffron py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-60"
          >
            {pending ? "Please wait…" : isNew ? "Create free account" : "Sign in"}
          </button>
          <button
            type="button"
            onClick={() => setIsNew((v) => !v)}
            className="w-full text-xs text-zinc-500 hover:text-zinc-300"
          >
            {isNew ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>
        </form>
      ) : sent ? (
        <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          Check {email} for a sign-in link.
        </p>
      ) : (
        <form onSubmit={onLink} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-saffron py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-60"
          >
            {pending ? "Sending…" : "Email me a magic link"}
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === "password" ? "link" : "password"));
          setError(null);
          setSent(false);
        }}
        className="w-full text-xs text-zinc-500 hover:text-zinc-300"
      >
        {mode === "password" ? "Use a magic link instead" : "Use email + password instead"}
      </button>

      <div className="relative py-1 text-center text-[11px] uppercase tracking-wider text-zinc-600">
        <span className="bg-background px-2">or</span>
      </div>

      <button
        type="button"
        onClick={onGithub}
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 disabled:opacity-60"
      >
        <GithubMark />
        Continue with GitHub
      </button>
      <p className="text-center text-[11px] text-zinc-600">GitHub OAuth is free. Optional.</p>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function GithubMark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.7.5.6 5.6.6 11.9c0 5 3.3 9.3 7.8 10.8.6.1.8-.2.8-.6v-2.2c-3.2.7-3.8-1.4-3.8-1.4-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1.7 1.6 2.7 1.2.1-.8.4-1.3.7-1.6-2.5-.3-5.2-1.3-5.2-5.6 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 3 .1a10.4 10.4 0 0 1 5.5 0c2.1-.4 3-.1 3-.1.6 1.5.2 2.6.1 2.9.7.8 1.1 1.8 1.1 3 0 4.3-2.7 5.3-5.2 5.6.4.3.8 1 .8 2.1v3.1c0 .4.2.7.8.6 4.5-1.5 7.8-5.8 7.8-10.8C23.4 5.6 18.3.5 12 .5z" />
    </svg>
  );
}

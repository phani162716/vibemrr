"use client";

import { useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  resetPassword,
  signInWithGithub,
  signInWithMagicLink,
  signInWithPassword,
  signUpWithPassword,
} from "@/lib/auth";

export function AuthPanel({ next = "/dashboard" }: { next?: string }) {
  const [mode, setMode] = useState<"password" | "link" | "forgot">("password");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSupabaseConfigured()) return null;

  async function onPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (isNew) {
        const digits = await signUpWithPassword(email, password, name, whatsapp);
        try {
          localStorage.setItem(
            "vibemrr.session",
            JSON.stringify({
              email,
              name: name || email.split("@")[0],
              whatsapp: digits,
            })
          );
        } catch {
          /* ignore */
        }
      } else await signInWithPassword(email, password);
      window.location.assign(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setPending(false);
    }
  }

  async function onForgot(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email");
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

  const field =
    "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm";

  return (
    <div className="space-y-4">
      {mode === "forgot" ? (
        sent ? (
          <p className="rounded-xl border border-success/30 bg-success/10 p-3 text-sm text-success">
            If <span className="text-foreground">{email}</span> is on Vibers, a reset link is on its way
            (and in spam). Open it, set a new password, then sign in.
          </p>
        ) : (
          <form onSubmit={onForgot} className="space-y-3">
            <h2 className="text-sm font-medium">Forgot password</h2>
            <p className="text-xs text-muted">
              We’ll email a link to set a new password. This also recovers accounts that never
              confirmed signup.
            </p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className={field}
            />
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-indigo py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Sending…" : "Send reset link"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("password");
                setSent(false);
                setError(null);
              }}
              className="w-full text-xs text-muted"
            >
              Back to sign in
            </button>
          </form>
        )
      ) : mode === "password" ? (
        <form onSubmit={onPassword} className="space-y-3">
          {isNew && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={field}
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className={field}
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (6+ characters)"
            className={field}
          />
          {isNew && (
            <>
              <input
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp with country code (91XXXXXXXXXX)"
                className={field}
              />
              <p className="text-[11px] text-muted">
                Required. Never shown publicly. Buyers only open WhatsApp after you accept an offer or
                they buy at asking price.
              </p>
            </>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-indigo py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Please wait…" : isNew ? "Create free account" : "Sign in"}
          </button>
          {!isNew && (
            <button
              type="button"
              onClick={() => {
                setMode("forgot");
                setSent(false);
                setError(null);
              }}
              className="w-full text-xs text-indigo-2"
            >
              Forgot password?
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsNew((v) => !v)}
            className="w-full text-xs text-muted hover:text-muted"
          >
            {isNew ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>
        </form>
      ) : sent ? (
        <p className="rounded-xl border border-success/30 bg-success/10 p-3 text-sm text-success">
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
            className={field}
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-indigo py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Sending…" : "Email me a magic link"}
          </button>
        </form>
      )}

      {mode !== "forgot" && (
        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === "password" ? "link" : "password"));
            setError(null);
            setSent(false);
          }}
          className="w-full text-xs text-muted hover:text-muted"
        >
          {mode === "password" ? "Use a magic link instead" : "Use email + password instead"}
        </button>
      )}

      {mode !== "forgot" && (
        <>
          <div className="relative py-1 text-center text-[11px] uppercase tracking-wider text-muted">
            <span className="bg-background px-2">or</span>
          </div>
          <button
            type="button"
            onClick={onGithub}
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 disabled:opacity-60"
          >
            <GithubMark />
            Continue with GitHub
          </button>
        </>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
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

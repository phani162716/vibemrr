"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/app-provider";

const SLOTS = 5;

const WHATSAPP = `Bhai, listed my startup on VibeMRR — verified rupee MRR, no fake screenshots.

Add yours in 60 seconds (email login, free):
https://localhost:3000/add

If you ever want to sell, buyers see real numbers + WhatsApp.`;

const TWITTER = `Listed on VibeMRR — verified Indian SaaS revenue in ₹, not screenshots.

If you vibe-coded something that makes money, add it in 60s:
http://localhost:3000/add`;

export default function InvitePage() {
  const { session, startups } = useApp();
  const mine = useMemo(
    () =>
      session
        ? startups.filter(
            (s) =>
              !s.isDemo &&
              ((session.id && s.ownerId === session.id) ||
                (session.email && s.ownerEmail === session.email))
          )
        : [],
    [session, startups]
  );
  const [done, setDone] = useState<boolean[]>(() => Array(SLOTS).fill(false));
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("vibemrr.invites");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as boolean[];
      if (Array.isArray(parsed) && parsed.length === SLOTS) setDone(parsed);
    } catch {
      /* ignore */
    }
  }, []);

  function toggle(i: number) {
    setDone((cur) => {
      const next = cur.map((v, idx) => (idx === i ? !v : v));
      localStorage.setItem("vibemrr.invites", JSON.stringify(next));
      return next;
    });
  }

  async function copy(label: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1600);
  }

  const listingUrl =
    typeof window !== "undefined" && mine[0]
      ? `${window.location.origin}/startup/${mine[0].slug}`
      : "http://localhost:3000";
  const addUrl = typeof window !== "undefined" ? `${window.location.origin}/add` : "http://localhost:3000/add";
  const wa = WHATSAPP.replace("https://localhost:3000/add", addUrl);
  const tw = TWITTER.replace("http://localhost:3000/add", addUrl);
  const checked = done.filter(Boolean).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-wider text-saffron">This week</p>
      <h1 className="font-serif mt-1 text-4xl">Invite 5 founders</h1>
      <p className="mt-3 text-sm leading-7 text-zinc-400">
        Demo listings are gone. The marketplace only grows if people you already know list. Do not
        post in random groups yet — message five people who have shipped something.
      </p>

      <div className="mt-6 rounded-2xl border border-white/8 bg-card p-5">
        <p className="text-sm font-medium">
          {checked}/{SLOTS} invited
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
          <div className="h-full bg-saffron" style={{ width: `${(checked / SLOTS) * 100}%` }} />
        </div>
        <ul className="mt-4 space-y-2">
          {done.map((on, i) => (
            <li key={i}>
              <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300">
                <input type="checkbox" checked={on} onChange={() => toggle(i)} />
                Founder {i + 1}
                {on ? <span className="text-xs text-emerald-400">done</span> : null}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {mine[0] && (
        <div className="mt-6 rounded-2xl border border-white/8 bg-card p-5 text-sm">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Your live listing</p>
          <Link href={`/startup/${mine[0].slug}`} className="mt-1 block font-medium text-saffron">
            {mine[0].name} →
          </Link>
          <button
            type="button"
            onClick={() => copy("listing", listingUrl)}
            className="mt-3 rounded-lg border border-white/10 px-3 py-1.5 text-xs"
          >
            {copied === "listing" ? "Copied" : "Copy listing link"}
          </button>
        </div>
      )}

      {!session && (
        <p className="mt-6 text-sm text-zinc-500">
          <Link href="/dashboard" className="text-saffron">
            Sign in
          </Link>{" "}
          first if you want your own listing link in the message.
        </p>
      )}

      <div className="mt-8 space-y-4">
        <CopyBlock
          title="WhatsApp / Telegram"
          text={wa}
          copied={copied === "wa"}
          onCopy={() => copy("wa", wa)}
        />
        <CopyBlock
          title="Twitter / Peerlist"
          text={tw}
          copied={copied === "tw"}
          onCopy={() => copy("tw", tw)}
        />
      </div>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(wa)}`}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-zinc-950"
      >
        Open WhatsApp with this text
      </a>
    </div>
  );
}

function CopyBlock({
  title,
  text,
  copied,
  onCopy,
}: {
  title: string;
  text: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{title}</p>
        <button type="button" onClick={onCopy} className="text-xs text-saffron">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="mt-2 whitespace-pre-wrap text-xs leading-5 text-zinc-400">{text}</pre>
    </div>
  );
}

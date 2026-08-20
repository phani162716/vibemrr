"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/app-provider";

export default function SettingsPage() {
  const { session, setRole, updateProfile, signOut } = useApp();
  const router = useRouter();
  const [name, setName] = useState(session?.name ?? "");
  const [handle, setHandle] = useState(session?.handle ?? "");
  const [whatsapp, setWhatsapp] = useState(session?.whatsapp ?? "");
  const [bio, setBio] = useState(session?.bio ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session) {
    return (
      <div className="px-4 py-16 text-center">
        <Link href="/dashboard" className="text-indigo-2">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-serif text-4xl">Settings</h1>
      <p className="mt-2 text-sm text-muted">{session.email}</p>
      <form
        className="mt-8 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          const digits = whatsapp.replace(/\D/g, "");
          if (digits.length < 10) {
            setError("Enter WhatsApp with country code, e.g. 91XXXXXXXXXX");
            return;
          }
          void updateProfile({ name, handle, whatsapp: digits, bio })
            .then(() => setSaved(true))
            .catch((err) => setError(err instanceof Error ? err.message : "Could not save"));
        }}
      >
        <label className="block text-xs text-muted">
          Display name
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm" />
        </label>
        <label className="block text-xs text-muted">
          Handle
          <input value={handle} onChange={(e) => setHandle(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm" />
        </label>
        <label className="block text-xs text-muted">
          WhatsApp (required, with country code)
          <input
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="91XXXXXXXXXX"
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
        <p className="text-[11px] text-muted">Never public. Used only after you accept a bid or someone buys at asking price.</p>
        <label className="block text-xs text-muted">
          Bio
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm" />
        </label>
        <label className="block text-xs text-muted">
          Primary role
          <select
            value={session.role ?? "buyer"}
            onChange={(e) => void setRole(e.target.value as "buyer" | "seller")}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
        </label>
        <button className="w-full rounded-xl bg-indigo py-2.5 text-sm font-semibold text-white">Save profile</button>
        {error && <p className="text-sm text-danger">{error}</p>}
        {saved && <p className="text-xs text-success">Saved to your account. It will still be there after logout.</p>}
      </form>
      <button
        type="button"
        onClick={async () => {
          await signOut();
          router.push("/");
        }}
        className="mt-8 w-full rounded-xl border border-danger/40 py-2.5 text-sm font-medium text-danger"
      >
        Sign out
      </button>
    </div>
  );
}

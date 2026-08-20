"use client";

import { useState } from "react";
import { useApp } from "@/components/app-provider";

export default function SettingsPage() {
  const { session, setRole, signOut } = useApp();
  const [role, setR] = useState(session?.role ?? "buyer");
  if (!session) return <p className="px-4 py-16 text-center">Sign in from the dashboard.</p>;
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-serif text-4xl">Settings</h1>
      <p className="mt-4 text-sm text-zinc-400">{session.email}</p>
      <label className="mt-6 block text-xs text-zinc-400">
        Primary role
        <select
          value={role}
          onChange={(e) => {
            const v = e.target.value as "buyer" | "seller";
            setR(v);
            void setRole(v);
          }}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
        >
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>
      </label>
      <button onClick={() => void signOut()} className="mt-6 text-sm text-zinc-500">
        Sign out
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/lib/auth";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Use at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await updatePassword(password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password. Open the email link again.");
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-4xl">Set a new password</h1>
      <p className="mt-2 text-sm text-zinc-400">You opened the reset link from your email. Choose a password you will remember.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-3">
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm password"
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          disabled={pending}
          className="w-full rounded-xl bg-saffron py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save password and continue"}
        </button>
      </form>
    </div>
  );
}

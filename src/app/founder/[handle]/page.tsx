"use client";

import { use } from "react";
import Link from "next/link";
import { useApp } from "@/components/app-provider";
import { StartupCard } from "@/components/startup-card";
import { money } from "@/lib/format";

export default function FounderPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = use(params);
  const { startups, currency } = useApp();
  const rows = startups.filter((s) => s.founder.handle.toLowerCase() === handle.toLowerCase());
  const founder = rows[0]?.founder;

  if (!founder) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Founder not found</h1>
        <Link href="/" className="mt-4 inline-block text-saffron">
          Home
        </Link>
      </div>
    );
  }

  const mrr = rows.reduce((a, s) => a + s.mrrInr, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-xs uppercase tracking-wider text-zinc-500">Founder</p>
      <h1 className="mt-1 text-4xl font-semibold">{founder.name}</h1>
      <p className="mt-2 text-sm text-zinc-400">
        @{founder.handle} · {founder.followers.toLocaleString("en-IN")} on X · {rows.length}{" "}
        verified {rows.length === 1 ? "startup" : "startups"} · {money(mrr, currency)} combined MRR
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {rows.map((s) => (
          <StartupCard key={s.slug} startup={s} />
        ))}
      </div>
    </div>
  );
}

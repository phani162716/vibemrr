"use client";

import { use } from "react";
import { useApp } from "@/components/app-provider";
import { StartupCard } from "@/components/startup-card";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const name = decodeURIComponent(slug);
  const { startups } = useApp();
  const rows = startups.filter((s) => s.category.toLowerCase() === name.toLowerCase());

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs uppercase tracking-wider text-zinc-500">Category</p>
      <h1 className="mt-1 font-serif text-4xl">{name}</h1>
      <p className="mt-2 text-sm text-zinc-500">{rows.length} verified startups</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((s) => (
          <StartupCard key={s.slug} startup={s} />
        ))}
      </div>
    </div>
  );
}

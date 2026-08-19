import type { Startup } from "./types";
import { STARTUPS } from "./startups";

export function demoStartups(): Startup[] {
  return STARTUPS.map((s) => ({ ...s, isDemo: true }));
}

export function showDemos(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_DEMOS === "true";
}

export function mergeCatalog(remote: Startup[]): Startup[] {
  const real = remote.filter((s) => !s.isDemo);
  if (!showDemos()) return real;
  const demos = demoStartups();
  const slugs = new Set(real.map((s) => s.slug));
  return [...real, ...demos.filter((s) => !slugs.has(s.slug))];
}

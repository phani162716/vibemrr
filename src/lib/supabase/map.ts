import type { Offer, Startup, StartupDetails } from "@/lib/types";

export type StartupRow = {
  id?: string;
  slug: string;
  owner_id: string | null;
  owner_email: string | null;
  name: string;
  anonymous: boolean | null;
  tagline: string | null;
  description: string | null;
  category: string | null;
  website: string | null;
  logo_letter: string | null;
  logo_color: string | null;
  for_sale: boolean | null;
  asking_inr: number | string | null;
  revenue_30d_inr: number | string | null;
  mrr_inr: number | string | null;
  all_time_inr: number | string | null;
  mom_growth: number | string | null;
  active_subs: number | null;
  customers: number | null;
  users_count: number | null;
  profit_margin: number | string | null;
  provider: string | null;
  last_synced: string | null;
  founded: string | null;
  city: string | null;
  company_type: string | null;
  gstin: string | null;
  founder_name: string | null;
  founder_handle: string | null;
  founder_followers: number | null;
  founder_whatsapp: string | null;
  vibe_coded: boolean | null;
  vibe_tools: string[] | null;
  funding: string | null;
  team_size: number | null;
  audience: string | null;
  pricing: string | null;
  value_prop: string | null;
  problem: string | null;
  additional_info: string | null;
  seller_message: string | null;
  tech: { frontend?: string[]; backend?: string[]; verified?: boolean; details?: StartupDetails } | null;
  channels: string[] | null;
  listing_tier: string | null;
  looking_for_cofounder: boolean | null;
  github_contrib: number | null;
  domain_rating: number | null;
  is_demo: boolean | null;
};

function num(v: number | string | null | undefined): number {
  if (v === null || v === undefined || v === "") return 0;
  return Number(v);
}

export function rowToStartup(row: StartupRow): Startup {
  return {
    slug: row.slug,
    name: row.name,
    anonymous: Boolean(row.anonymous),
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    category: row.category ?? "SaaS",
    website: row.website ?? undefined,
    logoLetter: row.logo_letter ?? (row.name?.[0] ?? "V"),
    logoColor: row.logo_color ?? "#FF6B1A",
    forSale: Boolean(row.for_sale),
    askingInr: row.asking_inr != null ? num(row.asking_inr) : undefined,
    revenue30dInr: num(row.revenue_30d_inr),
    mrrInr: num(row.mrr_inr),
    allTimeInr: num(row.all_time_inr),
    momGrowth: row.mom_growth != null ? num(row.mom_growth) : undefined,
    activeSubs: row.active_subs ?? 0,
    customers: row.customers ?? undefined,
    users: row.users_count ?? undefined,
    profitMargin: row.profit_margin != null ? num(row.profit_margin) : undefined,
    provider: (row.provider as Startup["provider"]) ?? "razorpay",
    lastSynced: row.last_synced ?? new Date().toISOString(),
    founded: row.founded ?? new Date().toISOString(),
    city: row.city ?? "Remote · India",
    companyType: (row.company_type as Startup["companyType"]) ?? "unregistered",
    gstin: row.gstin ?? undefined,
    founder: {
      name: row.founder_name ?? "Founder",
      handle: row.founder_handle ?? row.slug,
      followers: row.founder_followers ?? 0,
      whatsapp: row.founder_whatsapp ?? undefined,
    },
    vibeCoded: Boolean(row.vibe_coded),
    vibeTools: (row.vibe_tools ?? []) as Startup["vibeTools"],
    funding: (row.funding as Startup["funding"]) ?? "Bootstrapped",
    teamSize: row.team_size ?? 1,
    audience: (row.audience as Startup["audience"]) ?? "B2B",
    pricing: row.pricing ?? "",
    valueProp: row.value_prop ?? "",
    problem: row.problem ?? "",
    additionalInfo: row.additional_info ?? undefined,
    sellerMessage: row.seller_message ?? undefined,
    tech: {
      frontend: row.tech?.frontend ?? [],
      backend: row.tech?.backend ?? [],
      verified: Boolean(row.tech?.verified),
      details: row.tech?.details,
    },
    details: row.tech?.details,
    verified: Boolean(row.tech?.verified),
    channels: row.channels ?? [],
    listingTier: (row.listing_tier as Startup["listingTier"]) ?? "free",
    lookingForCofounder: Boolean(row.looking_for_cofounder),
    githubContrib: row.github_contrib ?? undefined,
    domainRating: row.domain_rating ?? undefined,
    ownerEmail: row.owner_email ?? undefined,
    ownerId: row.owner_id ?? undefined,
    isDemo: Boolean(row.is_demo),
  };
}

export function startupToRow(s: Startup, ownerId: string, ownerEmail: string) {
  return {
    slug: s.slug,
    owner_id: ownerId,
    owner_email: ownerEmail,
    name: s.name,
    anonymous: Boolean(s.anonymous),
    tagline: s.tagline,
    description: s.description,
    category: s.category,
    website: s.website ?? null,
    logo_letter: s.logoLetter,
    logo_color: s.logoColor,
    for_sale: s.forSale,
    asking_inr: s.askingInr ?? null,
    revenue_30d_inr: s.revenue30dInr,
    mrr_inr: s.mrrInr,
    all_time_inr: s.allTimeInr,
    mom_growth: s.momGrowth ?? null,
    active_subs: s.activeSubs,
    customers: s.customers ?? null,
    users_count: s.users ?? null,
    profit_margin: s.profitMargin ?? null,
    provider: s.provider,
    last_synced: s.lastSynced,
    founded: s.founded.slice(0, 10),
    city: s.city,
    company_type: s.companyType,
    gstin: s.gstin ?? null,
    founder_name: s.founder.name,
    founder_handle: s.founder.handle,
    founder_followers: s.founder.followers,
    founder_whatsapp: s.founder.whatsapp ?? null,
    vibe_coded: s.vibeCoded,
    vibe_tools: s.vibeTools,
    funding: s.funding,
    team_size: s.teamSize,
    audience: s.audience,
    pricing: s.pricing,
    value_prop: s.valueProp,
    problem: s.problem,
    additional_info: s.additionalInfo ?? null,
    seller_message: s.sellerMessage ?? null,
    tech: { ...s.tech, verified: Boolean(s.verified), details: s.details },
    channels: s.channels,
    listing_tier: s.listingTier,
    looking_for_cofounder: Boolean(s.lookingForCofounder),
    github_contrib: s.githubContrib ?? null,
    domain_rating: s.domainRating ?? null,
    is_demo: false,
    updated_at: new Date().toISOString(),
  };
}

export type OfferRow = {
  id: string;
  startup_slug: string;
  buyer_name: string;
  buyer_email: string;
  buyer_whatsapp: string | null;
  amount_inr: number | string;
  message: string;
  created_at: string;
};

export function rowToOffer(row: OfferRow): Offer {
  return {
    id: row.id,
    startupSlug: row.startup_slug,
    buyerName: row.buyer_name,
    buyerEmail: row.buyer_email,
    buyerWhatsapp: row.buyer_whatsapp ?? undefined,
    amountInr: Number(row.amount_inr),
    message: row.message,
    createdAt: row.created_at,
  };
}

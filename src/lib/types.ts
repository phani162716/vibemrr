export type ProviderId =
  | "razorpay"
  | "cashfree"
  | "phonepe"
  | "payu"
  | "stripe"
  | "dodo"
  | "lemonsqueezy";

export type CompanyType =
  | "unregistered"
  | "proprietorship"
  | "opc"
  | "llp"
  | "pvt-ltd";

export type VibeTool =
  | "cursor"
  | "claude"
  | "grok"
  | "windsurf"
  | "copilot"
  | "replit"
  | "lovable";

export type ListingTier = "free" | "starter" | "growth" | "scale";

export type Audience = "B2B" | "B2C" | "B2B2C";

export interface Founder {
  name: string;
  handle: string;
  followers: number;
  whatsapp?: string;
  bio?: string;
}

export interface Startup {
  slug: string;
  name: string;
  anonymous?: boolean;
  tagline: string;
  description: string;
  category: string;
  website?: string;
  logoLetter: string;
  logoColor: string;
  forSale: boolean;
  askingInr?: number;
  revenue30dInr: number;
  mrrInr: number;
  allTimeInr: number;
  momGrowth?: number;
  activeSubs: number;
  customers?: number;
  users?: number;
  profitMargin?: number;
  provider: ProviderId;
  lastSynced: string;
  founded: string;
  city: string;
  companyType: CompanyType;
  gstin?: string;
  founder: Founder;
  vibeCoded: boolean;
  vibeTools: VibeTool[];
  funding: "Bootstrapped" | "Angel" | "Seed";
  teamSize: number;
  audience: Audience;
  pricing: string;
  valueProp: string;
  problem: string;
  additionalInfo?: string;
  sellerMessage?: string;
  tech: { frontend: string[]; backend: string[] };
  channels: string[];
  listingTier: ListingTier;
  lookingForCofounder?: boolean;
  githubContrib?: number;
  domainRating?: number;
  ownerEmail?: string;
  ownerId?: string;
  isDemo?: boolean;
}

export interface Offer {
  id: string;
  startupSlug: string;
  buyerName: string;
  buyerEmail: string;
  buyerWhatsapp?: string;
  amountInr: number;
  message: string;
  createdAt: string;
}

export interface Session {
  id?: string;
  email: string;
  name: string;
  whatsapp?: string;
  avatarUrl?: string;
}

export type Currency = "INR" | "USD";

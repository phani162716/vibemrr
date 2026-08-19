import type { ProviderId, CompanyType, VibeTool, ListingTier } from "./types";

export const PROVIDERS: {
  id: ProviderId;
  name: string;
  blurb: string;
  indiaFirst: boolean;
}[] = [
  { id: "razorpay", name: "Razorpay", blurb: "UPI, cards, subscriptions — default for Indian SaaS", indiaFirst: true },
  { id: "cashfree", name: "Cashfree", blurb: "Payouts + subscriptions, strong for marketplaces", indiaFirst: true },
  { id: "phonepe", name: "PhonePe PG", blurb: "UPI-native payment gateway", indiaFirst: true },
  { id: "payu", name: "PayU", blurb: "Legacy Indian PG still common in SMEs", indiaFirst: true },
  { id: "stripe", name: "Stripe India", blurb: "If you already invoice in USD or INR via Stripe", indiaFirst: false },
  { id: "dodo", name: "Dodo Payments", blurb: "Merchant of record popular with indie hackers", indiaFirst: false },
  { id: "lemonsqueezy", name: "Lemon Squeezy", blurb: "MoR for global indie products", indiaFirst: false },
];

export const CITIES = [
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Mumbai",
  "Gurugram",
  "Delhi",
  "Noida",
  "Chennai",
  "Jaipur",
  "Kochi",
  "Ahmedabad",
  "Indore",
  "Chandigarh",
  "Kota",
  "Goa",
  "Nagpur",
  "Remote · India",
];

export const CATEGORIES = [
  "SaaS",
  "Fintech",
  "Artificial Intelligence",
  "Education",
  "Health",
  "E-commerce",
  "Developer Tools",
  "Marketing",
  "Productivity",
  "Mobile Apps",
  "Logistics",
  "Legal",
  "Agri",
];

export const COMPANY_TYPES: { id: CompanyType; label: string }[] = [
  { id: "unregistered", label: "Unregistered / side project" },
  { id: "proprietorship", label: "Sole proprietorship" },
  { id: "opc", label: "One Person Company" },
  { id: "llp", label: "LLP" },
  { id: "pvt-ltd", label: "Private Limited" },
];

export const VIBE_TOOLS: { id: VibeTool; label: string }[] = [
  { id: "cursor", label: "Cursor" },
  { id: "claude", label: "Claude Code" },
  { id: "grok", label: "Grok" },
  { id: "windsurf", label: "Windsurf" },
  { id: "copilot", label: "Copilot" },
  { id: "replit", label: "Replit" },
  { id: "lovable", label: "Lovable" },
];

export const LISTING_PLANS: {
  id: ListingTier;
  name: string;
  priceInr: number;
  perks: string[];
}[] = [
  {
    id: "free",
    name: "Database",
    priceInr: 0,
    perks: ["Verified revenue page", "Leaderboard eligible", "INR + USD public metrics"],
  },
  {
    id: "starter",
    name: "Starter",
    priceInr: 2499,
    perks: ["Listed for sale", "WhatsApp buyer inbox", "Offer notifications"],
  },
  {
    id: "growth",
    name: "Growth",
    priceInr: 14999,
    perks: ["5× marketplace rank", "Newsletter feature", "Custom card colour"],
  },
  {
    id: "scale",
    name: "Scale",
    priceInr: 39999,
    perks: ["20× rank + 30-day pin", "Buyer matching", "CA-ready data room checklist"],
  },
];

export const SPONSORS = [
  { name: "Razorpay", href: "https://razorpay.com" },
  { name: "Cashfree", href: "https://www.cashfree.com" },
  { name: "Peerlist", href: "https://peerlist.io" },
  { name: "MSG91", href: "https://msg91.com" },
  { name: "Interakt", href: "https://www.interakt.shop" },
  { name: "Dodo Payments", href: "https://dodopayments.com" },
  { name: "Creem", href: "https://www.creem.io" },
  { name: "Posthog", href: "https://posthog.com" },
];

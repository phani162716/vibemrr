export type Currency = "INR" | "USD";

export type Role = "buyer" | "seller";

export type ProductType =
  | "Website"
  | "Web App / SaaS"
  | "AI Agent"
  | "AI Tool"
  | "Mobile App"
  | "Desktop App"
  | "Browser Extension"
  | "API / Developer Tool"
  | "Automation"
  | "Bot"
  | "Template"
  | "Other";

export type ProductStatus = "available" | "negotiation" | "sold" | "paused";

export type BidStatus = "pending" | "counter" | "accepted" | "rejected" | "purchased";

export interface Session {
  id?: string;
  email: string;
  name: string;
  whatsapp?: string;
  avatarUrl?: string;
  role?: Role;
  handle?: string;
  bio?: string;
}

export interface Product {
  id: string;
  slug: string;
  ownerId?: string;
  ownerName: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  productType: ProductType;
  niche: string;
  tags: string[];
  askingInr: number;
  thumbnailUrl?: string;
  images: string[];
  demoUrl?: string;
  websiteUrl?: string;
  status: ProductStatus;
  isDemo?: boolean;
  createdAt: string;
  views: number;
  interested: number;
  bidCount: number;
  rating?: number;
  reviewCount: number;
}

export interface Bid {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  askingInr: number;
  buyerId?: string;
  buyerName: string;
  buyerEmail: string;
  sellerId?: string;
  amountInr: number;
  status: BidStatus;
  createdAt: string;
  messages: BidMessage[];
}

export interface BidMessage {
  id: string;
  role: "buyer" | "seller";
  actorName: string;
  amountInr?: number;
  message: string;
  kind: "bid" | "counter" | "accept" | "reject";
  createdAt: string;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productSlug?: string;
  buyerId?: string;
  sellerId?: string;
  bidId?: string;
  amountInr: number;
  paymentStatus: "pending" | "paid" | "failed";
  handover: Record<string, string>;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  orderId?: string;
  buyerId?: string;
  buyerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notice {
  id: string;
  userId: string;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt: string;
}

export const PRODUCT_TYPES: ProductType[] = [
  "Website",
  "Web App / SaaS",
  "AI Agent",
  "AI Tool",
  "Mobile App",
  "Desktop App",
  "Browser Extension",
  "API / Developer Tool",
  "Automation",
  "Bot",
  "Template",
  "Other",
];

export const NICHES = [
  "E-commerce",
  "Finance",
  "Education",
  "Healthcare",
  "Productivity",
  "Marketing",
  "Sales",
  "HR",
  "Real Estate",
  "Creator Tools",
  "Developer Tools",
  "Social Media",
  "AI",
  "Local Business",
  "Travel",
  "Gaming",
  "Other",
];

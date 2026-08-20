import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { AppProvider } from "@/components/app-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SetupBanner } from "@/components/setup-banner";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Vibers — Discover, buy and sell vibe-coded software",
    template: "%s · Vibers",
  },
  description:
    "Marketplace for websites, SaaS, AI agents, apps and templates built by independent developers and vibe coders.",
  openGraph: {
    title: "Vibers",
    description: "Discover, buy and sell software built by independent developers and vibe coders.",
    type: "website",
    locale: "en_IN",
    url: "https://vibers.co",
  },
  twitter: { card: "summary_large_image", title: "Vibers" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${geistSans.variable} ${geistMono.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppProvider>
          <SetupBanner />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Inter, Cinzel } from "next/font/google";
import { ConsentRoot } from "@/components/Consent";
import ExitOffer from "@/components/ExitOffer";
import FunnelTracker from "@/components/FunnelTracker";
import JsonLd from "@/components/JsonLd";
import BrandMotion from "@/components/BrandMotion";
import { trackAiBot } from "@/lib/events";
import { freeCallEnabled } from "@/lib/free-call";
import { isLocale, organizationGraph } from "@/lib/seo";
import { appBaseUrl } from "@/lib/stripe";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel", weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl()),
  title: {
    default: "Callastral — Consultation astrologique par téléphone",
    template: "%s",
  },
  description: "Astrologue IA par téléphone, à partir de votre thème natal. Appel de 3 minutes offert, puis formules hebdomadaires.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Callastral",
  },
  openGraph: {
    title: "Callastral — Consultation astrologique 24 h/24",
    description: "Consultation astrologique par téléphone à partir de votre thème natal, 24 h/24.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1230",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-locale");
  const lang = localeHeader && isLocale(localeHeader) ? localeHeader : "fr";
  const aiBot = requestHeaders.get("x-ai-bot");
  if (aiBot) {
    const path = requestHeaders.get("x-pathname") || "/";
    void trackAiBot(aiBot, path);
  }
  const origin = appBaseUrl();
  return (
    <html lang={lang} className={`${inter.variable} ${cinzel.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Callastral" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/icon-48.png" type="image/png" sizes="48x48" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
      </head>
      <body className={inter.className}>
        <ConsentRoot>
        <div className="relative min-h-screen">
          {/* Starfield background (parallax piloté par BrandMotion via --sky-y) */}
          <div className="brand-sky" aria-hidden="true">
            <div className="brand-sky-layer brand-sky-far" />
            <div className="brand-sky-layer brand-sky-near" />
            <div className="brand-sky-glow" />
          </div>
          
          {/* Main content */}
          <div className="relative z-10">
            {children}
          </div>
          <JsonLd data={{ '@context': 'https://schema.org', '@graph': organizationGraph(origin) }} />
        </div>
        <ExitOffer trialEnabled={freeCallEnabled()} />
        <FunnelTracker />
        <BrandMotion />
        </ConsentRoot>
      </body>
    </html>
  );
}

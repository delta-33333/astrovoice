import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Inter, Cinzel } from "next/font/google";
import { ConsentRoot } from "@/components/Consent";
import ExitOffer from "@/components/ExitOffer";
import FunnelTracker from "@/components/FunnelTracker";
import JsonLd from "@/components/JsonLd";
import { trackAiBot } from "@/lib/events";
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
  themeColor: "#6b46c1",
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
          {/* Starfield background */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-radial from-celestial-purple/10 via-transparent to-transparent"></div>
            {/* Stars will be added dynamically */}
          </div>
          
          {/* Main content */}
          <div className="relative z-10">
            {children}
          </div>
          <JsonLd data={{ '@context': 'https://schema.org', '@graph': organizationGraph(origin) }} />
        </div>
        <ExitOffer />
        <FunnelTracker />
        </ConsentRoot>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Inter, Cinzel } from "next/font/google";
import JsonLd from "@/components/JsonLd";
import { isLocale, organizationGraph } from "@/lib/seo";
import { appBaseUrl } from "@/lib/stripe";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel", weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl()),
  title: "Callastral — Consultation Astrologique Personnalisée",
  description: "Consultation astrologique vocale 24/7 basée sur votre thème natal complet. Votre astrologue personnel qui vous connaît et se souvient.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/icon.png", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Callastral",
  },
  openGraph: {
    title: "Callastral — Votre astrologue personnel 24/7",
    description: "Consultation astrologique vocale basée sur votre thème natal. Disponible 24/7, continuité garantie.",
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
  const localeHeader = (await headers()).get("x-locale");
  const lang = localeHeader && isLocale(localeHeader) ? localeHeader : "fr";
  const origin = appBaseUrl();
  return (
    <html lang={lang} className={`${inter.variable} ${cinzel.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Callastral" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className={inter.className}>
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
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel", weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  title: "Callastral — Consultation Astrologique Personnalisée",
  description: "Consultation astrologique vocale 24/7 basée sur votre thème natal complet. Votre astrologue personnel qui vous connaît et se souvient.",
  manifest: "/manifest.json",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${cinzel.variable}`}>
      <head>
        <meta name="theme-color" content="#6b46c1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Lunara" />
        <link rel="apple-touch-icon" href="/icon.svg" />
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
        </div>
      </body>
    </html>
  );
}

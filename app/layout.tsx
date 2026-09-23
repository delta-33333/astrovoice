import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel", weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  title: "Lunara — Consultation Astrale",
  description: "Consultation astrale personnalisée 24/7 basée sur votre thème natal.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lunara",
  },
  openGraph: {
    title: "Lunara — Consultation Astrale",
    description: "Consultation astrale personnalisée avec un astrologue expert",
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

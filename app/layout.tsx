import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel", weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  title: "Lumen — Consultation Astrale en Direct",
  description: "Parlez à un astrologue expérimenté pour une consultation personnalisée basée sur votre thème natal.",
  openGraph: {
    title: "Lumen — Consultation Astrale en Direct",
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

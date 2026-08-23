import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Naskh_Arabic, Source_Sans_3 } from "next/font/google";
import { PageEnter } from "@/components/PageEnter";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const arabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
});

export const metadata: Metadata = {
  title: "GreatImmob — Check-in séjour",
  description: "Contrat de location courte durée, pièce d'identité et signature.",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${display.variable} ${sans.variable} ${arabic.variable} font-sans antialiased bg-bone text-ink`}>
        <PageEnter>{children}</PageEnter>
      </body>
    </html>
  );
}

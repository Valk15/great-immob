import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GreatImmob — Conciergerie Airbnb Maroc",
  description: "Doublez vos revenus Airbnb à Agadir.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
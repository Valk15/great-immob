import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Naskh_Arabic, Source_Sans_3 } from "next/font/google";
import { LanguageDock } from "@/components/LanguageSwitcher";
import { PageEnter } from "@/components/PageEnter";
import { SiteLocaleProvider } from "@/components/SiteLocaleProvider";
import { siteCopy } from "@/lib/site-copy";
import { getSiteLocale } from "@/lib/get-site-locale";
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

export async function generateMetadata(): Promise<Metadata> {
  const copy = siteCopy(await getSiteLocale());
  return {
    title: {
      default: copy.meta.defaultTitle,
      template: "%s · GreatImmob",
    },
    description: copy.meta.description,
    icons: {
      icon: "/favicon.png",
      apple: "/apple-touch-icon.png",
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getSiteLocale();
  const copy = siteCopy(locale);

  return (
    <html lang={copy.lang} dir={copy.dir}>
      <body
        className={`${display.variable} ${sans.variable} ${arabic.variable} font-sans antialiased bg-bone text-ink ${
          locale === "ar" ? "font-ar" : ""
        }`}
      >
        <SiteLocaleProvider locale={locale}>
          <PageEnter>{children}</PageEnter>
          <LanguageDock />
        </SiteLocaleProvider>
      </body>
    </html>
  );
}

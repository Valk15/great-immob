"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { SITE_COOKIE, type SiteLocale } from "@/lib/site-i18n";
import { siteCopy, type SiteCopy } from "@/lib/site-copy";

type SiteContextValue = {
  locale: SiteLocale;
  copy: SiteCopy;
  setLocale: (next: SiteLocale) => void;
};

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteLocaleProvider({
  locale,
  children,
}: {
  locale: SiteLocale;
  children: React.ReactNode;
}) {
  const copy = useMemo(() => siteCopy(locale), [locale]);

  const setLocale = useCallback((next: SiteLocale) => {
    document.cookie = `${SITE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    window.location.reload();
  }, []);

  return <SiteContext.Provider value={{ locale, copy, setLocale }}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteLocaleProvider");
  return ctx;
}

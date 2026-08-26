import { cookies, headers } from "next/headers";
import { localeFromAccept, parseSiteLocale, type SiteLocale } from "@/lib/site-i18n";

export async function getSiteLocale(): Promise<SiteLocale> {
  const fromCookie = parseSiteLocale((await cookies()).get("gi-site-lang")?.value);
  if (fromCookie) return fromCookie;
  return localeFromAccept((await headers()).get("accept-language"));
}

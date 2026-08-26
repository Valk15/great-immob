export const SITE_COOKIE = "gi-site-lang";

export type SiteLocale = "en" | "fr" | "ar";

export const SITE_LOCALES: { id: SiteLocale; short: string; native: string }[] = [
  { id: "en", short: "EN", native: "English" },
  { id: "fr", short: "FR", native: "Français" },
  { id: "ar", short: "ع", native: "العربية" },
];

export function isSiteLocale(value: string): value is SiteLocale {
  return value === "en" || value === "fr" || value === "ar";
}

export function parseSiteLocale(raw: unknown): SiteLocale | null {
  const value = String(raw || "")
    .toLowerCase()
    .split("-")[0]
    .trim();
  return isSiteLocale(value) ? value : null;
}

export function localeFromAccept(header?: string | null): SiteLocale {
  const parts = (header || "")
    .toLowerCase()
    .split(",")
    .map((part) => part.split(";")[0].trim());
  for (const part of parts) {
    const parsed = parseSiteLocale(part);
    if (parsed) return parsed;
  }
  return "en";
}

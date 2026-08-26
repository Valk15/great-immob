"use client";

import { usePathname } from "next/navigation";
import { SITE_LOCALES } from "@/lib/site-i18n";
import { useSite } from "@/components/SiteLocaleProvider";

function LanguagePills() {
  const { locale, copy, setLocale } = useSite();

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-mist bg-white/95 px-1 py-0.5 shadow-[0_10px_40px_rgba(11,28,44,0.16)] backdrop-blur-md"
      dir="ltr"
      role="group"
      aria-label={copy.nav.language}
    >
      {SITE_LOCALES.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => {
            if (item.id !== locale) setLocale(item.id);
          }}
          aria-pressed={item.id === locale}
          aria-label={item.native}
          className={`min-w-8 rounded-full px-2.5 py-1.5 text-[11px] font-semibold tracking-wide ${
            item.id === locale ? "bg-ink text-bone" : "text-ink/50 hover:text-ink"
          }`}
        >
          {item.short}
        </button>
      ))}
    </div>
  );
}

export function LanguageDock() {
  const path = usePathname();
  if (path.startsWith("/dashboard") || path.startsWith("/ops") || path === "/login" || path.startsWith("/c/")) return null;

  return (
    <div className="pointer-events-none fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-[max(1.25rem,env(safe-area-inset-left))] z-50">
      <div className="pointer-events-auto">
        <LanguagePills />
      </div>
    </div>
  );
}

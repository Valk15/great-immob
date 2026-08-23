"use client";

import { GUEST_LOCALES, type GuestLocale } from "@/lib/i18n";

export function LanguagePicker({
  value,
  onChange,
}: {
  value: GuestLocale;
  onChange: (locale: GuestLocale) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" dir="ltr">
      {GUEST_LOCALES.map((loc) => (
        <button
          key={loc.id}
          type="button"
          onClick={() => onChange(loc.id)}
          className={
            value === loc.id
              ? "rounded-gi bg-ink px-3 py-1.5 text-xs text-bone"
              : "rounded-gi border border-mist bg-white px-3 py-1.5 text-xs text-ink"
          }
        >
          {loc.native}
        </button>
      ))}
    </div>
  );
}

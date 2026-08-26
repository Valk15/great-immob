"use client";

import { countryLabel, type GuestCopy, type GuestLocale } from "@/lib/i18n";
import { NATIONALITY_OPTIONS } from "@/lib/countries";

export function NationalitySelect({
  name = "nationalite",
  required = false,
  defaultCode = "MA",
  copy,
  locale,
}: {
  name?: string;
  required?: boolean;
  defaultCode?: string;
  copy: GuestCopy;
  locale: GuestLocale;
}) {
  const options = NATIONALITY_OPTIONS.map((c) => ({
    code: c.code,
    dial: c.dial,
    label: countryLabel(c.code, locale),
  })).sort((a, b) => {
    if (a.code === "MA") return -1;
    if (b.code === "MA") return 1;
    return a.label.localeCompare(b.label, locale);
  });

  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wide text-champagne">{copy.nationality}</span>
      <select
        name={name}
        defaultValue={defaultCode}
        required={required}
        className="mt-1 w-full border border-mist bg-white px-3 py-3"
      >
        {options.map((c) => (
          <option key={`${name}-${c.code}`} value={c.code}>
            {c.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PhoneFields({
  codeName,
  localName,
  required = false,
  defaultDial = "212",
  copy,
  locale,
}: {
  codeName: string;
  localName: string;
  required?: boolean;
  defaultDial?: string;
  copy: GuestCopy;
  locale: GuestLocale;
}) {
  const options = NATIONALITY_OPTIONS.map((c) => ({
    code: c.code,
    dial: c.dial,
    label: countryLabel(c.code, locale),
  })).sort((a, b) => {
    if (a.code === "MA") return -1;
    if (b.code === "MA") return 1;
    return a.label.localeCompare(b.label, locale);
  });

  return (
    <div>
      <span className="text-xs uppercase tracking-wide text-champagne">{copy.phone}</span>
      <div className="mt-1 flex gap-2">
        <select
          name={codeName}
          defaultValue={defaultDial}
          className="w-[9.5rem] shrink-0 border border-mist bg-white px-2 py-3 text-sm"
        >
          {options.map((c) => (
            <option key={`${codeName}-${c.code}`} value={c.dial}>
              {c.label} +{c.dial}
            </option>
          ))}
        </select>
        <input
          name={localName}
          type="tel"
          inputMode="tel"
          required={required}
          placeholder="6 12 34 56 78"
          className="min-w-0 flex-1 border border-mist px-3 py-3"
        />
      </div>
    </div>
  );
}

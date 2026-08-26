"use client";

import { useEffect, useMemo, useState } from "react";
import { BrandLockup, Eyebrow } from "@/components/BrandMark";
import { ContractDownload } from "@/components/ContractDownload";
import { LanguagePicker } from "@/components/LanguagePicker";
import { guestCopy, localeFromBrowser, parseLocale, type GuestLocale } from "@/lib/i18n";
import { SITE_COOKIE, parseSiteLocale } from "@/lib/site-i18n";
import type { Stay } from "@/lib/types";
import { CheckinForm } from "./CheckinForm";

function siteLangFromCookie(): GuestLocale | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${SITE_COOKIE}=([^;]*)`));
  const site = parseSiteLocale(match?.[1]);
  return site;
}

export function GuestCheckin({ stay, closed }: { stay: Stay; closed: boolean }) {
  const locked = Boolean(stay.guest?.locale);
  const [locale, setLocale] = useState<GuestLocale>(parseLocale(stay.guest?.locale));
  const [ready, setReady] = useState(locked);

  useEffect(() => {
    if (locked) return;
    const saved = window.localStorage.getItem("gi-guest-locale");
    if (saved) {
      setLocale(parseLocale(saved));
    } else {
      setLocale(siteLangFromCookie() ?? localeFromBrowser(navigator.language));
    }
    setReady(true);
  }, [locked]);

  useEffect(() => {
    if (locked || !ready) return;
    window.localStorage.setItem("gi-guest-locale", locale);
  }, [locked, ready, locale]);

  const copy = useMemo(() => guestCopy(locale), [locale]);

  return (
    <main
      className={`min-h-screen bg-bone ${locale === "ar" ? "font-ar" : ""}`}
      dir={copy.dir}
      lang={copy.lang}
    >
      <header className="bg-ink px-6 py-7">
        <div className="mx-auto max-w-2xl">
          <BrandLockup inverted href={null} />
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-6">
          <p className="mb-2 text-[11px] uppercase tracking-wide text-champagne">{copy.language}</p>
          <LanguagePicker value={locale} onChange={setLocale} />
        </div>
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <h1 className="mt-3 font-display text-4xl leading-tight">
          {copy.title}
          <span className="italic text-champagne">{copy.titleAccent}</span>
        </h1>
        <p className="mt-3 text-sm text-ink/70">
          {stay.propertyAddress}
          <br />
          {copy.dates(stay.checkIn, stay.checkOut)}
        </p>

        {closed ? (
          <div className="mt-8 border border-mist bg-white p-6 text-center">
            <p className="text-sm text-ink/70">{copy.closed}</p>
            <ContractDownload token={stay.token} label={copy.download} hint={copy.downloadHint} />
            <p className="mt-4 text-xs text-ink/50">{copy.whatsapp}</p>
          </div>
        ) : null}
        {stay.status === "awaiting_guest" ? (
          <div className="mt-8">
            <CheckinForm stay={stay} copy={copy} locale={locale} />
          </div>
        ) : null}
      </div>
    </main>
  );
}

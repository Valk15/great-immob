"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { LISTING } from "@/lib/listing";
import { DESTINATION_LINKS, NAV_LINKS } from "@/lib/nav";
import { useSite } from "@/components/SiteLocaleProvider";

export { SiteHeader };

export function SiteFooter() {
  const { copy } = useSite();
  const navLabel = {
    stays: copy.nav.stays,
    howItWorks: copy.nav.howItWorks,
    guestRules: copy.nav.guestRules,
    help: copy.nav.help,
  };

  return (
    <footer className="border-t border-mist bg-ink text-bone">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl">GreatImmob</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-mist">{copy.footer.blurb}</p>
        </div>
        <nav className="grid gap-2 text-sm" aria-label={copy.footer.book}>
          <p className="text-[11px] uppercase tracking-brand text-champagne">{copy.footer.book}</p>
          {DESTINATION_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="text-mist hover:text-bone">
              {copy.city[item.slug].name}
            </Link>
          ))}
          <Link href="/stays" className="text-mist hover:text-bone">
            {copy.footer.allStays}
          </Link>
        </nav>
        <nav className="grid gap-2 text-sm" aria-label={copy.footer.stay}>
          <p className="text-[11px] uppercase tracking-brand text-champagne">{copy.footer.stay}</p>
          {NAV_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="text-mist hover:text-bone">
              {navLabel[item.key]}
            </Link>
          ))}
          <a href={`https://wa.me/${LISTING.whatsapp}`} className="text-mist hover:text-bone">
            WhatsApp
          </a>
          <Link href="/account/login" className="text-mist hover:text-bone">
            {copy.nav.logIn}
          </Link>
        </nav>
      </div>
      <p className="mx-auto max-w-7xl px-5 pb-8 text-xs uppercase tracking-brand text-champagne">
        {copy.footer.superhost(LISTING.host)}
      </p>
    </footer>
  );
}

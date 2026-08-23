import Link from "next/link";
import { BrandLockup } from "@/components/BrandMark";
import { SiteNav } from "@/components/SiteNav";
import { LISTING } from "@/lib/listing";
import { NAV_LINKS } from "@/lib/nav";

export function SiteHeader({
  guestName,
}: {
  guestName?: string | null;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-mist bg-white/95 backdrop-blur-sm">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <BrandLockup href="/" compact />
        <SiteNav guestName={guestName} />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-mist bg-ink text-bone">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="font-display text-2xl">GreatImmob</p>
          <p className="mt-2 max-w-sm text-sm text-mist">
            Direct booking for Hamza&apos;s apartment in Hay Mohammadi, Agadir. Owner
            concierge lives on{" "}
            <a className="underline decoration-champagne" href="https://greatimmob.ma">
              greatimmob.ma
            </a>
            .
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-2 text-sm" aria-label="Footer">
          {NAV_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="text-mist hover:text-bone">
              {item.label}
            </Link>
          ))}
          <a href={`https://wa.me/${LISTING.whatsapp}`} className="text-mist hover:text-bone">
            WhatsApp
          </a>
          <Link href="/account/login" className="text-mist hover:text-bone">
            Account
          </Link>
        </nav>
      </div>
      <p className="mx-auto max-w-6xl px-5 pb-8 text-xs uppercase tracking-brand text-champagne">
        {LISTING.host} · {LISTING.hostRole} · Agadir
      </p>
    </footer>
  );
}

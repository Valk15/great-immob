"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DESTINATION_LINKS, NAV_LINKS } from "@/lib/nav";
import { useSite } from "@/components/SiteLocaleProvider";

function linkClass(active: boolean, onDark: boolean) {
  if (onDark) {
    return active
      ? "text-bone after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:bg-champagne"
      : "text-bone/75 hover:text-bone";
  }
  return active
    ? "text-ink after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:bg-champagne"
    : "text-ink/60 hover:text-ink";
}

export function SiteNav({
  guestName,
  onDark = false,
}: {
  guestName?: string | null;
  onDark?: boolean;
}) {
  const path = usePathname();
  const { copy } = useSite();
  const [open, setOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    setDestOpen(false);
  }, [path]);

  function isActive(href: string) {
    if (href === "/stays") return path === "/stays" || path.startsWith("/stay");
    return path === href || path.startsWith(`${href}/`);
  }

  const destActive = path.startsWith("/destinations");
  const accountClass = onDark ? "text-bone" : "text-ink";
  const burgerBorder = onDark ? "border-bone/40 text-bone" : "border-mist text-ink";
  const bar = onDark ? "bg-bone" : "bg-ink";
  const navLabel = {
    stays: copy.nav.stays,
    howItWorks: copy.nav.howItWorks,
    guestRules: copy.nav.guestRules,
    help: copy.nav.help,
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <nav className="hidden items-center gap-5 text-[13px] lg:flex" aria-label="Main">
        {NAV_LINKS.slice(0, 1).map((item) => (
          <Link key={item.href} href={item.href} className={`relative ${linkClass(isActive(item.href), onDark)}`}>
            {navLabel[item.key]}
          </Link>
        ))}
        <div className="relative">
          <button
            type="button"
            className={`relative ${linkClass(destActive, onDark)}`}
            aria-expanded={destOpen}
            onClick={() => setDestOpen((v) => !v)}
          >
            {copy.nav.destinations}
          </button>
          {destOpen ? (
            <div className="absolute left-1/2 top-full z-50 mt-3 w-56 -translate-x-1/2 overflow-hidden rounded-2xl border border-mist bg-white py-2 shadow-[0_20px_50px_rgba(11,28,44,0.12)]">
              {DESTINATION_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-2.5 text-sm text-ink hover:bg-bone"
                >
                  {copy.city[item.slug].name}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
        {NAV_LINKS.slice(1).map((item) => (
          <Link key={item.href} href={item.href} className={`relative ${linkClass(isActive(item.href), onDark)}`}>
            {navLabel[item.key]}
          </Link>
        ))}
      </nav>
      {guestName ? (
        <Link href="/account" className={`text-[13px] font-medium ${accountClass}`}>
          {guestName}
        </Link>
      ) : (
        <div className="hidden items-center gap-3 sm:flex">
          <Link href="/account/login" className={`text-[13px] font-medium ${accountClass}`}>
            {copy.nav.logIn}
          </Link>
          <Link
            href="/account/register"
            className="rounded-full bg-champagne px-4 py-2 text-[13px] font-semibold text-ink"
          >
            {copy.nav.signUp}
          </Link>
        </div>
      )}
      <button
        type="button"
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border lg:hidden ${burgerBorder}`}
        aria-expanded={open}
        aria-label={open ? copy.nav.closeMenu : copy.nav.openMenu}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">{copy.nav.menu}</span>
        <span className="flex flex-col gap-1.5">
          <span className={`block h-px w-4 ${bar} ${open ? "translate-y-[5px] rotate-45" : ""}`} />
          <span className={`block h-px w-4 ${bar} ${open ? "opacity-0" : ""}`} />
          <span className={`block h-px w-4 ${bar} ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
        </span>
      </button>
      {open ? (
        <div className="absolute inset-x-0 top-full border-b border-mist bg-white lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-5 py-3" aria-label="Mobile">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`border-b border-mist py-3 text-sm ${isActive(item.href) ? "text-champagne" : "text-ink"}`}
              >
                {navLabel[item.key]}
              </Link>
            ))}
            {DESTINATION_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-mist py-3 text-sm text-ink/80"
              >
                {copy.city[item.slug].name}
              </Link>
            ))}
            {!guestName ? (
              <>
                <Link href="/account/login" className="border-b border-mist py-3 text-sm text-ink">
                  {copy.nav.logIn}
                </Link>
                <Link href="/account/register" className="py-3 text-sm font-medium text-champagne">
                  {copy.nav.signUp}
                </Link>
              </>
            ) : (
              <Link href="/account" className="py-3 text-sm text-ink">
                {guestName}
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </div>
  );
}

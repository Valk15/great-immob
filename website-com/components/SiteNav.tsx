"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/nav";

const LINKS = NAV_LINKS;

function linkClass(active: boolean) {
  return active
    ? "text-ink after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:bg-champagne"
    : "text-ink/65 hover:text-ink";
}

export function SiteNav({ guestName }: { guestName?: string | null }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  function isActive(href: string) {
    if (href === "/") return path === "/";
    return path === href || path.startsWith(`${href}/`);
  }

  return (
    <div className="flex items-center gap-3">
      <nav className="hidden items-center gap-6 text-[13px] lg:flex" aria-label="Main">
        {LINKS.map((item) => (
          <Link key={item.href} href={item.href} className={`relative ${linkClass(isActive(item.href))}`}>
            {item.label}
          </Link>
        ))}
      </nav>
      {guestName ? (
        <Link href="/account" className="text-[13px] font-medium text-ink">
          {guestName}
        </Link>
      ) : (
        <Link href="/account/login" className="text-[13px] font-medium text-ink">
          Account
        </Link>
      )}
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center border border-mist text-ink lg:hidden"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">Menu</span>
        <span className="flex flex-col gap-1.5">
          <span className={`block h-px w-4 bg-ink ${open ? "translate-y-[5px] rotate-45" : ""}`} />
          <span className={`block h-px w-4 bg-ink ${open ? "opacity-0" : ""}`} />
          <span className={`block h-px w-4 bg-ink ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
        </span>
      </button>
      {open ? (
        <div className="absolute inset-x-0 top-full border-b border-mist bg-white lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-5 py-3" aria-label="Mobile">
            {LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`border-b border-mist py-3 text-sm ${isActive(item.href) ? "text-champagne" : "text-ink"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}

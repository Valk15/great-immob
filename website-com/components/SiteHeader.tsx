"use client";

import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/BrandMark";
import { SiteNav } from "@/components/SiteNav";

export function SiteHeader({
  guestName,
  overlay = false,
}: {
  guestName?: string | null;
  overlay?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  const onDark = overlay && !scrolled;

  return (
    <header
      className={
        overlay
          ? `fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
              onDark
                ? "border-b border-white/10 bg-ink/20 backdrop-blur-md"
                : "border-b border-mist/80 bg-white/90 shadow-[0_8px_30px_rgba(11,28,44,0.04)] backdrop-blur-md"
            }`
          : "sticky top-0 z-40 border-b border-mist/80 bg-white/90 shadow-[0_8px_30px_rgba(11,28,44,0.04)] backdrop-blur-md"
      }
    >
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
        <BrandLockup href="/" compact inverted={onDark} />
        <SiteNav guestName={guestName} onDark={onDark} />
      </div>
    </header>
  );
}

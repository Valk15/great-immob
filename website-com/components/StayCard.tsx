"use client";

import Image from "next/image";
import Link from "next/link";
import type { StayCard as Stay } from "@/lib/stays";
import { useSite } from "@/components/SiteLocaleProvider";

export function StayCard({
  stay,
  featured = false,
  href,
}: {
  stay: Stay;
  featured?: boolean;
  href?: string;
}) {
  const { copy } = useSite();

  return (
    <Link href={href ?? stay.href} className="group block overflow-hidden rounded-2xl bg-white shadow-[0_10px_40px_rgba(11,28,44,0.06)]">
      <div className={`relative overflow-hidden bg-mist ${featured ? "aspect-[4/3] sm:aspect-[16/10]" : "aspect-[4/3]"}`}>
        <Image
          src={stay.photo.src}
          alt={stay.photo.alt}
          fill
          className="object-cover transition duration-700 group-hover:scale-[1.03]"
          sizes={featured ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 768px) 50vw, 100vw"}
        />
        {stay.available ? (
          <span className="absolute start-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] uppercase tracking-wide text-ink">
            {copy.card.availableNow}
          </span>
        ) : null}
      </div>
      <div className="px-5 py-5">
        <p className="text-[11px] uppercase tracking-brand text-champagne">
          {stay.neighborhood} · {copy.city[stay.citySlug].name}
        </p>
        <h3 className="mt-2 font-display text-2xl leading-snug group-hover:text-champagne">{copy.stay.headline}</h3>
        <p className="mt-2 text-sm text-ink/60">{copy.card.facts(stay.guests, stay.bedrooms, stay.beds, stay.baths)}</p>
        <p className="mt-3 text-sm">
          {copy.card.fromNight(stay.fromMad)}
          <span className="text-ink/45"> · {copy.card.reviews(stay.rating, stay.reviews)}</span>
        </p>
      </div>
    </Link>
  );
}

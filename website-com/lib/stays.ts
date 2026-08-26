import { LISTING } from "@/lib/listing";

/** Guest-facing catalogue. Add a stay here when it is live — never invent units. */
export const STAYS = [
  {
    slug: LISTING.slug,
    href: "/stay",
    name: "Essafa",
    headline: "Quiet 1-bedroom in Hay Mohammadi",
    neighborhood: LISTING.neighborhood,
    city: LISTING.city,
    citySlug: "agadir" as const,
    guests: LISTING.guests,
    bedrooms: LISTING.bedrooms,
    beds: LISTING.beds,
    baths: LISTING.baths,
    fromMad: 400,
    rating: LISTING.rating,
    reviews: LISTING.reviews,
    badges: LISTING.badges,
    photo: LISTING.photos[0],
    available: true,
  },
] as const;

export type StayCard = (typeof STAYS)[number];

export function staysInCity(citySlug?: string | null) {
  if (!citySlug) return [...STAYS];
  return STAYS.filter((stay) => stay.citySlug === citySlug);
}

/** Real photographs (Wikimedia Commons) of Agadir, Marrakech and Essaouira. */
export const DESTINATIONS = [
  {
    slug: "agadir",
    hero: "/places/agadir-night.jpg",
    card: "/places/agadir-beach.jpg",
    open: true,
  },
  {
    slug: "marrakech",
    hero: "/places/marrakech-night.jpg",
    card: "/places/marrakech.jpg",
    open: false,
  },
  {
    slug: "essaouira",
    hero: "/places/essaouira.jpg",
    card: "/places/essaouira-port.jpg",
    open: false,
  },
] as const;

export type Destination = (typeof DESTINATIONS)[number];
export type DestinationSlug = Destination["slug"];

export function getDestination(slug: string) {
  return DESTINATIONS.find((d) => d.slug === slug) ?? null;
}

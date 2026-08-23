export const LISTING = {
  slug: "essafa",
  title: "Luxury 1BR Apartment | Fiber WiFi | Quiet & Elegant",
  subtitle: "Entire rental unit · Hay Mohammadi, Agadir",
  guests: 2,
  bedrooms: 1,
  beds: 1,
  baths: 1.5,
  rating: "4.92",
  reviews: 36,
  badges: ["Guest favourite", "Top 10% of homes"],
  host: "Hamza",
  hostRole: "Superhost",
  airbnbUrl: "https://www.airbnb.com/rooms/1567644686324751910",
  addressLine: "Résidence Essafa 2, H2 RDC, Hay Mohammadi, Agadir",
  neighborhood: "Hay Mohammadi",
  city: "Agadir",
  whatsapp: "212641553583",
  whatsappDisplay: "+212 641 553 583",
  photos: [
    { src: "/stay/hay-1.jpg", alt: "Living space — Essafa apartment, Hay Mohammadi" },
    { src: "/stay/hay-2.jpg", alt: "Interior — Essafa apartment" },
    { src: "/stay/hay-3.jpg", alt: "Bedroom — Essafa apartment" },
    { src: "/stay/hay-4.jpg", alt: "Bathroom — Essafa apartment" },
    { src: "/stay/hay-5.jpg", alt: "Detail — Essafa apartment" },
    { src: "/stay/interior.jpg", alt: "Quiet interior, Agadir" },
  ],
  amenities: ["Fibre Wi-Fi", "Entire apartment", "1 bedroom", "1 bed", "1.5 baths", "Quiet building"],
  about:
    "A quiet 1-bedroom apartment in Hay Mohammadi, Agadir — the same home Hamza hosts on Airbnb as a Superhost. Fibre Wi-Fi, one bed, 1.5 baths. Two guests.",
} as const;

/** Seasonal nightly rates in MAD. Mid band of the 300–600 range Hamza already uses. */
export function nightlyRateMad(isoDate: string) {
  const month = Number(isoDate.slice(5, 7));
  if (month === 7 || month === 8) return 550;
  if (month === 12 || month === 1) return 450;
  return 400;
}

export function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(iso: string, days: number) {
  const d = parseIso(iso);
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

export function nightsBetween(checkIn: string, checkOut: string) {
  const a = parseIso(checkIn).getTime();
  const b = parseIso(checkOut).getTime();
  return Math.round((b - a) / 86400000);
}

export function eachNight(checkIn: string, checkOut: string) {
  const nights = nightsBetween(checkIn, checkOut);
  const out: string[] = [];
  for (let i = 0; i < nights; i++) out.push(addDays(checkIn, i));
  return out;
}

export function quoteStay(checkIn: string, checkOut: string) {
  const nights = eachNight(checkIn, checkOut);
  const lines = nights.map((date) => ({ date, amount: nightlyRateMad(date) }));
  const totalMad = lines.reduce((sum, line) => sum + line.amount, 0);
  return { nights: nights.length, lines, totalMad };
}

/** Overlap: checkout day may be the next guest's check-in day. */
export function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && bStart < aEnd;
}

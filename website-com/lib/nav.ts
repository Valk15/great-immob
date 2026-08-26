export const NAV_LINKS = [
  { href: "/stays", key: "stays" as const },
  { href: "/how-it-works", key: "howItWorks" as const },
  { href: "/guest-rules", key: "guestRules" as const },
  { href: "/help", key: "help" as const },
] as const;

export const DESTINATION_LINKS = [
  { href: "/destinations/agadir", slug: "agadir" as const },
  { href: "/destinations/marrakech", slug: "marrakech" as const },
  { href: "/destinations/essaouira", slug: "essaouira" as const },
] as const;

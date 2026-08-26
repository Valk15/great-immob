/**
 * Guest-facing notes on Moroccan short-stay rules.
 * This is information for travellers, not legal advice. House rules in French remain the contract text.
 */
export const GUEST_LAW = {
  disclaimer:
    "This page explains how we host short stays in Morocco. It is not a lawyer’s opinion and does not replace the stay contract. The French house rules you sign at check-in are the rules of the home.",
  sources: [
    {
      name: "Law no. 80-14 on tourist establishments and other forms of tourist accommodation",
      note: "Dahir no. 1-15-108 of 18 August 2015. The frame for hotels, riads, guesthouses, and furnished tourist rentals.",
    },
    {
      name: "Decree no. 2-23-441",
      note: "Published 2023. Application rules for tourist accommodation, including forms that used to sit in a grey zone on booking platforms.",
    },
    {
      name: "Law no. 47-06, as amended (notably by law no. 07-20)",
      note: "Local taxation, including the tourist stay tax (taxe de séjour) set by each commune.",
    },
    {
      name: "Law no. 67-12 on the lease of residential premises",
      note: "The ordinary home-rental law. A stay of a few nights is not that contract.",
    },
  ],
  sections: [
    {
      id: "what-you-are-booking",
      title: "What you are booking",
      body: [
        "A stay here is a short tourist stay in a furnished home — nights, not a year, not a principal residence. In Moroccan law that sits with tourist accommodation (law 80-14), not with the residential lease (law 67-12).",
        "Platforms (Airbnb, Booking, Vrbo, or this site) do not replace the host’s duties. The host is the person who confirms the stay, identifies guests, and hands over the keys. Here that person is Hamza.",
        "We do not use Instant Book. A request is confirmed only when the calendar is free here and on Airbnb, so the same apartment cannot be sold twice.",
      ],
    },
    {
      id: "why-id",
      title: "Why we ask for your identity",
      body: [
        "Tourist hosts in Morocco keep a guest register and declare travellers to the local authorities (arrival forms / police fiche). That is why check-in asks for a passport or CIN, and a signature, before arrival is complete.",
        "The file is not a marketing form. It is how a serious short stay is run: who is in the home, for which nights, under which house rules.",
        "Names on the booking must match the people who sleep in the apartment. Extra unannounced guests are refused.",
      ],
    },
    {
      id: "tax",
      title: "Tourist tax",
      body: [
        "Communes may levy a stay tax (taxe de séjour) per person per night on tourist lodging, including furnished apartments let to travellers. The rate is local — Agadir, Marrakech, and Essaouira each set their own.",
        "If a tax applies to your stay, Hamza states it with the confirmation, in dirhams. This site does not invent a number on your behalf.",
        "Airbnb and Booking do not always collect Moroccan stay tax for the host. Direct booking here does not hide that duty; it keeps it on the confirmation you actually receive.",
      ],
    },
    {
      id: "house-rules",
      title: "House rules that are not optional",
      body: [
        "The apartment is a short-stay home, not a party venue, film set, or shop. Gatherings, undeclared commercial shoots, indoor smoking, and pets are refused — as written in the French rules you sign.",
        "Unmarried Moroccan couples are not accommodated in this home. That is a house rule, applied at booking and at the door, in line with how this stay is run in Morocco.",
        "Respect for neighbours is part of the stay. Complaints from the building can end the stay without a refund of remaining nights.",
      ],
    },
    {
      id: "cities",
      title: "Agadir, Marrakech, Essaouira",
      body: [
        "The same guest duties follow the stay, not the logo of a platform: identity, quiet building, confirmed dates, payment as agreed on WhatsApp after confirmation.",
        "Today the live, bookable home is in Agadir. Marrakech and Essaouira are cities we host for — listings appear when a home is actually ready.",
      ],
    },
  ],
} as const;

export type GuestParty = {
  adults: number;
  children: number;
  pets: number;
};

export const DEFAULT_PARTY: GuestParty = { adults: 2, children: 0, pets: 0 };
export const SEARCH_MAX_PEOPLE = 16;
export const MAX_PETS = 5;

export function peopleCount(party: GuestParty) {
  return party.adults + party.children;
}

export function clampParty(party: Partial<GuestParty>, maxPeople: number): GuestParty {
  const cap = Math.max(1, maxPeople);
  let adults = Math.floor(Number(party.adults));
  let children = Math.floor(Number(party.children));
  let pets = Math.floor(Number(party.pets));
  if (!Number.isFinite(adults) || adults < 1) adults = 1;
  if (!Number.isFinite(children) || children < 0) children = 0;
  if (!Number.isFinite(pets) || pets < 0) pets = 0;
  adults = Math.min(adults, cap);
  children = Math.min(children, Math.max(0, cap - adults));
  pets = Math.min(pets, MAX_PETS);
  return { adults, children, pets };
}

export function parseGuestParty(
  q: { guests?: string; adults?: string; children?: string; pets?: string },
  maxPeople: number,
): GuestParty {
  const hasBreakdown = q.adults != null && q.adults !== "";
  if (hasBreakdown) {
    return clampParty(
      {
        adults: Number(q.adults),
        children: Number(q.children || 0),
        pets: Number(q.pets || 0),
      },
      maxPeople,
    );
  }
  const guests = Math.floor(Number(q.guests));
  const people = Number.isFinite(guests) && guests >= 1 ? guests : DEFAULT_PARTY.adults;
  return clampParty({ adults: people, children: 0, pets: Number(q.pets || 0) }, maxPeople);
}

export function partySearchParams(party: GuestParty) {
  return {
    guests: String(peopleCount(party)),
    adults: String(party.adults),
    children: String(party.children),
    pets: String(party.pets),
  };
}

export function stayQueryString(
  q: {
    in?: string;
    out?: string;
    guests?: string;
    adults?: string;
    children?: string;
    pets?: string;
  },
  party?: GuestParty,
) {
  const params = new URLSearchParams();
  if (q.in) params.set("in", q.in);
  if (q.out) params.set("out", q.out);
  const fromParty = party ? partySearchParams(party) : null;
  const guests = fromParty?.guests ?? q.guests;
  const adults = fromParty?.adults ?? q.adults;
  const children = fromParty?.children ?? q.children;
  const pets = fromParty?.pets ?? q.pets;
  if (guests) params.set("guests", guests);
  if (adults) params.set("adults", adults);
  if (children) params.set("children", children);
  if (pets) params.set("pets", pets);
  const s = params.toString();
  return s ? `?${s}` : "";
}

import Link from "next/link";
import { currentGuest } from "@/lib/guest-auth";
import { getSiteLocale } from "@/lib/get-site-locale";
import { DESTINATIONS } from "@/lib/destinations";
import { SEARCH_MAX_PEOPLE, parseGuestParty, stayQueryString } from "@/lib/guest-party";
import { LISTING } from "@/lib/listing";
import { siteCopy } from "@/lib/site-copy";
import { staysInCity } from "@/lib/stays";
import { StayCard } from "@/components/StayCard";
import { StaySearch } from "@/components/StaySearch";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const copy = siteCopy(await getSiteLocale());
  return { title: copy.meta.stays, description: copy.meta.staysDesc };
}

export default async function StaysPage({
  searchParams,
}: {
  searchParams: Promise<{
    city?: string;
    in?: string;
    out?: string;
    guests?: string;
    adults?: string;
    children?: string;
    pets?: string;
  }>;
}) {
  const guest = await currentGuest();
  const copy = siteCopy(await getSiteLocale());
  const q = await searchParams;
  const city = DESTINATIONS.some((d) => d.slug === q.city) ? q.city : undefined;
  const dest = DESTINATIONS.find((d) => d.slug === city);
  const cityName = dest ? copy.city[dest.slug].name : "";
  const stays = staysInCity(city);
  const party = parseGuestParty(q, SEARCH_MAX_PEOPLE);
  const dateQuery = stayQueryString(q, party);

  return (
    <div className="min-h-screen bg-bone">
      <SiteHeader guestName={guest?.name} />
      <main className="mx-auto max-w-7xl px-5 py-12">
        <p className="text-[11px] uppercase tracking-brand text-champagne">{copy.stays.eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">
          {dest ? copy.stays.inCity(cityName) : copy.stays.inMorocco}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink/70">{copy.stays.lead}</p>
        <div className="mt-8">
          <StaySearch
            key={`${city || "all"}-${party.adults}-${party.children}-${party.pets}`}
            variant="bar"
            defaultCity={city || "agadir"}
            defaultParty={party}
          />
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/stays"
            className={`rounded-full px-4 py-2 text-sm ${!city ? "bg-ink text-bone" : "border border-mist bg-white"}`}
          >
            {copy.stays.all}
          </Link>
          {DESTINATIONS.map((d) => (
            <Link
              key={d.slug}
              href={`/stays?city=${d.slug}`}
              className={`rounded-full px-4 py-2 text-sm ${
                city === d.slug ? "bg-ink text-bone" : "border border-mist bg-white"
              }`}
            >
              {copy.city[d.slug].name}
            </Link>
          ))}
        </div>

        {stays.length ? (
          <div className={`mt-12 grid gap-8 ${stays.length > 1 ? "md:grid-cols-2" : "max-w-3xl"}`}>
            {stays.map((stay) => (
              <StayCard
                key={stay.slug}
                stay={stay}
                featured={stays.length === 1}
                href={`${stay.href}${dateQuery}`}
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 max-w-xl rounded-2xl border border-mist bg-white p-8">
            <h2 className="font-display text-3xl">{copy.stays.emptyTitle(cityName)}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">{copy.stays.emptyLead}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/stays?city=agadir" className="rounded-full bg-ink px-5 py-2.5 text-sm text-bone">
                {copy.stays.seeAgadir}
              </Link>
              <a
                href={`https://wa.me/${LISTING.whatsapp}?text=${encodeURIComponent(copy.stays.waLooking(cityName))}`}
                className="rounded-full border border-mist px-5 py-2.5 text-sm"
              >
                {copy.dest.whatsappHamza}
              </a>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

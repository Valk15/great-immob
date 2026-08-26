import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currentGuest } from "@/lib/guest-auth";
import { getSiteLocale } from "@/lib/get-site-locale";
import { DESTINATIONS, getDestination } from "@/lib/destinations";
import { LISTING } from "@/lib/listing";
import { siteCopy } from "@/lib/site-copy";
import { staysInCity } from "@/lib/stays";
import { StayCard } from "@/components/StayCard";
import { StaySearch } from "@/components/StaySearch";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ city: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const dest = getDestination((await params).city);
  const copy = siteCopy(await getSiteLocale());
  if (!dest) return { title: copy.nav.destinations };
  const city = copy.city[dest.slug];
  return {
    title: copy.meta.destination(city.name),
    description: copy.meta.destinationDesc(city.name, city.tagline),
  };
}

export default async function DestinationPage({ params }: { params: Promise<{ city: string }> }) {
  const dest = getDestination((await params).city);
  if (!dest) notFound();
  const guest = await currentGuest();
  const copy = siteCopy(await getSiteLocale());
  const city = copy.city[dest.slug];
  const stays = staysInCity(dest.slug);
  const wa = `https://wa.me/${LISTING.whatsapp}?text=${encodeURIComponent(copy.dest.waCity(city.name))}`;

  return (
    <div className="min-h-screen bg-bone">
      <SiteHeader guestName={guest?.name} overlay />
      <main>
        <section className="relative h-[52vh] min-h-80 overflow-hidden bg-ink">
          <Image src={dest.hero} alt={city.heroAlt} fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/20" />
          <div className="relative mx-auto flex h-full max-w-7xl items-end px-5 pb-10">
            <div>
              <p className="text-[11px] uppercase tracking-brand text-champagne">{city.region}</p>
              <h1 className="mt-2 font-display text-5xl text-bone sm:text-6xl">{city.name}</h1>
              <p className="mt-3 max-w-xl text-sm text-mist">{city.tagline}</p>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-14">
          <p className="max-w-2xl text-base leading-relaxed text-ink/75">{city.blurb}</p>
          <div className="mt-8">
            <StaySearch variant="bar" defaultCity={dest.slug} />
          </div>
          {stays.length ? (
            <div className="mt-12 max-w-3xl">
              {stays.map((stay) => (
                <StayCard key={stay.slug} stay={stay} featured />
              ))}
            </div>
          ) : (
            <div className="mt-12 max-w-xl rounded-2xl border border-mist bg-white p-8">
              <h2 className="font-display text-3xl">{copy.dest.openingTitle(city.name)}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">{copy.dest.openingLead}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/stays?city=agadir" className="rounded-full bg-ink px-5 py-2.5 text-sm text-bone">
                  {copy.dest.bookAgadir}
                </Link>
                <a href={wa} className="rounded-full border border-mist px-5 py-2.5 text-sm">
                  {copy.dest.whatsappHamza}
                </a>
              </div>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

import { HOUSE_RULES } from "@/lib/brand";
import { currentGuest } from "@/lib/guest-auth";
import { getSiteLocale } from "@/lib/get-site-locale";
import { parseGuestParty } from "@/lib/guest-party";
import { LISTING } from "@/lib/listing";
import { siteCopy } from "@/lib/site-copy";
import { BookingPanel } from "@/components/BookingPanel";
import { PhotoGrid } from "@/components/PhotoGrid";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const copy = siteCopy(await getSiteLocale());
  return { title: copy.meta.stay, description: copy.stay.about };
}

export default async function StayPage({
  searchParams,
}: {
  searchParams: Promise<{
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
  const dates = await searchParams;
  const party = parseGuestParty(dates, LISTING.guests);

  return (
    <div className="min-h-screen bg-bone">
      <SiteHeader guestName={guest?.name} />
      <main className="mx-auto max-w-6xl px-5 py-8">
        <p className="text-[11px] font-medium uppercase tracking-brand text-champagne">
          {LISTING.neighborhood} · {copy.city.agadir.name}
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">{copy.stay.title}</h1>
        <p className="mt-2 text-sm text-ink/70">{copy.stay.subtitle}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <span>
            ★ {LISTING.rating} · {copy.stay.reviews(LISTING.reviews)}
          </span>
          {copy.stay.badges.map((b) => (
            <span key={b} className="text-champagne">
              {b}
            </span>
          ))}
          <span>{copy.stay.hostedBy(LISTING.host, LISTING.hostRole)}</span>
        </div>

        <div className="mt-8">
          <PhotoGrid />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <section>
            <p className="text-sm uppercase tracking-wide text-champagne">
              {copy.stay.facts(LISTING.guests, LISTING.bedrooms, LISTING.beds, LISTING.baths)}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/80">{copy.stay.about}</p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {copy.stay.amenities.map((item) => (
                <li key={item} className="border border-mist bg-white px-4 py-3 text-sm">
                  {item}
                </li>
              ))}
            </ul>

            <h2 className="mt-12 font-display text-3xl">{copy.stay.houseRules}</h2>
            <p className="mt-2 text-sm text-ink/60">
              {copy.stay.houseRulesLead}{" "}
              <a href="/guest-rules" className="underline decoration-champagne">
                {copy.stay.whyId}
              </a>
              .
            </p>
            <ol className="mt-4 list-decimal space-y-2 ps-5 text-sm leading-relaxed text-ink/80" dir="ltr" lang="fr">
              {HOUSE_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ol>

            <p className="mt-8 text-sm text-ink/60">
              {copy.stay.alsoListed}{" "}
              <a className="underline decoration-champagne" href={LISTING.airbnbUrl}>
                Airbnb
              </a>
              {copy.stay.calendars}
            </p>
          </section>
          <div className="h-fit lg:sticky lg:top-24">
            <BookingPanel
              loggedIn={Boolean(guest)}
              initialIn={dates.in}
              initialOut={dates.out}
              initialAdults={party.adults}
              initialChildren={party.children}
              initialPets={party.pets}
            />
            <a
              href={`https://wa.me/${LISTING.whatsapp}`}
              className="mt-4 block text-center text-sm text-champagne"
            >
              {copy.stay.whatsapp(LISTING.host, LISTING.whatsappDisplay)}
            </a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

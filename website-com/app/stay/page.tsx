import { HOUSE_RULES } from "@/lib/brand";
import { currentGuest } from "@/lib/guest-auth";
import { LISTING } from "@/lib/listing";
import { BookingPanel } from "@/components/BookingPanel";
import { PhotoGrid } from "@/components/PhotoGrid";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The apartment",
  description: LISTING.about,
};

export default async function StayPage({
  searchParams,
}: {
  searchParams: Promise<{ in?: string; out?: string }>;
}) {
  const guest = await currentGuest();
  const dates = await searchParams;

  return (
    <div className="min-h-screen bg-bone">
      <SiteHeader guestName={guest?.name} />
      <main className="mx-auto max-w-6xl px-5 py-8">
        <p className="text-[11px] font-medium uppercase tracking-brand text-champagne">
          {LISTING.neighborhood} · {LISTING.city}
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">{LISTING.title}</h1>
        <p className="mt-2 text-sm text-ink/70">{LISTING.subtitle}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <span>
            ★ {LISTING.rating} · {LISTING.reviews} reviews
          </span>
          {LISTING.badges.map((b) => (
            <span key={b} className="text-champagne">
              {b}
            </span>
          ))}
          <span>
            Hosted by {LISTING.host} · {LISTING.hostRole}
          </span>
        </div>

        <div className="mt-8">
          <PhotoGrid />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <section>
            <p className="text-sm uppercase tracking-wide text-champagne">
              {LISTING.guests} guests · {LISTING.bedrooms} bedroom · {LISTING.beds} bed · {LISTING.baths}{" "}
              baths
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/80">{LISTING.about}</p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {LISTING.amenities.map((item) => (
                <li key={item} className="border border-mist bg-white px-4 py-3 text-sm">
                  {item}
                </li>
              ))}
            </ul>

            <h2 className="mt-12 font-display text-3xl">House rules</h2>
            <p className="mt-2 text-sm text-ink/60">The same rules as the stay contract. French original.</p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink/80">
              {HOUSE_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ol>

            <p className="mt-8 text-sm text-ink/60">
              Also listed on{" "}
              <a className="underline decoration-champagne" href={LISTING.airbnbUrl}>
                Airbnb
              </a>
              . Hamza confirms .com requests so the two calendars never overlap.
            </p>
          </section>
          <div className="h-fit lg:sticky lg:top-24">
            <BookingPanel
              loggedIn={Boolean(guest)}
              initialIn={dates.in}
              initialOut={dates.out}
            />
            <a
              href={`https://wa.me/${LISTING.whatsapp}`}
              className="mt-4 block text-center text-sm text-champagne"
            >
              WhatsApp {LISTING.host} · {LISTING.whatsappDisplay}
            </a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

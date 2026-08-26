import Image from "next/image";
import Link from "next/link";
import { currentGuest } from "@/lib/guest-auth";
import { getSiteLocale } from "@/lib/get-site-locale";
import { DESTINATIONS } from "@/lib/destinations";
import { LISTING } from "@/lib/listing";
import { siteCopy } from "@/lib/site-copy";
import { STAYS } from "@/lib/stays";
import { StayCard } from "@/components/StayCard";
import { StaySearch } from "@/components/StaySearch";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const copy = siteCopy(await getSiteLocale());
  return { title: { absolute: copy.meta.defaultTitle }, description: copy.meta.description };
}

export default async function HomePage() {
  const guest = await currentGuest();
  const copy = siteCopy(await getSiteLocale());
  const featured = STAYS[0];
  const wa = `https://wa.me/${LISTING.whatsapp}?text=${encodeURIComponent(copy.home.waMessage)}`;

  return (
    <div className="min-h-screen bg-bone">
      <SiteHeader guestName={guest?.name} overlay />
      <main>
        <section className="relative min-h-[100svh] overflow-hidden bg-ink text-bone">
          <Image
            src="/places/agadir-night.jpg"
            alt={copy.city.agadir.heroAlt}
            fill
            priority
            className="hero-media object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/35 to-ink/85" />
          <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 pb-12 pt-28 sm:pb-16">
            <p className="text-[11px] uppercase tracking-brand text-champagne">{copy.home.citiesLine}</p>
            <h1 className="mt-4 max-w-4xl font-display text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl">
              {copy.home.title}
              <span className="italic text-champagne">{copy.home.titleAccent}</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-mist sm:text-base">{copy.home.lead}</p>
            <div className="mt-8 max-w-5xl">
              <StaySearch />
            </div>
            <p className="mt-4 text-xs text-bone/55">{copy.home.searchHint}</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-brand text-champagne">{copy.home.destinationsEyebrow}</p>
              <h2 className="mt-2 font-display text-4xl sm:text-5xl">{copy.home.destinationsTitle}</h2>
            </div>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {DESTINATIONS.map((city) => {
              const info = copy.city[city.slug];
              return (
                <Link key={city.slug} href={`/destinations/${city.slug}`} className="group relative block overflow-hidden rounded-2xl">
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={city.card}
                      alt={info.cardAlt}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-[1.04]"
                      sizes="(min-width: 768px) 33vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-ink/10" />
                    <div className="absolute inset-x-0 bottom-0 p-6 text-bone">
                      <p className="text-[11px] uppercase tracking-brand text-champagne">{info.region}</p>
                      <h3 className="mt-1 font-display text-3xl">{info.name}</h3>
                      <p className="mt-2 text-sm text-bone/75">{info.tagline}</p>
                      <p className="mt-3 text-xs uppercase tracking-wide text-champagne">
                        {city.open ? copy.home.homesAvailable : copy.home.openingSoon}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-brand text-champagne">{copy.home.availableNow}</p>
                <h2 className="mt-2 font-display text-4xl">{copy.home.placesToBook}</h2>
              </div>
              <Link href="/stays" className="text-sm text-champagne underline decoration-champagne/40">
                {copy.home.allStays}
              </Link>
            </div>
            <div className="mt-10 max-w-3xl">
              <StayCard stay={featured} featured />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20">
          <p className="text-[11px] uppercase tracking-brand text-champagne">{copy.home.howEyebrow}</p>
          <h2 className="mt-2 font-display text-4xl">{copy.home.howTitle}</h2>
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {copy.home.steps.map((step) => (
              <li key={step.n} className="rounded-2xl border border-mist bg-white p-6">
                <p className="text-xs text-champagne">{step.n}</p>
                <h3 className="mt-3 font-display text-2xl">{step.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{step.d}</p>
              </li>
            ))}
          </ol>
          <Link href="/how-it-works" className="mt-8 inline-block text-sm text-champagne underline decoration-champagne/40">
            {copy.home.fullPath}
          </Link>
        </section>

        <section className="border-y border-mist bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:grid-cols-4">
            {[
              { k: LISTING.rating, v: copy.home.airbnbRating },
              { k: String(LISTING.reviews), v: copy.home.guestReviews },
              { k: copy.home.request, v: copy.home.notInstant },
              { k: LISTING.hostRole, v: `${LISTING.host} · WhatsApp` },
            ].map((item) => (
              <div key={item.v}>
                <p className="font-display text-4xl text-ink">{item.k}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-champagne">{item.v}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden bg-ink py-20 text-bone">
          <Image src="/places/agadir-night.jpg" alt="" fill className="object-cover opacity-25" sizes="100vw" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-brand text-champagne">{copy.home.lawEyebrow}</p>
              <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{copy.home.lawTitle}</h2>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-mist">{copy.home.lawLead}</p>
              <Link href="/guest-rules" className="mt-8 inline-block rounded-full bg-champagne px-6 py-3 text-sm font-semibold text-ink">
                {copy.home.readRules}
              </Link>
            </div>
            <ul className="space-y-4 text-sm leading-relaxed text-mist">
              {copy.home.lawPoints.map((point) => (
                <li key={point} className="rounded-2xl border border-bone/15 bg-ink/60 p-5 backdrop-blur-sm">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20">
          <p className="text-[11px] uppercase tracking-brand text-champagne">{copy.home.faqEyebrow}</p>
          <h2 className="mt-2 font-display text-4xl">{copy.home.faqTitle}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {copy.home.faqs.map((item) => (
              <div key={item.q} className="rounded-2xl border border-mist bg-white p-6">
                <h3 className="font-display text-2xl">{item.q}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-mist bg-white py-16">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5">
            <div>
              <h2 className="font-display text-3xl">{copy.home.whatsappTitle}</h2>
              <p className="mt-2 text-sm text-ink/65">{copy.home.whatsappLead}</p>
            </div>
            <a href={wa} className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-bone">
              {copy.home.messageHamza}
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { currentGuest } from "@/lib/guest-auth";
import { LISTING } from "@/lib/listing";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

export const metadata = {
  title: { absolute: "GreatImmob — Hay Mohammadi, Agadir" },
};

export default async function HomePage() {
  const guest = await currentGuest();

  return (
    <div className="min-h-screen bg-bone">
      <SiteHeader guestName={guest?.name} />
      <main>
        <section className="relative min-h-[78vh] overflow-hidden bg-ink text-bone">
          <Image
            src="/stay/hay-1.jpg"
            alt="Living room of the Essafa apartment in Hay Mohammadi"
            fill
            priority
            className="object-cover opacity-55"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/25" />
          <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28">
            <p className="text-[11px] uppercase tracking-brand text-champagne">
              Agadir · Hay Mohammadi
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-5xl leading-[1.05] sm:text-7xl">
              Stay in Agadir.
              <span className="italic text-champagne"> Hosted on the ground.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-mist sm:text-base">
              One quiet 1-bedroom apartment, hosted by Hamza — Superhost, Guest favourite.
              Book here. Check-in here. WhatsApp is the same number.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/stay" className="rounded-gi bg-champagne px-6 py-3 text-sm font-medium text-ink">
                See the listing
              </Link>
              <Link
                href="/contact"
                className="rounded-gi border border-bone/30 px-6 py-3 text-sm text-bone hover:border-champagne"
              >
                Contact Hamza
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y border-mist bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-4">
            {[
              { k: LISTING.rating, v: "Airbnb rating" },
              { k: String(LISTING.reviews), v: "Guest reviews" },
              { k: "Top 10%", v: "Of homes on Airbnb" },
              { k: LISTING.hostRole, v: LISTING.host },
            ].map((item) => (
              <div key={item.v}>
                <p className="font-display text-4xl text-ink">{item.k}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-champagne">{item.v}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden bg-mist">
              <Image
                src="/stay/hay-3.jpg"
                alt="Bedroom of the Essafa apartment"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-brand text-champagne">The apartment</p>
              <h2 className="mt-3 font-display text-4xl leading-tight">
                Luxury 1BR. Fibre Wi-Fi. Quiet Hay Mohammadi.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink/75">{LISTING.about}</p>
              <p className="mt-4 text-sm text-ink/60">
                2 guests · 1 bedroom · 1 bed · 1.5 baths · from 400 MAD / night
              </p>
              <Link href="/stay" className="mt-8 inline-block text-sm text-champagne underline decoration-champagne/50">
                Open the listing and dates →
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-ink py-20 text-bone">
          <div className="mx-auto max-w-6xl px-5">
            <p className="text-[11px] uppercase tracking-brand text-champagne">GreatImmob</p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight">
              A Superhost-grade stay. One face. No theatre.
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  href: "/work",
                  title: "Our work",
                  body: "The live Airbnb listing is the proof: 4.92, Guest favourite, Superhost Hamza. Not a catalogue of invented units.",
                },
                {
                  href: "/about",
                  title: "What GreatImmob is",
                  body: "Short-term rental, managed on the ground in Agadir. Guests book here. Owners meet Hamza on greatimmob.ma.",
                },
                {
                  href: "/contact",
                  title: "Contact",
                  body: "WhatsApp Hamza, the same number as on Airbnb. Questions about dates, check-in, or the apartment.",
                },
              ].map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="border border-mist/20 bg-ink p-6 transition hover:border-champagne/50"
                >
                  <p className="font-display text-2xl">{card.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-mist">{card.body}</p>
                  <p className="mt-6 text-xs uppercase tracking-wide text-champagne">Read</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { currentGuest } from "@/lib/guest-auth";
import { LISTING } from "@/lib/listing";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Our work",
  description: "The live Superhost apartment in Hay Mohammadi — 4.92, Guest favourite, hosted by Hamza.",
};

export default async function WorkPage() {
  const guest = await currentGuest();

  return (
    <div className="min-h-screen bg-bone">
      <SiteHeader guestName={guest?.name} />
      <main className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-[11px] uppercase tracking-brand text-champagne">Our work</p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl leading-tight">
          One apartment. Real numbers. Hamza on site.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/75">
          GreatImmob does not publish a fake portfolio. The work you can verify today is this
          stay in Hay Mohammadi — the same listing guests already know on Airbnb.
        </p>

        <dl className="mt-12 grid gap-6 border-y border-mist py-10 sm:grid-cols-4">
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-champagne">Rating</dt>
            <dd className="mt-1 font-display text-4xl">{LISTING.rating}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-champagne">Reviews</dt>
            <dd className="mt-1 font-display text-4xl">{LISTING.reviews}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-champagne">Badges</dt>
            <dd className="mt-1 font-display text-2xl leading-tight">Guest favourite · Top 10%</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-champagne">Host</dt>
            <dd className="mt-1 font-display text-2xl">
              {LISTING.host}, {LISTING.hostRole}
            </dd>
          </div>
        </dl>

        <div className="mt-12 grid gap-3 sm:grid-cols-3">
          {LISTING.photos.slice(0, 6).map((photo) => (
            <div key={photo.src} className="relative aspect-[4/3] overflow-hidden bg-mist">
              <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="33vw" />
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-2xl">
          <h2 className="font-display text-3xl">What this proves</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink/75">
            <li>Check-in, messaging, and the apartment are run by Hamza — not a call centre.</li>
            <li>The public Airbnb page is the source for rating, reviews, and Superhost.</li>
            <li>We do not add extra units or invented client counts. When a second stay is live, it will appear here.</li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/stay" className="rounded-gi bg-ink px-5 py-3 text-sm text-bone">
              Book this stay
            </Link>
            <a
              href={LISTING.airbnbUrl}
              className="rounded-gi border border-mist px-5 py-3 text-sm"
              target="_blank"
              rel="noreferrer"
            >
              View on Airbnb
            </a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

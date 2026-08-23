import Image from "next/image";
import Link from "next/link";
import { currentGuest } from "@/lib/guest-auth";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "What is GreatImmob",
  description: "GreatImmob is Superhost-grade short-stay hosting in Agadir, with Hamza on the ground.",
};

export default async function AboutPage() {
  const guest = await currentGuest();

  return (
    <div className="min-h-screen bg-bone">
      <SiteHeader guestName={guest?.name} />
      <main>
        <section className="relative h-[42vh] min-h-64 overflow-hidden bg-ink">
          <Image
            src="/places/coast.jpg"
            alt="Atlantic coast near Agadir"
            fill
            className="object-cover opacity-50"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-ink/35" />
          <div className="relative mx-auto flex h-full max-w-6xl items-end px-5 pb-10">
            <div>
              <p className="text-[11px] uppercase tracking-brand text-champagne">GreatImmob</p>
              <h1 className="mt-2 font-display text-5xl text-bone">Your stay. Managed on the ground.</h1>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-16">
          <p className="text-lg leading-relaxed text-ink/80">
            GreatImmob is a short-term rental house in Agadir — not a marketplace of dozens of
            apartments, and not a faceless agency. Hamza hosts. Hamza answers WhatsApp. The
            apartment in Hay Mohammadi is the public proof.
          </p>
          <p className="mt-6 text-base leading-relaxed text-ink/70">
            This site, greatimmob.com, is for guests: the listing, your account, booking dates,
            and check-in (contract, ID, signature). Owners who want the same standard for their
            own property speak to Hamza on{" "}
            <a href="https://greatimmob.ma" className="underline decoration-champagne">
              greatimmob.ma
            </a>
            .
          </p>

          <h2 className="mt-14 font-display text-3xl">How it works for guests</h2>
          <ol className="mt-6 space-y-6">
            {[
              {
                n: "01",
                t: "Choose dates",
                d: "Open the listing. If those nights are free here, send a request. Hamza confirms so Airbnb and this calendar never clash.",
              },
              {
                n: "02",
                t: "Pay on WhatsApp",
                d: "No card on this site yet. After confirmation, Hamza sends the amount and the stay is yours.",
              },
              {
                n: "03",
                t: "Check in here",
                d: "You get a private link: identity, house rules, handwritten signature, in the language you choose. Hamza’s operator file stays in French.",
              },
            ].map((step) => (
              <li key={step.n} className="grid grid-cols-[3rem_1fr] gap-4">
                <span className="text-sm text-champagne">{step.n}</span>
                <div>
                  <p className="font-medium">{step.t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink/70">{step.d}</p>
                </div>
              </li>
            ))}
          </ol>

          <h2 className="mt-14 font-display text-3xl">Where</h2>
          <p className="mt-4 text-base leading-relaxed text-ink/70">
            Hay Mohammadi, Agadir — between the city and the coast toward Taghazout. One
            bedroom, two guests. Quiet building, fibre Wi-Fi.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/stay" className="rounded-gi bg-ink px-5 py-3 text-sm text-bone">
              See the listing
            </Link>
            <Link href="/contact" className="rounded-gi border border-mist px-5 py-3 text-sm">
              Contact
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

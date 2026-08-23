import { currentGuest } from "@/lib/guest-auth";
import { LISTING } from "@/lib/listing";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact",
  description: "WhatsApp Hamza for the Hay Mohammadi apartment — the same number as on Airbnb.",
};

export default async function ContactPage() {
  const guest = await currentGuest();
  const message = encodeURIComponent(
    "Hello Hamza, I have a question about the GreatImmob apartment in Hay Mohammadi.",
  );

  return (
    <div className="min-h-screen bg-bone">
      <SiteHeader guestName={guest?.name} />
      <main className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-[11px] uppercase tracking-brand text-champagne">Contact</p>
        <h1 className="mt-3 font-display text-5xl">One number. Hamza.</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/75">
          Guests, owners, and check-in questions all go through the same WhatsApp. There is no
          second public face and no call centre.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="border border-mist bg-white p-8">
            <p className="text-[11px] uppercase tracking-wide text-champagne">WhatsApp</p>
            <p className="mt-3 font-display text-3xl">{LISTING.whatsappDisplay}</p>
            <p className="mt-2 text-sm text-ink/60">Hamza Bounaga · Agadir</p>
            <a
              href={`https://wa.me/${LISTING.whatsapp}?text=${message}`}
              className="mt-8 inline-block rounded-gi bg-champagne px-5 py-3 text-sm font-medium text-ink"
            >
              Open WhatsApp
            </a>
          </div>
          <div className="border border-mist bg-white p-8">
            <p className="text-[11px] uppercase tracking-wide text-champagne">The apartment</p>
            <p className="mt-3 font-display text-2xl leading-snug">{LISTING.addressLine}</p>
            <p className="mt-4 text-sm leading-relaxed text-ink/70">
              Exact arrival details (door, Wi-Fi) are sent after booking and check-in — not
              published on this page.
            </p>
            <a href="/stay" className="mt-8 inline-block text-sm text-champagne underline decoration-champagne/40">
              See availability →
            </a>
          </div>
        </div>

        <div className="mt-10 border border-mist bg-ink p-8 text-bone">
          <p className="text-[11px] uppercase tracking-wide text-champagne">Owners</p>
          <p className="mt-3 max-w-xl font-display text-3xl leading-tight">
            If you have a furnished apartment on the Agadir coast, that conversation lives on
            greatimmob.ma.
          </p>
          <a
            href="https://greatimmob.ma"
            className="mt-6 inline-block text-sm text-champagne underline decoration-champagne/40"
          >
            greatimmob.ma
          </a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

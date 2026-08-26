import { currentGuest } from "@/lib/guest-auth";
import { getSiteLocale } from "@/lib/get-site-locale";
import { LISTING } from "@/lib/listing";
import { siteCopy } from "@/lib/site-copy";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const copy = siteCopy(await getSiteLocale());
  return { title: copy.meta.help, description: copy.meta.helpDesc };
}

export default async function HelpPage() {
  const guest = await currentGuest();
  const copy = siteCopy(await getSiteLocale());
  const message = encodeURIComponent(copy.help.waMessage);

  return (
    <div className="min-h-screen bg-bone">
      <SiteHeader guestName={guest?.name} />
      <main className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-[11px] uppercase tracking-brand text-champagne">{copy.help.eyebrow}</p>
        <h1 className="mt-3 font-display text-5xl">{copy.help.title}</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/75">{copy.help.lead}</p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-mist bg-white p-8">
            <p className="text-[11px] uppercase tracking-wide text-champagne">{copy.help.whatsapp}</p>
            <p className="mt-3 font-display text-3xl" dir="ltr">
              {LISTING.whatsappDisplay}
            </p>
            <p className="mt-2 text-sm text-ink/60">{copy.help.cities}</p>
            <a
              href={`https://wa.me/${LISTING.whatsapp}?text=${message}`}
              className="mt-8 inline-block rounded-full bg-champagne px-5 py-3 text-sm font-semibold text-ink"
            >
              {copy.help.openWa}
            </a>
          </div>
          <div className="rounded-2xl border border-mist bg-white p-8">
            <p className="text-[11px] uppercase tracking-wide text-champagne">{copy.help.before}</p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink/70">
              {copy.help.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <a href="/stay" className="mt-8 inline-block text-sm text-champagne underline decoration-champagne/40">
              {copy.help.openStay}
            </a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

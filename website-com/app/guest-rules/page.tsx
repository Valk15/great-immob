import Link from "next/link";
import { currentGuest } from "@/lib/guest-auth";
import { HOUSE_RULES } from "@/lib/brand";
import { getSiteLocale } from "@/lib/get-site-locale";
import { siteCopy } from "@/lib/site-copy";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const copy = siteCopy(await getSiteLocale());
  return { title: copy.meta.rules, description: copy.meta.rulesDesc };
}

export default async function GuestRulesPage() {
  const guest = await currentGuest();
  const copy = siteCopy(await getSiteLocale());

  return (
    <div className="min-h-screen bg-bone">
      <SiteHeader guestName={guest?.name} />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-[11px] uppercase tracking-brand text-champagne">{copy.rules.eyebrow}</p>
        <h1 className="mt-3 font-display text-5xl leading-tight">{copy.rules.title}</h1>
        <p className="mt-5 text-base leading-relaxed text-ink/75">{copy.rules.disclaimer}</p>

        {copy.rules.sections.map((section) => (
          <section key={section.id} id={section.id} className="mt-14">
            <h2 className="font-display text-3xl">{section.title}</h2>
            {section.body.map((p) => (
              <p key={p} className="mt-4 text-sm leading-relaxed text-ink/75">
                {p}
              </p>
            ))}
          </section>
        ))}

        <section className="mt-14">
          <h2 className="font-display text-3xl">{copy.rules.houseRulesTitle}</h2>
          <p className="mt-2 text-sm text-ink/55">{copy.rules.houseRulesLead}</p>
          <ol className="mt-4 list-decimal space-y-2 ps-5 text-sm leading-relaxed text-ink/80" dir="ltr" lang="fr">
            {HOUSE_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-3xl">{copy.rules.sourcesTitle}</h2>
          <ul className="mt-4 space-y-4">
            {copy.rules.sources.map((source) => (
              <li key={source.name} className="rounded-2xl border border-mist bg-white p-5">
                <p className="font-medium">{source.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink/65">{source.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/stays" className="rounded-full bg-ink px-6 py-3 text-sm text-bone">
            {copy.rules.searchStays}
          </Link>
          <Link href="/how-it-works" className="rounded-full border border-mist px-6 py-3 text-sm">
            {copy.rules.howBooking}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

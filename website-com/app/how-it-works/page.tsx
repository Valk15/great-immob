import Link from "next/link";
import { currentGuest } from "@/lib/guest-auth";
import { getSiteLocale } from "@/lib/get-site-locale";
import { LISTING } from "@/lib/listing";
import { siteCopy } from "@/lib/site-copy";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const copy = siteCopy(await getSiteLocale());
  return { title: copy.meta.how, description: copy.meta.howDesc };
}

export default async function HowItWorksPage() {
  const guest = await currentGuest();
  const copy = siteCopy(await getSiteLocale());

  return (
    <div className="min-h-screen bg-bone">
      <SiteHeader guestName={guest?.name} />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-[11px] uppercase tracking-brand text-champagne">{copy.how.eyebrow}</p>
        <h1 className="mt-3 font-display text-5xl leading-tight">{copy.how.title}</h1>
        <p className="mt-4 text-base leading-relaxed text-ink/75">{copy.how.lead(LISTING.whatsappDisplay)}</p>
        <ol className="mt-12 space-y-8">
          {copy.how.steps.map((step) => (
            <li key={step.n} className="grid grid-cols-[3.5rem_1fr] gap-4">
              <span className="text-sm text-champagne">{step.n}</span>
              <div>
                <h2 className="font-display text-2xl">{step.t}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{step.d}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/stays" className="rounded-full bg-ink px-6 py-3 text-sm text-bone">
            {copy.how.searchStays}
          </Link>
          <Link href="/guest-rules" className="rounded-full border border-mist px-6 py-3 text-sm">
            {copy.how.guestRules}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

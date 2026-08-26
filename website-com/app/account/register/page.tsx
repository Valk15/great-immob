import Link from "next/link";
import { redirect } from "next/navigation";
import { currentGuest } from "@/lib/guest-auth";
import { getSiteLocale } from "@/lib/get-site-locale";
import { siteCopy } from "@/lib/site-copy";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await currentGuest()) redirect("/account");
  const copy = siteCopy(await getSiteLocale());
  const q = await searchParams;
  const next = q.next && q.next.startsWith("/") ? q.next : "/account";

  return (
    <div className="min-h-screen bg-bone">
      <SiteHeader />
      <main className="mx-auto max-w-md px-5 py-16">
        <p className="text-[11px] uppercase tracking-brand text-champagne">{copy.auth.eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl">{copy.auth.createTitle}</h1>
        <form action="/api/auth/guest/register" method="post" className="mt-8 space-y-4">
          <input type="hidden" name="next" value={next} />
          <label className="block text-xs uppercase tracking-wide text-champagne">{copy.auth.fullName}</label>
          <input name="name" required className="w-full border border-mist px-3 py-3" />
          <label className="block text-xs uppercase tracking-wide text-champagne">{copy.auth.email}</label>
          <input name="email" type="email" required className="w-full border border-mist px-3 py-3" />
          <label className="block text-xs uppercase tracking-wide text-champagne">{copy.auth.phone}</label>
          <input name="phone" required className="w-full border border-mist px-3 py-3" />
          <label className="block text-xs uppercase tracking-wide text-champagne">{copy.auth.passwordHint}</label>
          <input name="password" type="password" minLength={8} required className="w-full border border-mist px-3 py-3" />
          <button type="submit" className="w-full rounded-gi bg-ink py-3 text-sm text-bone">
            {copy.auth.createTitle}
          </button>
        </form>
        <p className="mt-6 text-sm text-ink/60">
          {copy.auth.haveOne}{" "}
          <Link className="underline decoration-champagne" href={`/account/login?next=${encodeURIComponent(next)}`}>
            {copy.auth.logIn}
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

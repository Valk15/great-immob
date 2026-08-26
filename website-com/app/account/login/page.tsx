import Link from "next/link";
import { redirect } from "next/navigation";
import { currentGuest } from "@/lib/guest-auth";
import { getSiteLocale } from "@/lib/get-site-locale";
import { siteCopy } from "@/lib/site-copy";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

export default async function GuestLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
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
        <h1 className="mt-2 font-display text-4xl">{copy.auth.logIn}</h1>
        {q.error ? (
          <p className="mt-4 border border-champagne/40 bg-white px-3 py-2 text-sm">{copy.auth.wrong}</p>
        ) : null}
        <form action="/api/auth/guest/login" method="post" className="mt-8 space-y-4">
          <input type="hidden" name="next" value={next} />
          <label className="block text-xs uppercase tracking-wide text-champagne">{copy.auth.email}</label>
          <input name="email" type="email" required className="w-full border border-mist px-3 py-3" />
          <label className="block text-xs uppercase tracking-wide text-champagne">{copy.auth.password}</label>
          <input name="password" type="password" required className="w-full border border-mist px-3 py-3" />
          <button type="submit" className="w-full rounded-gi bg-ink py-3 text-sm text-bone">
            {copy.auth.continue}
          </button>
        </form>
        <p className="mt-6 text-sm text-ink/60">
          {copy.auth.newHere}{" "}
          <Link className="underline decoration-champagne" href={`/account/register?next=${encodeURIComponent(next)}`}>
            {copy.auth.createAccount}
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

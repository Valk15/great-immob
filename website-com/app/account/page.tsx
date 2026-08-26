import Link from "next/link";
import { redirect } from "next/navigation";
import { bookingsForGuest } from "@/lib/bookings";
import { currentGuest } from "@/lib/guest-auth";
import { getSiteLocale } from "@/lib/get-site-locale";
import { siteCopy } from "@/lib/site-copy";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ requested?: string }>;
}) {
  const guest = await currentGuest();
  if (!guest) redirect("/account/login?next=/account");
  const copy = siteCopy(await getSiteLocale());
  const q = await searchParams;
  const bookings = await bookingsForGuest(guest.id);

  return (
    <div className="min-h-screen bg-bone">
      <SiteHeader guestName={guest.name} />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <p className="text-[11px] uppercase tracking-brand text-champagne">{copy.account.eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl">{copy.account.hello(guest.name)}</h1>
        <p className="mt-2 text-sm text-ink/60">{guest.email}</p>
        {q.requested ? (
          <p className="mt-6 border border-champagne/40 bg-white px-4 py-3 text-sm">{copy.account.requested}</p>
        ) : null}

        <div className="mt-10 divide-y divide-mist border border-mist bg-white">
          {bookings.length === 0 ? (
            <p className="px-5 py-8 text-sm text-ink/60">
              {copy.account.empty}{" "}
              <Link href="/stay" className="underline decoration-champagne">
                {copy.account.seeApartment}
              </Link>
              .
            </p>
          ) : (
            bookings.map((b) => (
              <div key={b.id} className="px-5 py-4">
                <p className="font-medium">
                  {b.checkIn} → {b.checkOut}
                </p>
                <p className="text-sm text-ink/60">
                  {copy.account.line(
                    b.nights,
                    b.guests,
                    b.totalMad,
                    copy.account.status[b.status] ?? b.status,
                  )}
                </p>
                {b.status === "confirmed" && b.stayToken ? (
                  <Link href={`/c/${b.stayToken}`} className="mt-2 inline-block text-sm text-champagne">
                    {copy.account.openCheckin}
                  </Link>
                ) : null}
              </div>
            ))
          )}
        </div>

        <form action="/api/auth/guest/logout" method="post" className="mt-8">
          <button type="submit" className="text-sm text-ink/50">
            {copy.account.logOut}
          </button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}

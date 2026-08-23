import Link from "next/link";
import { BrandLockup, Eyebrow } from "@/components/BrandMark";
import { OperatorSignatureForm } from "@/components/OperatorSignatureForm";
import { PROPERTIES } from "@/lib/brand";
import { DeleteStayButton } from "@/components/DeleteStayButton";
import { hasOperatorSignature, listStays } from "@/lib/store";
import { appOrigin, guestUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = {
  awaiting_guest: "Lien envoyé",
  guest_completed: "Check-in reçu",
  countersigned: "Contrat signé",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sig?: string; deleted?: string }>;
}) {
  const q = await searchParams;
  const stays = listStays();
  const origin = await appOrigin();
  const hasSig = hasOperatorSignature();

  return (
    <main className="min-h-screen bg-bone">
      <header className="border-b border-mist bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-5">
          <BrandLockup href="/dashboard" />
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="text-xs uppercase tracking-wide text-champagne">
              Déconnexion
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <Eyebrow>Nouveau séjour</Eyebrow>
          <h1 className="mt-2 font-display text-4xl">Créer un lien check-in</h1>
          <p className="mt-2 text-sm text-ink/70">
            Envoyez l&apos;URL au voyageur (Airbnb ou WhatsApp). Il lit le contrat, envoie sa pièce
            et signe à la main.
          </p>

          <form action="/api/stays" method="post" className="mt-8 space-y-4 border border-mist bg-white p-6">
            <label className="block text-xs uppercase tracking-wide text-champagne">Appartement</label>
            <select name="propertyId" className="w-full rounded-gi border border-mist px-3 py-3">
              {PROPERTIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs uppercase tracking-wide text-champagne">Arrivée</label>
                <input type="date" name="checkIn" required className="mt-1 w-full border border-mist px-3 py-3" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-champagne">Départ</label>
                <input type="date" name="checkOut" required className="mt-1 w-full border border-mist px-3 py-3" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs uppercase tracking-wide text-champagne">Personnes</label>
                <input
                  type="number"
                  name="guestCount"
                  min={1}
                  defaultValue={2}
                  className="mt-1 w-full border border-mist px-3 py-3"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-champagne">Canal</label>
                <select name="channel" className="mt-1 w-full border border-mist px-3 py-3">
                  <option value="airbnb">Airbnb</option>
                  <option value="classique">Classique</option>
                </select>
              </div>
            </div>
            <button type="submit" className="rounded-gi bg-ink px-5 py-3 text-sm text-bone">
              Générer le lien
            </button>
          </form>
        </section>

        <aside className="space-y-8">
          <div className="border border-mist bg-white p-6">
            <Eyebrow>Votre signature</Eyebrow>
            <h2 className="mt-2 font-display text-2xl">Bailleur</h2>
            {q.sig ? <p className="mt-2 text-sm text-success">Signature enregistrée.</p> : null}
            <div className="mt-4">
              <OperatorSignatureForm hasSig={hasSig} />
            </div>
          </div>
        </aside>
      </div>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <Eyebrow>Dossiers</Eyebrow>
        <h2 className="mt-2 font-display text-3xl">Séjours</h2>
        {q.deleted ? (
          <p className="mt-3 border border-champagne/50 bg-white px-4 py-3 text-sm">
            Séjour supprimé, y compris les pièces d&apos;identité et les PDF.
          </p>
        ) : null}
        <div className="mt-6 divide-y divide-mist border border-mist bg-white">
          {stays.length === 0 ? (
            <p className="px-5 py-8 text-sm text-ink/60">Aucun séjour pour l&apos;instant.</p>
          ) : (
            stays.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-bone"
              >
                <Link href={`/dashboard/stays/${s.id}`} className="min-w-0 flex-1">
                  <p className="font-medium">
                    {s.guest ? `${s.guest.prenom} ${s.guest.nom}` : "En attente du voyageur"}
                  </p>
                  <p className="text-xs text-ink/60">
                    {s.checkIn} → {s.checkOut} · {s.propertyAddress}
                  </p>
                </Link>
                <div className="flex items-center gap-4">
                  <span className="text-xs uppercase tracking-wide text-champagne">{labels[s.status]}</span>
                  <DeleteStayButton stayId={s.id} compact />
                </div>
              </div>
            ))
          )}
        </div>
        {stays[0] ? (
          <p className="mt-4 hidden text-xs text-ink/40">{guestUrl(origin, stays[0].token)}</p>
        ) : null}
      </section>
    </main>
  );
}

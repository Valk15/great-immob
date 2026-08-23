import { notFound } from "next/navigation";
import { BrandLockup, Eyebrow } from "@/components/BrandMark";
import { CopyLink } from "@/components/CopyLink";
import { DeleteStayButton } from "@/components/DeleteStayButton";
import { getStay } from "@/lib/store";
import { appOrigin, guestUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = {
  awaiting_guest: "En attente du voyageur",
  guest_completed: "Check-in reçu",
  countersigned: "Contrat signé — prêt à imprimer",
};

export default async function StayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const q = await searchParams;
  const stay = getStay(id);
  if (!stay) notFound();
  const origin = await appOrigin();
  const url = guestUrl(origin, stay.token);

  return (
    <main className="min-h-screen bg-bone">
      <header className="border-b border-mist bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-5">
          <BrandLockup href="/dashboard" />
          <a href="/dashboard" className="text-xs uppercase tracking-wide text-champagne">
            Tous les séjours
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <Eyebrow>{labels[stay.status]}</Eyebrow>
        <h1 className="mt-2 font-display text-4xl">
          {stay.guest ? `${stay.guest.prenom} ${stay.guest.nom}` : "Lien voyageur"}
        </h1>
        <p className="mt-2 text-sm text-ink/70">
          {stay.propertyAddress}
          <br />
          {stay.checkIn} → {stay.checkOut} · {stay.guestCount} pers. ·{" "}
          {stay.channel === "airbnb" ? "Airbnb" : "Classique"}
        </p>

        {q.created ? (
          <p className="mt-4 border border-champagne/50 bg-white px-4 py-3 text-sm">
            Lien créé. Envoyez-le maintenant au voyageur.
          </p>
        ) : null}

        <div className="mt-8 border border-mist bg-white p-6">
          <h2 className="font-display text-2xl">URL à envoyer</h2>
          <p className="mt-1 text-sm text-ink/60">Airbnb message ou WhatsApp. Lien unique, non devinable.</p>
          <div className="mt-4">
            <CopyLink url={url} />
          </div>
        </div>

        {stay.guest ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="border border-mist bg-white p-6">
              <h2 className="font-display text-2xl">Identité</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <Row k="CIN / Passeport" v={stay.guest.cin} />
                <Row k="Nationalité" v={stay.guest.nationalite} />
                <Row k="Genre" v={stay.guest.genre === "femme" ? "Femme" : "Homme"} />
                <Row k="Téléphone" v={stay.guest.telephone} />
                <Row k="E-mail" v={stay.guest.email || "—"} />
              </dl>
              {stay.cohabitants.length ? (
                <div className="mt-4 text-sm">
                  <p className="uppercase tracking-wide text-champagne">Cohabitants</p>
                  {stay.cohabitants.map((c, i) => (
                    <p key={i}>
                      {c.prenom} {c.nom} · {c.cin}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="border border-mist bg-white p-6">
              <h2 className="font-display text-2xl">Pièce d&apos;identité</h2>
              <div className="mt-4 space-y-4">
                {stay.files.idRecto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/files/${stay.id}/${stay.files.idRecto}`}
                    alt="Recto pièce d'identité"
                    className="max-h-64 w-full object-contain border border-mist"
                  />
                ) : null}
                {stay.files.idVerso ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/files/${stay.id}/${stay.files.idVerso}`}
                    alt="Verso pièce d'identité"
                    className="max-h-64 w-full object-contain border border-mist"
                  />
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {stay.guest ? (
          <div className="mt-8 border border-mist bg-white p-6">
            <h2 className="font-display text-2xl">Votre dossier (opérateur)</h2>
            <p className="mt-2 text-sm text-ink/70">
              Un seul PDF en français : page 1 contrat signé, page 2 fiche de police, pages
              suivantes pièce d&apos;identité. Le voyageur télécharge le contrat dans sa langue
              (allemand, anglais, arabe ou français).
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {stay.files.dossierPdf ? (
                <>
                  <a
                    href={`/api/files/${stay.id}/${stay.files.dossierPdf}`}
                    target="_blank"
                    className="rounded-gi bg-ink px-5 py-3 text-sm text-bone"
                  >
                    Ouvrir / imprimer le dossier complet
                  </a>
                  <a
                    href={`/api/files/${stay.id}/${stay.files.dossierPdf}`}
                    download
                    className="rounded-gi border border-ink px-5 py-3 text-sm"
                  >
                    Télécharger le PDF
                  </a>
                </>
              ) : (
                <p className="text-sm text-champagne">Le dossier complet arrive après le check-in.</p>
              )}
            </div>
          </div>
        ) : null}

        <div className="mt-10 border border-mist bg-white p-6">
          <h2 className="font-display text-2xl">Supprimer</h2>
          <p className="mt-2 text-sm text-ink/70">
            Efface le séjour, le lien voyageur, le contrat, la fiche de police et les photos
            d&apos;identité. Irréversible.
          </p>
          <div className="mt-4">
            <DeleteStayButton stayId={stay.id} />
          </div>
        </div>
      </div>
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-mist py-1">
      <dt className="text-ink/50">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

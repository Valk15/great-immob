import { after, NextResponse } from "next/server";
import { formatPhone } from "@/lib/countries";
import { dataUrlToBuffer, extFromType, rebuildDocuments, writeStayFile } from "@/lib/documents";
import { guestCopy, nationalityForLocale, parseLocale } from "@/lib/i18n";
import { getStayByToken, hasOperatorSignature, saveStay } from "@/lib/store";
import type { Cohabitant, GuestGender, Stay } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

function stayPayload(stay: Stay, token: string) {
  const submitted = Boolean(stay.guest?.submittedAt || stay.files.guestSignature);
  return {
    ok: true,
    status: stay.status,
    submitted,
    contractUrl: `/api/checkin/${token}/contrat`,
    signedBoth: stay.status === "countersigned",
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const stay = await getStayByToken(token);
  if (!stay) {
    return NextResponse.json({ error: guestCopy("fr").errors.invalid }, { status: 404 });
  }
  return NextResponse.json(stayPayload(stay, token));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const stay = await getStayByToken(token);
  if (!stay) {
    return NextResponse.json({ error: guestCopy("fr").errors.invalid }, { status: 404 });
  }

  const form = await request.formData();
  const locale = parseLocale(form.get("locale") || stay.guest?.locale);
  const t = guestCopy(locale).errors;

  if (stay.guest && (stay.files.guestSignature || stay.files.contractPdf)) {
    return NextResponse.json(stayPayload(stay, token));
  }
  if (stay.status === "countersigned") {
    return NextResponse.json({ error: t.closed }, { status: 400 });
  }

  const nom = String(form.get("nom") || "").trim();
  const prenom = String(form.get("prenom") || "").trim();
  const cin = String(form.get("cin") || "").trim();
  const genre = String(form.get("genre") || "") as GuestGender;
  const nationalite = nationalityForLocale(String(form.get("nationalite") || ""), locale);
  const telephone = formatPhone(
    String(form.get("phoneCode") || "212"),
    String(form.get("phoneLocal") || ""),
  );
  const email = String(form.get("email") || "").trim();
  const accepted = String(form.get("acceptedRules") || "") === "on";
  const signature = String(form.get("signature") || "");

  if (!nom || !prenom || !cin || !nationalite || !telephone) {
    return NextResponse.json({ error: t.identity }, { status: 400 });
  }
  if (genre !== "homme" && genre !== "femme") {
    return NextResponse.json({ error: t.gender }, { status: 400 });
  }
  if (!accepted) {
    return NextResponse.json({ error: t.rules }, { status: 400 });
  }
  if (!signature.startsWith("data:image/png")) {
    return NextResponse.json({ error: t.signature }, { status: 400 });
  }

  const idRecto = form.get("idRecto");
  if (!(idRecto instanceof File) || idRecto.size < 80) {
    return NextResponse.json({ error: t.idRecto }, { status: 400 });
  }
  if (idRecto.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: t.tooHeavy }, { status: 400 });
  }

  const cohabitants: Cohabitant[] = [];
  for (let i = 0; i < 6; i++) {
    const cNom = String(form.get(`co_nom_${i}`) || "").trim();
    const cPrenom = String(form.get(`co_prenom_${i}`) || "").trim();
    if (!cNom && !cPrenom) continue;
    cohabitants.push({
      nom: cNom,
      prenom: cPrenom,
      cin: String(form.get(`co_cin_${i}`) || "").trim(),
      nationalite: nationalityForLocale(String(form.get(`co_nationalite_${i}`) || ""), locale),
      telephone: formatPhone(
        String(form.get(`co_code_${i}`) || "212"),
        String(form.get(`co_local_${i}`) || form.get(`co_telephone_${i}`) || ""),
      ),
    });
  }

  const rectoExt = extFromType(idRecto.type, "jpg");
  stay.files.idRecto = await writeStayFile(
    stay.id,
    `id-recto.${rectoExt}`,
    Buffer.from(await idRecto.arrayBuffer()),
  );

  const idVerso = form.get("idVerso");
  if (idVerso instanceof File && idVerso.size > 80) {
    if (idVerso.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: t.versoHeavy }, { status: 400 });
    }
    const versoExt = extFromType(idVerso.type, "jpg");
    stay.files.idVerso = await writeStayFile(
      stay.id,
      `id-verso.${versoExt}`,
      Buffer.from(await idVerso.arrayBuffer()),
    );
  }

  stay.files.guestSignature = await writeStayFile(
    stay.id,
    "signature-locataire.png",
    dataUrlToBuffer(signature),
  );
  stay.guest = {
    nom,
    prenom,
    cin,
    genre,
    nationalite,
    telephone,
    email,
    locale,
    acceptedRulesAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
  };
  stay.cohabitants = cohabitants;
  if (await hasOperatorSignature()) {
    stay.status = "countersigned";
    stay.countersignedAt = new Date().toISOString();
  } else {
    stay.status = "guest_completed";
  }
  await saveStay(stay);
  const forPdf: Stay = JSON.parse(JSON.stringify(stay)) as Stay;
  after(async () => {
    try {
      await rebuildDocuments(forPdf);
    } catch (err) {
      console.error(err);
    }
  });

  return NextResponse.json(stayPayload(stay, token));
}

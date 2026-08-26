import { buildContractPdf, buildFichePdf, buildOperatorDossierPdf } from "./pdf";
import { parseLocale } from "./i18n";
import { publicFileName, readUpload, saveStay, writeUpload } from "./store";
import type { Stay } from "./types";

export async function writeStayFile(stayId: string, name: string, buf: Buffer) {
  await writeUpload(stayId, name, buf);
  return name;
}

export async function readStayFile(stay: Stay, kind: keyof Stay["files"]) {
  const name = stay.files[kind];
  if (!name) return null;
  return readUpload(stay.id, name);
}

export async function rebuildDocuments(stay: Stay) {
  const guestSig = await readStayFile(stay, "guestSignature");
  const guestLocale = parseLocale(stay.guest?.locale);
  const guestContract = await buildContractPdf(stay, guestSig, guestLocale);
  const operatorContract = await buildContractPdf(stay, guestSig, "fr");
  const fiche = await buildFichePdf(stay);
  stay.files.contractPdf = await writeStayFile(
    stay.id,
    publicFileName("contrat", "pdf"),
    Buffer.from(guestContract),
  );
  stay.files.fichePdf = await writeStayFile(
    stay.id,
    publicFileName("fiche-police", "pdf"),
    Buffer.from(fiche),
  );

  const ids: { label: string; buf: Buffer }[] = [];
  const recto = await readStayFile(stay, "idRecto");
  if (recto) ids.push({ label: "Recto", buf: recto });
  const verso = await readStayFile(stay, "idVerso");
  if (verso) ids.push({ label: "Verso", buf: verso });

  const dossier = await buildOperatorDossierPdf(stay, operatorContract, fiche, ids);
  stay.files.dossierPdf = await writeStayFile(
    stay.id,
    publicFileName("dossier-operateur", "pdf"),
    Buffer.from(dossier),
  );
  await saveStay(stay);
  return stay;
}

export function extFromType(type: string, fallback: string) {
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  if (type.includes("jpeg") || type.includes("jpg")) return "jpg";
  return fallback;
}

export function dataUrlToBuffer(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error("Signature invalide");
  return Buffer.from(match[2], "base64");
}

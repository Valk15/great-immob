import { PDFDocument, PDFFont, PDFPage, RGB, StandardFonts, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { LANDLORD } from "./brand";
import { arabicForPdf, hasArabic } from "./arabic";
import { guestCopy, parseLocale } from "./i18n";
import type { Stay } from "./types";
import { readOperatorSignature } from "./store";

const INK = rgb(0.043, 0.11, 0.173);
const CHAMPAGNE = rgb(0.769, 0.647, 0.455);
const MUTED = rgb(0.35, 0.38, 0.4);
const BONE = rgb(0.969, 0.957, 0.937);

function latinSafe(text: string) {
  return String(text ?? "")
    .replaceAll("☑", "[X]")
    .replaceAll("☒", "[X]")
    .replaceAll("☐", "[ ]")
    .replaceAll("□", "[ ]")
    .replaceAll("•", "-")
    .replaceAll("●", "-")
    .replaceAll("·", "-")
    .replaceAll("–", "-")
    .replaceAll("—", "-")
    .replaceAll("’", "'")
    .replaceAll("‘", "'")
    .replaceAll("“", '"')
    .replaceAll("”", '"')
    .replace(/[^\u0000-\u00ff]/g, "?");
}

function prepare(text: string, arabic: boolean) {
  const raw = String(text ?? "");
  if (arabic && hasArabic(raw)) return arabicForPdf(raw);
  return latinSafe(raw);
}

function write(
  page: PDFPage,
  raw: string,
  opts: Parameters<PDFPage["drawText"]>[1],
  arabic = false,
) {
  page.drawText(prepare(raw, arabic), opts);
}

function textWidth(font: PDFFont, raw: string, size: number, arabic: boolean) {
  return font.widthOfTextAtSize(prepare(raw, arabic), size);
}

function fmtDate(iso: string) {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function wrap(
  text: string,
  font: { widthOfTextAtSize: (t: string, s: number) => number },
  size: number,
  max: number,
  arabic = false,
) {
  const logical = String(text ?? "");
  const words = logical.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(prepare(next, arabic), size) <= max) line = next;
    else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function hairline(page: PDFPage, x1: number, x2: number, y: number, color: RGB = CHAMPAGNE) {
  page.drawLine({
    start: { x: x1, y },
    end: { x: x2, y },
    thickness: 0.6,
    color,
  });
}

async function embedArabicFont(pdf: PDFDocument) {
  const file = path.join(process.cwd(), "public", "fonts", "NotoNaskhArabic-Regular.ttf");
  if (!existsSync(file)) return null;
  pdf.registerFontkit(fontkit);
  return pdf.embedFont(readFileSync(file), { subset: true });
}

async function embedLogo(pdf: PDFDocument) {
  const file = path.join(process.cwd(), "public", "brand", "lockup.png");
  if (!existsSync(file)) return null;
  return pdf.embedPng(readFileSync(file));
}

async function embedPngMaybe(pdf: PDFDocument, buf: Buffer | null) {
  if (!buf || buf.length < 20) return null;
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8;
  const isPng = buf[0] === 0x89 && buf[1] === 0x50;
  try {
    if (isJpeg) return await pdf.embedJpg(buf);
    if (isPng) return await pdf.embedPng(buf);
    try {
      return await pdf.embedPng(buf);
    } catch {
      return await pdf.embedJpg(buf);
    }
  } catch {
    return null;
  }
}

export async function buildContractPdf(
  stay: Stay,
  guestSignature: Buffer | null,
  localeRaw?: string,
) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const sansBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logo = await embedLogo(pdf);
  const locale = parseLocale(localeRaw ?? stay.guest?.locale);
  const copy = guestCopy(locale);
  const ar = locale === "ar";
  const arabicFont = ar ? await embedArabicFont(pdf) : null;
  const body = arabicFont || sans;
  const bodyBold = arabicFont || sansBold;
  const titleFont = arabicFont || serifBold;

  const left = 42;
  const right = 553;
  const width = right - left;
  let y = 800;

  page.drawRectangle({ x: 0, y: 0, width: 595.28, height: 841.89, color: BONE });

  if (logo) {
    const h = 38;
    const w = (logo.width / logo.height) * h;
    page.drawImage(logo, { x: left, y: y - h + 8, width: w, height: h });
  }

  page.drawText("GREATIMMOB · GESTION LOCATIVE", {
    x: right - sans.widthOfTextAtSize("GREATIMMOB · GESTION LOCATIVE", 7),
    y: y,
    size: 7,
    font: sans,
    color: CHAMPAGNE,
  });

  y -= 48;
  const title = copy.contract.title;
  write(page, title, {
    x: left + (width - textWidth(titleFont, title, 16, ar)) / 2,
    y,
    size: 16,
    font: titleFont,
    color: INK,
  }, ar);
  y -= 16;
  const sub = copy.contract.subtitle;
  write(page, sub, {
    x: left + (width - textWidth(body, sub, 8, ar)) / 2,
    y,
    size: 8,
    font: body,
    color: CHAMPAGNE,
  }, ar);

  y -= 18;
  hairline(page, left, right, y);
  y -= 16;

  const signed = stay.guest?.submittedAt?.slice(0, 10) || stay.createdAt.slice(0, 10);
  const dateLine = `${copy.contract.date} : ${fmtDate(signed)}`;
  const placeLine = `${copy.contract.place} : ${copy.contract.city}`;
  write(page, dateLine, { x: left, y, size: 9, font: body, color: INK }, ar);
  write(page, placeLine, {
    x: right - textWidth(body, placeLine, 9, ar),
    y,
    size: 9,
    font: body,
    color: INK,
  }, ar);

  y -= 22;
  write(page, copy.contract.section1, { x: left, y, size: 8, font: bodyBold, color: INK }, ar);
  y -= 8;
  hairline(page, left, right, y, INK);
  y -= 16;

  const col = (width - 16) / 2;
  const rowsLeft = [
    [copy.contract.lastName, LANDLORD.nom],
    [copy.contract.firstName, LANDLORD.prenom],
    [copy.contract.cin, LANDLORD.cin],
    [copy.contract.nationality, copy.contract.landlordNationality],
    [copy.contract.address, LANDLORD.adresse],
    [copy.contract.phone, LANDLORD.telephone],
  ];
  const g = stay.guest;
  const genre =
    g?.genre === "femme" ? copy.contract.female : g?.genre === "homme" ? copy.contract.male : copy.contract.none;
  const rowsRight = [
    [copy.contract.lastName, g?.nom || copy.contract.none],
    [copy.contract.firstName, g?.prenom || copy.contract.none],
    [copy.contract.cin, g?.cin || copy.contract.none],
    [copy.contract.gender, genre],
    [copy.contract.nationality, g?.nationalite || copy.contract.none],
    [copy.contract.phone, g?.telephone || copy.contract.none],
  ];

  const startY = y;
  let yl = startY;
  for (const [k, v] of rowsLeft) {
    write(page, `${k} :`, { x: left, y: yl, size: 8, font: body, color: MUTED }, ar);
    write(page, String(v), { x: left + 92, y: yl, size: 8, font: sansBold, color: INK }, ar);
    yl -= 13;
  }
  let yr = startY;
  for (const [k, v] of rowsRight) {
    write(page, `${k} :`, { x: left + col + 16, y: yr, size: 8, font: body, color: MUTED }, ar);
    write(page, String(v).slice(0, 42), {
      x: left + col + 108,
      y: yr,
      size: 8,
      font: sansBold,
      color: INK,
    }, ar);
    yr -= 13;
  }
  y = Math.min(yl, yr) - 8;

  write(page, copy.contract.section2, { x: left, y, size: 8, font: bodyBold, color: INK }, ar);
  y -= 8;
  hairline(page, left, right, y, INK);
  y -= 14;

  const headers = copy.contract.headers;
  const cols = [90, 90, 110, 100, 110];
  let x = left;
  headers.forEach((h, i) => {
    write(page, h, { x, y, size: 7, font: bodyBold, color: CHAMPAGNE }, ar);
    x += cols[i];
  });
  y -= 12;
  const mates = stay.cohabitants.filter((c) => c.nom || c.prenom || c.cin);
  if (!mates.length) {
    write(page, copy.contract.noCohabitants, { x: left, y, size: 8, font: body, color: MUTED }, ar);
    y -= 14;
  } else {
    for (const c of mates.slice(0, 6)) {
      x = left;
      const vals = [c.nom, c.prenom, c.cin, c.nationalite, c.telephone];
      vals.forEach((val, i) => {
        write(page, String(val || "-").slice(0, 18), {
          x,
          y,
          size: 8,
          font: sans,
          color: INK,
        }, ar);
        x += cols[i];
      });
      y -= 12;
    }
  }

  y -= 6;
  write(page, copy.contract.section3, { x: left, y, size: 8, font: bodyBold, color: INK }, ar);
  y -= 8;
  hairline(page, left, right, y, INK);
  y -= 16;

  write(page, copy.contract.apartment, { x: left, y, size: 8, font: body, color: MUTED }, ar);
  write(page, stay.propertyAddress, {
    x: left + 140,
    y,
    size: 8,
    font: sansBold,
    color: INK,
  }, ar);
  y -= 14;
  write(page, copy.contract.duration(fmtDate(stay.checkIn), fmtDate(stay.checkOut)), {
    x: left,
    y,
    size: 8,
    font: body,
    color: INK,
  }, ar);
  y -= 14;
  write(page, `${copy.contract.guests}    ${stay.guestCount}`, {
    x: left,
    y,
    size: 8,
    font: body,
    color: INK,
  }, ar);
  const airbnb = stay.channel === "airbnb" ? `[X] ${copy.contract.airbnb}` : `[ ] ${copy.contract.airbnb}`;
  const classique =
    stay.channel === "classique" ? `[X] ${copy.contract.classique}` : `[ ] ${copy.contract.classique}`;
  write(page, `${copy.contract.channel}    ${airbnb}     ${classique}`, {
    x: left + 220,
    y,
    size: 8,
    font: body,
    color: INK,
  }, ar);

  y -= 22;
  write(page, copy.contract.section4, { x: left, y, size: 8, font: bodyBold, color: INK }, ar);
  y -= 8;
  hairline(page, left, right, y, INK);
  y -= 14;

  const signTop = 128;
  const ruleSize = y - signTop > 220 ? 8 : 7;
  const ruleLead = ruleSize + 2;
  for (const rule of copy.houseRules) {
    const lines = wrap(`-  ${rule}`, body, ruleSize, width, ar);
    for (const line of lines) {
      if (y < signTop + 8) break;
      write(page, line, { x: left, y, size: ruleSize, font: body, color: INK }, ar);
      y -= ruleLead;
    }
  }

  const boxW = 180;
  const boxH = 56;
  const signY = 92;
  write(page, copy.contract.landlord, { x: left + 20, y: signY + boxH + 10, size: 8, font: bodyBold, color: CHAMPAGNE }, ar);
  write(page, copy.contract.tenant, {
    x: right - 20 - boxW,
    y: signY + boxH + 10,
    size: 8,
    font: bodyBold,
    color: CHAMPAGNE,
  }, ar);

  const opSig = await embedPngMaybe(pdf, readOperatorSignature());
  const guestSig = await embedPngMaybe(pdf, guestSignature);

  hairline(page, left + 20, left + 20 + boxW, signY, MUTED);
  hairline(page, right - 20 - boxW, right - 20, signY, MUTED);

  if (opSig) {
    const scale = Math.min(boxW / opSig.width, boxH / opSig.height);
    const w = opSig.width * scale;
    const h = opSig.height * scale;
    page.drawImage(opSig, {
      x: left + 20 + (boxW - w) / 2,
      y: signY + (boxH - h) / 2,
      width: w,
      height: h,
    });
  }
  if (guestSig) {
    const scale = Math.min(boxW / guestSig.width, boxH / guestSig.height);
    const w = guestSig.width * scale;
    const h = guestSig.height * scale;
    page.drawImage(guestSig, {
      x: right - 20 - boxW + (boxW - w) / 2,
      y: signY + (boxH - h) / 2,
      width: w,
      height: h,
    });
  }

  page.drawText(`${LANDLORD.prenom} ${LANDLORD.nom}`, {
    x: left + 20,
    y: signY - 12,
    size: 8,
    font: serif,
    color: INK,
  });
  if (g) {
    write(page, `${g.prenom} ${g.nom}`, {
      x: right - 20 - boxW,
      y: signY - 12,
      size: 8,
      font: serif,
      color: INK,
    }, ar);
  }

  write(page, copy.contract.footer, {
    x: left,
    y: 28,
    size: 6.5,
    font: body,
    color: MUTED,
  }, ar);

  return pdf.save();
}
export async function buildFichePdf(stay: Stay) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const sansBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logo = await embedLogo(pdf);
  const g = stay.guest;

  page.drawRectangle({ x: 0, y: 0, width: 595.28, height: 841.89, color: BONE });
  let y = 790;
  if (logo) {
    const h = 36;
    const w = (logo.width / logo.height) * h;
    page.drawImage(logo, { x: 42, y: y - 4, width: w, height: h });
  }
  y -= 50;
  page.drawText("FICHE DE POLICE  ·  DÉCLARATION D'HÉBERGEMENT", {
    x: 42,
    y,
    size: 13,
    font: sansBold,
    color: INK,
  });
  y -= 16;
  page.drawText("Document préparé pour les autorités à partir du check-in voyageur.", {
    x: 42,
    y,
    size: 8,
    font: sans,
    color: MUTED,
  });
  y -= 28;

  const rows: [string, string][] = [
    ["Hébergeur", `${LANDLORD.prenom} ${LANDLORD.nom}`],
    ["CIN hébergeur", LANDLORD.cin],
    ["Téléphone hébergeur", LANDLORD.telephone],
    ["Adresse du logement", stay.propertyAddress],
    ["Arrivée", fmtDate(stay.checkIn)],
    ["Départ", fmtDate(stay.checkOut)],
    ["Nombre de personnes", String(stay.guestCount)],
    ["Canal", stay.channel === "airbnb" ? "Airbnb" : "Classique"],
    ["Nom du voyageur", g?.nom || "-"],
    ["Prénom", g?.prenom || "-"],
    ["Genre", g?.genre === "femme" ? "Femme" : g?.genre === "homme" ? "Homme" : "-"],
    ["Nationalité", g?.nationalite || "-"],
    ["N° CIN / Passeport", g?.cin || "-"],
    ["Téléphone voyageur", g?.telephone || "-"],
    ["E-mail", g?.email || "-"],
  ];

  for (const [k, v] of rows) {
    write(page, k, { x: 42, y, size: 9, font: sans, color: MUTED });
    write(page, v, { x: 230, y, size: 9, font: sansBold, color: INK });
    hairline(page, 42, 553, y - 6);
    y -= 22;
  }

  y -= 8;
  page.drawText("Cohabitants", { x: 42, y, size: 9, font: sansBold, color: INK });
  y -= 16;
  const mates = stay.cohabitants.filter((c) => c.nom || c.prenom);
  if (!mates.length) {
    page.drawText("Aucun.", { x: 42, y, size: 9, font: sans, color: MUTED });
  } else {
    for (const c of mates) {
      write(page,
        `${c.nom} ${c.prenom}  -  ${c.cin || "-"}  -  ${c.nationalite || "-"}  -  ${c.telephone || "-"}`,
        { x: 42, y, size: 9, font: sans, color: INK },
      );
      y -= 14;
    }
  }

  y -= 24;
  page.drawText(
    "Piece d'identite : pages suivantes du dossier operateur (recto / verso).",
    { x: 42, y, size: 8, font: sans, color: MUTED },
  );
  y -= 14;
  page.drawText(
    "GreatImmob genere cette fiche. Le depot aupres des autorites reste a la charge de l'operateur.",
    { x: 42, y, size: 8, font: sans, color: MUTED },
  );

  return pdf.save();
}

export async function buildOperatorDossierPdf(
  stay: Stay,
  contractBytes: Uint8Array,
  ficheBytes: Uint8Array,
  idPages: { label: string; buf: Buffer }[],
) {
  const out = await PDFDocument.create();
  const contract = await PDFDocument.load(contractBytes);
  const fiche = await PDFDocument.load(ficheBytes);
  const cPages = await out.copyPages(contract, contract.getPageIndices());
  cPages.forEach((p) => out.addPage(p));
  const fPages = await out.copyPages(fiche, fiche.getPageIndices());
  fPages.forEach((p) => out.addPage(p));

  const sans = await out.embedFont(StandardFonts.Helvetica);
  const sansBold = await out.embedFont(StandardFonts.HelveticaBold);
  const g = stay.guest;

  for (const item of idPages) {
    const img = await embedPngMaybe(out, item.buf);
    const page = out.addPage([595.28, 841.89]);
    page.drawRectangle({ x: 0, y: 0, width: 595.28, height: 841.89, color: BONE });
    write(page, "DOSSIER OPERATEUR  -  PIECE D'IDENTITE", {
      x: 42,
      y: 800,
      size: 8,
      font: sans,
      color: CHAMPAGNE,
    });
    write(page, item.label, {
      x: 42,
      y: 778,
      size: 14,
      font: sansBold,
      color: INK,
    });
    if (g) {
      write(page, `${g.prenom} ${g.nom}  -  ${g.cin}`, {
        x: 42,
        y: 758,
        size: 9,
        font: sans,
        color: MUTED,
      });
    }
    if (img) {
      const maxW = 510;
      const maxH = 680;
      const scale = Math.min(maxW / img.width, maxH / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      page.drawImage(img, {
        x: 42 + (maxW - w) / 2,
        y: 48 + (maxH - h) / 2,
        width: w,
        height: h,
      });
    } else {
      write(page, "Image illisible. Verifier le fichier original.", {
        x: 42,
        y: 400,
        size: 10,
        font: sans,
        color: MUTED,
      });
    }
  }

  return out.save();
}


import { readFileSync } from "fs";
import { NextResponse } from "next/server";
import { rebuildDocuments } from "@/lib/documents";
import { getStayByToken, hasOperatorSignature, resolveUpload, saveStay } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  let stay = getStayByToken(token);
  if (!stay?.guest) {
    return NextResponse.json({ error: "Contrat indisponible" }, { status: 404 });
  }

  try {
    if (hasOperatorSignature() && stay.status !== "countersigned") {
      stay.status = "countersigned";
      stay.countersignedAt = stay.countersignedAt || new Date().toISOString();
      saveStay(stay);
    }
    stay = await rebuildDocuments(stay);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Contrat indisponible" }, { status: 500 });
  }
  const file = stay.files.contractPdf;
  if (!file) return NextResponse.json({ error: "Contrat indisponible" }, { status: 404 });
  const full = resolveUpload(stay.id, file);
  if (!full) return NextResponse.json({ error: "Contrat introuvable" }, { status: 404 });

  const safeName = (stay.guest?.nom || "sejour").replace(/[^a-zA-Z0-9._-]/g, "");
  const buf = readFileSync(full);
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="contrat-greatimmob-${safeName}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}

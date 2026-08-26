import { NextResponse } from "next/server";
import { rebuildDocuments } from "@/lib/documents";
import { getStayByToken, hasOperatorSignature, readUpload, saveStay } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  let stay = await getStayByToken(token);
  if (!stay?.guest) {
    return NextResponse.json({ error: "Contrat indisponible" }, { status: 404 });
  }

  try {
    if ((await hasOperatorSignature()) && stay.status !== "countersigned") {
      stay.status = "countersigned";
      stay.countersignedAt = stay.countersignedAt || new Date().toISOString();
      await saveStay(stay);
    }
    stay = await rebuildDocuments(stay);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Contrat indisponible" }, { status: 500 });
  }
  const file = stay.files.contractPdf;
  if (!file) return NextResponse.json({ error: "Contrat indisponible" }, { status: 404 });
  const buf = await readUpload(stay.id, file);
  if (!buf) return NextResponse.json({ error: "Contrat introuvable" }, { status: 404 });

  const safeName = (stay.guest?.nom || "sejour").replace(/[^a-zA-Z0-9._-]/g, "");
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="contrat-greatimmob-${safeName}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}

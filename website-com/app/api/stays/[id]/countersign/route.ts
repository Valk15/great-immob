import { NextResponse } from "next/server";
import { requireOperatorApi } from "@/lib/auth";
import { rebuildDocuments } from "@/lib/documents";
import { getStay, hasOperatorSignature } from "@/lib/store";
import { relativeRedirect } from "@/lib/url";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireOperatorApi();
  if (denied) return denied;
  const { id } = await params;
  const stay = await getStay(id);
  if (!stay) return NextResponse.json({ error: "Séjour introuvable" }, { status: 404 });
  if (stay.status === "awaiting_guest") {
    return NextResponse.json({ error: "Le voyageur n'a pas encore signé." }, { status: 400 });
  }
  if (!(await hasOperatorSignature())) {
    return NextResponse.json(
      { error: "Uploadez d'abord votre signature dans le tableau de bord." },
      { status: 400 },
    );
  }
  stay.status = "countersigned";
  stay.countersignedAt = new Date().toISOString();
  await rebuildDocuments(stay);
  return relativeRedirect(`/dashboard/stays/${id}`);
}

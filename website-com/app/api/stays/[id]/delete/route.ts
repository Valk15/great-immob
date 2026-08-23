import { deleteStay, getStay } from "@/lib/store";
import { relativeRedirect } from "@/lib/url";
import { requireOperatorApi } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireOperatorApi();
  if (denied) return denied;
  const { id } = await params;
  if (!getStay(id)) {
    return NextResponse.json({ error: "Séjour introuvable" }, { status: 404 });
  }
  deleteStay(id);
  return relativeRedirect("/dashboard?deleted=1");
}

import { NextResponse } from "next/server";
import { requireOperatorApi } from "@/lib/auth";
import { dataUrlToBuffer } from "@/lib/documents";
import {
  hasOperatorSignature,
  readOperatorSignature,
  writeOperatorSignature,
} from "@/lib/store";

export async function GET() {
  const denied = await requireOperatorApi();
  if (denied) return denied;
  const buf = await readOperatorSignature();
  if (!buf || !(await hasOperatorSignature())) {
    return NextResponse.json({ error: "Aucune signature" }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, no-store",
    },
  });
}

export async function POST(request: Request) {
  const denied = await requireOperatorApi();
  if (denied) return denied;
  const form = await request.formData();
  const drawn = String(form.get("signatureData") || "");

  if (drawn.startsWith("data:image/png")) {
    await writeOperatorSignature(dataUrlToBuffer(drawn));
    return NextResponse.json({ ok: true });
  }

  const file = form.get("signature");
  if (file instanceof File && file.size >= 20) {
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "Signature trop lourde" }, { status: 400 });
    }
    await writeOperatorSignature(Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Dessinez votre signature." }, { status: 400 });
}

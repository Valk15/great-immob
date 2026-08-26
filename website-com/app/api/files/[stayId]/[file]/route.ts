import { NextResponse } from "next/server";
import { requireOperatorApi } from "@/lib/auth";
import { readUpload } from "@/lib/store";

const TYPES: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ stayId: string; file: string }> },
) {
  const { stayId, file } = await params;
  const denied = await requireOperatorApi();
  if (denied) return denied;
  const buf = await readUpload(stayId, file);
  if (!buf) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  const ext = file.split(".").pop()?.toLowerCase() || "";
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": TYPES[ext] || "application/octet-stream",
      "Content-Disposition": ext === "pdf" ? `inline; filename="${file}"` : "inline",
      "Cache-Control": "private, no-store",
    },
  });
}

import { NextResponse } from "next/server";
import { requireOperatorApi } from "@/lib/auth";
import { PROPERTIES } from "@/lib/brand";
import { newIds, saveStay } from "@/lib/store";
import { guestUrl, appOrigin, relativeRedirect } from "@/lib/url";
import type { Stay, StayChannel } from "@/lib/types";

export async function POST(request: Request) {
  const denied = await requireOperatorApi();
  if (denied) return denied;
  const form = await request.formData();
  const propertyId = String(form.get("propertyId") || "essafa");
  const property = PROPERTIES.find((p) => p.id === propertyId) || PROPERTIES[0];
  const checkIn = String(form.get("checkIn") || "");
  const checkOut = String(form.get("checkOut") || "");
  const guestCount = Number(form.get("guestCount") || 1);
  const channel = (String(form.get("channel") || "airbnb") === "classique"
    ? "classique"
    : "airbnb") as StayChannel;

  if (!checkIn || !checkOut) {
    return NextResponse.json({ error: "Dates requises" }, { status: 400 });
  }

  const { id, token } = newIds();
  const stay: Stay = {
    id,
    token,
    createdAt: new Date().toISOString(),
    status: "awaiting_guest",
    propertyId: property.id,
    propertyAddress: property.address,
    checkIn,
    checkOut,
    guestCount: Number.isFinite(guestCount) && guestCount > 0 ? guestCount : 1,
    channel,
    cohabitants: [],
    files: {},
  };
  saveStay(stay);
  return relativeRedirect(`/dashboard/stays/${id}?created=1`);
}

export async function GET() {
  const origin = await appOrigin();
  return NextResponse.json({ origin, guestPattern: guestUrl(origin, "{token}") });
}

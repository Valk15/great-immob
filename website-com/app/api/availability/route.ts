import { NextResponse } from "next/server";
import { blockedDates } from "@/lib/bookings";
import { addDays, isoDate } from "@/lib/listing";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from") || isoDate(new Date());
  const to = url.searchParams.get("to") || addDays(from, 180);
  return NextResponse.json({ blocked: await blockedDates(from, to) });
}

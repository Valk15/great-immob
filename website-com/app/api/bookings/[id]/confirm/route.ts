import { NextResponse } from "next/server";
import { requireOperatorApi } from "@/lib/auth";
import { confirmBooking } from "@/lib/bookings";
import { relativeRedirect } from "@/lib/url";

export async function POST(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const denied = await requireOperatorApi();
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    const booking = await confirmBooking(id);
    return relativeRedirect(`/dashboard/stays/${booking.stayId}?created=1`);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Impossible de confirmer" },
      { status: 400 },
    );
  }
}

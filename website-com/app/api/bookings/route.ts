import { NextResponse } from "next/server";
import { requestBooking } from "@/lib/bookings";
import { currentGuest } from "@/lib/guest-auth";

export async function POST(request: Request) {
  const guest = await currentGuest();
  if (!guest) {
    return NextResponse.json({ error: "Log in to request a stay." }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    adults?: number;
    children?: number;
    pets?: number;
  };
  try {
    const booking = await requestBooking({
      guestId: guest.id,
      guestName: guest.name,
      guestEmail: guest.email,
      guestPhone: guest.phone,
      checkIn: String(body.checkIn || ""),
      checkOut: String(body.checkOut || ""),
      guests: Number(body.guests || 2),
      adults: body.adults,
      children: body.children,
      pets: body.pets,
    });
    return NextResponse.json({ ok: true, id: booking.id, status: booking.status });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Booking failed" },
      { status: 400 },
    );
  }
}

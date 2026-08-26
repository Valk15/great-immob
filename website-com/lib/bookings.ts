import { randomBytes } from "crypto";
import { PROPERTIES } from "./brand";
import { nightsBetween, quoteStay, rangesOverlap } from "./listing";
import { persistReadJson, persistWriteJson } from "./persist";
import { listStays, newIds, saveStay } from "./store";
import type { Stay } from "./types";

export type BookingStatus = "pending" | "confirmed" | "declined" | "cancelled";

export type Booking = {
  id: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  adults?: number;
  children?: number;
  pets?: number;
  nights: number;
  totalMad: number;
  status: BookingStatus;
  stayId?: string;
  stayToken?: string;
  createdAt: string;
};

async function readBookings(): Promise<Booking[]> {
  const parsed = await persistReadJson<{ bookings?: Booking[] }>("bookings.json", { bookings: [] });
  return Array.isArray(parsed.bookings) ? parsed.bookings : [];
}

async function writeBookings(bookings: Booking[]) {
  await persistWriteJson("bookings.json", { bookings });
}

export async function listBookings() {
  return (await readBookings()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getBooking(id: string) {
  return (await readBookings()).find((b) => b.id === id);
}

export async function bookingsForGuest(guestId: string) {
  return (await listBookings()).filter((b) => b.guestId === guestId);
}

export async function saveBooking(booking: Booking) {
  const all = await readBookings();
  const i = all.findIndex((b) => b.id === booking.id);
  if (i >= 0) all[i] = booking;
  else all.push(booking);
  await writeBookings(all);
  return booking;
}

export async function occupiedRanges() {
  const stays = (await listStays()).map((s) => ({ start: s.checkIn, end: s.checkOut, source: "stay" as const }));
  const pending = (await readBookings())
    .filter((b) => b.status === "pending" || b.status === "confirmed")
    .map((b) => ({ start: b.checkIn, end: b.checkOut, source: "booking" as const }));
  return [...stays, ...pending];
}

export async function isAvailable(checkIn: string, checkOut: string, ignoreBookingId?: string) {
  if (!checkIn || !checkOut || nightsBetween(checkIn, checkOut) < 1) return false;
  for (const stay of await listStays()) {
    if (rangesOverlap(checkIn, checkOut, stay.checkIn, stay.checkOut)) return false;
  }
  for (const booking of await readBookings()) {
    if (ignoreBookingId && booking.id === ignoreBookingId) continue;
    if (booking.status !== "pending" && booking.status !== "confirmed") continue;
    if (rangesOverlap(checkIn, checkOut, booking.checkIn, booking.checkOut)) return false;
  }
  return true;
}

export async function blockedDates(fromIso: string, toIso: string) {
  const blocked = new Set<string>();
  const ranges = await occupiedRanges();
  let day = fromIso;
  while (day < toIso) {
    const next = day;
    for (const r of ranges) {
      if (day >= r.start && day < r.end) blocked.add(day);
    }
    const d = new Date(Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 1, Number(day.slice(8, 10)));
    d.setDate(d.getDate() + 1);
    day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (day === next) break;
  }
  return [...blocked];
}

export async function requestBooking(input: {
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  adults?: number;
  children?: number;
  pets?: number;
}) {
  const nights = nightsBetween(input.checkIn, input.checkOut);
  if (nights < 1) throw new Error("Choose at least one night.");
  const adults = Math.max(1, Math.floor(Number(input.adults ?? input.guests)));
  const children = Math.max(0, Math.floor(Number(input.children ?? 0)));
  const pets = Math.max(0, Math.floor(Number(input.pets ?? 0)));
  const guests = adults + children;
  if (guests < 1 || guests > 2) throw new Error("This apartment sleeps 2.");
  if (pets > 0) throw new Error("This apartment does not allow pets.");
  if (!(await isAvailable(input.checkIn, input.checkOut))) {
    throw new Error("Those dates are not available.");
  }
  const quote = quoteStay(input.checkIn, input.checkOut);
  const booking: Booking = {
    id: randomBytes(8).toString("hex"),
    guestId: input.guestId,
    guestName: input.guestName,
    guestEmail: input.guestEmail,
    guestPhone: input.guestPhone,
    propertyId: "essafa",
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guests,
    adults,
    children,
    pets,
    nights: quote.nights,
    totalMad: quote.totalMad,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  return saveBooking(booking);
}

export async function confirmBooking(id: string) {
  const booking = await getBooking(id);
  if (!booking) throw new Error("Réservation introuvable");
  if (booking.status === "confirmed" && booking.stayId) return booking;
  if (booking.status === "declined" || booking.status === "cancelled") {
    throw new Error("Cette demande n'est plus active");
  }
  if (!(await isAvailable(booking.checkIn, booking.checkOut, booking.id))) {
    throw new Error("Dates déjà prises");
  }
  const property = PROPERTIES[0];
  const { id: stayId, token } = newIds();
  const stay: Stay = {
    id: stayId,
    token,
    createdAt: new Date().toISOString(),
    status: "awaiting_guest",
    propertyId: property.id,
    propertyAddress: property.address,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guestCount: booking.guests,
    channel: "classique",
    cohabitants: [],
    files: {},
    bookingId: booking.id,
  };
  await saveStay(stay);
  booking.status = "confirmed";
  booking.stayId = stayId;
  booking.stayToken = token;
  return saveBooking(booking);
}

export async function declineBooking(id: string) {
  const booking = await getBooking(id);
  if (!booking) throw new Error("Réservation introuvable");
  booking.status = "declined";
  return saveBooking(booking);
}

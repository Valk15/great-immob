import { randomBytes } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { PROPERTIES } from "./brand";
import { nightsBetween, quoteStay, rangesOverlap } from "./listing";
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
  nights: number;
  totalMad: number;
  status: BookingStatus;
  stayId?: string;
  stayToken?: string;
  createdAt: string;
};

const ROOT = path.join(process.cwd(), "data");
const FILE = path.join(ROOT, "bookings.json");

function ensure() {
  mkdirSync(ROOT, { recursive: true });
}

function readBookings(): Booking[] {
  ensure();
  if (!existsSync(FILE)) return [];
  try {
    const parsed = JSON.parse(readFileSync(FILE, "utf8")) as { bookings?: Booking[] };
    return Array.isArray(parsed.bookings) ? parsed.bookings : [];
  } catch {
    return [];
  }
}

function writeBookings(bookings: Booking[]) {
  ensure();
  writeFileSync(FILE, JSON.stringify({ bookings }, null, 2), "utf8");
}

export function listBookings() {
  return readBookings().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getBooking(id: string) {
  return readBookings().find((b) => b.id === id);
}

export function bookingsForGuest(guestId: string) {
  return listBookings().filter((b) => b.guestId === guestId);
}

export function saveBooking(booking: Booking) {
  const all = readBookings();
  const i = all.findIndex((b) => b.id === booking.id);
  if (i >= 0) all[i] = booking;
  else all.push(booking);
  writeBookings(all);
  return booking;
}

export function occupiedRanges() {
  const stays = listStays().map((s) => ({ start: s.checkIn, end: s.checkOut, source: "stay" as const }));
  const pending = readBookings()
    .filter((b) => b.status === "pending" || b.status === "confirmed")
    .map((b) => ({ start: b.checkIn, end: b.checkOut, source: "booking" as const }));
  return [...stays, ...pending];
}

export function isAvailable(checkIn: string, checkOut: string, ignoreBookingId?: string) {
  if (!checkIn || !checkOut || nightsBetween(checkIn, checkOut) < 1) return false;
  for (const stay of listStays()) {
    if (rangesOverlap(checkIn, checkOut, stay.checkIn, stay.checkOut)) return false;
  }
  for (const booking of readBookings()) {
    if (ignoreBookingId && booking.id === ignoreBookingId) continue;
    if (booking.status !== "pending" && booking.status !== "confirmed") continue;
    if (rangesOverlap(checkIn, checkOut, booking.checkIn, booking.checkOut)) return false;
  }
  return true;
}

export function blockedDates(fromIso: string, toIso: string) {
  const blocked = new Set<string>();
  const cursor = fromIso;
  const ranges = occupiedRanges();
  let day = cursor;
  while (day < toIso) {
    const next = day;
    // mark night as blocked if it falls inside any stay (checkout exclusive)
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

export function requestBooking(input: {
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}) {
  const nights = nightsBetween(input.checkIn, input.checkOut);
  if (nights < 1) throw new Error("Choose at least one night.");
  if (input.guests < 1 || input.guests > 2) throw new Error("This apartment sleeps 2.");
  if (!isAvailable(input.checkIn, input.checkOut)) {
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
    guests: input.guests,
    nights: quote.nights,
    totalMad: quote.totalMad,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  return saveBooking(booking);
}

export function confirmBooking(id: string) {
  const booking = getBooking(id);
  if (!booking) throw new Error("Réservation introuvable");
  if (booking.status === "confirmed" && booking.stayId) return booking;
  if (booking.status === "declined" || booking.status === "cancelled") {
    throw new Error("Cette demande n'est plus active");
  }
  if (!isAvailable(booking.checkIn, booking.checkOut, booking.id)) {
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
  saveStay(stay);
  booking.status = "confirmed";
  booking.stayId = stayId;
  booking.stayToken = token;
  return saveBooking(booking);
}

export function declineBooking(id: string) {
  const booking = getBooking(id);
  if (!booking) throw new Error("Réservation introuvable");
  booking.status = "declined";
  return saveBooking(booking);
}

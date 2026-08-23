import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

export type GuestAccount = {
  id: string;
  email: string;
  name: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
};

const ROOT = path.join(process.cwd(), "data");
const FILE = path.join(ROOT, "guests.json");

function ensure() {
  mkdirSync(ROOT, { recursive: true });
}

function readGuests(): GuestAccount[] {
  ensure();
  if (!existsSync(FILE)) return [];
  try {
    const parsed = JSON.parse(readFileSync(FILE, "utf8")) as { guests?: GuestAccount[] };
    return Array.isArray(parsed.guests) ? parsed.guests : [];
  } catch {
    return [];
  }
}

function writeGuests(guests: GuestAccount[]) {
  ensure();
  writeFileSync(FILE, JSON.stringify({ guests }, null, 2), "utf8");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32);
  const prev = Buffer.from(hash, "hex");
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getGuest(id: string) {
  return readGuests().find((g) => g.id === id);
}

export function getGuestByEmail(email: string) {
  const key = normalizeEmail(email);
  return readGuests().find((g) => g.email === key);
}

export function createGuest(input: { email: string; name: string; phone: string; password: string }) {
  const email = normalizeEmail(input.email);
  if (!email || !email.includes("@")) throw new Error("Email invalide");
  if (input.password.length < 8) throw new Error("Mot de passe trop court (8 caractères min.)");
  if (getGuestByEmail(email)) throw new Error("Un compte existe déjà avec cet email");
  const guest: GuestAccount = {
    id: randomBytes(8).toString("hex"),
    email,
    name: input.name.trim() || email.split("@")[0],
    phone: input.phone.trim(),
    passwordHash: hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };
  const guests = readGuests();
  guests.push(guest);
  writeGuests(guests);
  return guest;
}

export function guestPublic(guest: GuestAccount) {
  return { id: guest.id, email: guest.email, name: guest.name, phone: guest.phone };
}

export function fingerprint(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

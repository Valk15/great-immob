import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { persistReadJson, persistWriteJson } from "./persist";

export type GuestAccount = {
  id: string;
  email: string;
  name: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
};

async function readGuests(): Promise<GuestAccount[]> {
  const parsed = await persistReadJson<{ guests?: GuestAccount[] }>("guests.json", { guests: [] });
  return Array.isArray(parsed.guests) ? parsed.guests : [];
}

async function writeGuests(guests: GuestAccount[]) {
  await persistWriteJson("guests.json", { guests });
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

export async function getGuest(id: string) {
  return (await readGuests()).find((g) => g.id === id);
}

export async function getGuestByEmail(email: string) {
  const key = normalizeEmail(email);
  return (await readGuests()).find((g) => g.email === key);
}

export async function createGuest(input: { email: string; name: string; phone: string; password: string }) {
  const email = normalizeEmail(input.email);
  if (!email || !email.includes("@")) throw new Error("Email invalide");
  if (input.password.length < 8) throw new Error("Mot de passe trop court (8 caractères min.)");
  if (await getGuestByEmail(email)) throw new Error("Un compte existe déjà avec cet email");
  const guest: GuestAccount = {
    id: randomBytes(8).toString("hex"),
    email,
    name: input.name.trim() || email.split("@")[0],
    phone: input.phone.trim(),
    passwordHash: hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };
  const guests = await readGuests();
  guests.push(guest);
  await writeGuests(guests);
  return guest;
}

export function guestPublic(guest: GuestAccount) {
  return { id: guest.id, email: guest.email, name: guest.name, phone: guest.phone };
}

export function fingerprint(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

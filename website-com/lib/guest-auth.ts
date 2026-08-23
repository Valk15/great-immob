import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getGuest } from "./guests";

export const GUEST_COOKIE = "gi_guest_session";

function secret() {
  return process.env.SESSION_SECRET || "dev-only-change-session-secret";
}

async function sign(value: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret() + ":guest"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const buf = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export async function createGuestSessionValue(guestId: string) {
  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const payload = `${guestId}.${exp}`;
  return `${payload}.${await sign(payload)}`;
}

export async function parseGuestSession(raw: string | undefined) {
  if (!raw) return null;
  const lastDot = raw.lastIndexOf(".");
  if (lastDot < 0) return null;
  const payload = raw.slice(0, lastDot);
  const mac = raw.slice(lastDot + 1);
  if (!payload || !mac) return null;
  if (!safeEqual(mac, await sign(payload))) return null;
  const [guestId, expRaw] = payload.split(".");
  if (!guestId || !expRaw) return null;
  if (Number(expRaw) < Date.now()) return null;
  return guestId;
}

function cookieOpts(request?: Request) {
  let secure = false;
  if (request) {
    const host = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "")
      .split(",")[0]
      .trim()
      .split(":")[0];
    const proto = (
      request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.replace(":", "")
    )
      .split(",")[0]
      .trim();
    secure = host !== "localhost" && host !== "127.0.0.1" && proto === "https";
  }
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  };
}

export async function attachGuestCookie(response: NextResponse, guestId: string, request: Request) {
  response.cookies.set(GUEST_COOKIE, await createGuestSessionValue(guestId), cookieOpts(request));
}

export function clearGuestCookie(response: NextResponse) {
  response.cookies.set(GUEST_COOKIE, "", { path: "/", maxAge: 0 });
}

export async function currentGuest() {
  const jar = await cookies();
  const id = await parseGuestSession(jar.get(GUEST_COOKIE)?.value);
  if (!id) return null;
  return getGuest(id) ?? null;
}

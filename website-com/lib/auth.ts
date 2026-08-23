import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const SESSION_COOKIE = "gi_ops_session";
const COOKIE = SESSION_COOKIE;

function secret() {
  return process.env.SESSION_SECRET || "dev-only-change-session-secret";
}

export function dashboardPassword() {
  return process.env.DASHBOARD_PASSWORD || "change-me";
}

async function sign(value: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
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

export async function createSessionValue() {
  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const payload = String(exp);
  return `${payload}.${await sign(payload)}`;
}

export async function sessionIsValid(raw: string | undefined) {
  if (!raw || !raw.includes(".")) return false;
  const [payload, mac] = raw.split(".");
  if (!payload || !mac) return false;
  const expected = await sign(payload);
  if (!safeEqual(mac, expected)) return false;
  const exp = Number(payload);
  return Number.isFinite(exp) && exp > Date.now();
}

export async function isOperator() {
  const jar = await cookies();
  return sessionIsValid(jar.get(COOKIE)?.value);
}

export async function requireOperatorApi() {
  if (await isOperator()) return null;
  return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
}

function cookieSecure(request?: Request) {
  if (!request) return false;
  const host = (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    ""
  )
    .split(",")[0]
    .trim()
    .split(":")[0];
  if (host === "localhost" || host === "127.0.0.1") return false;
  const proto = (
    request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.replace(":", "")
  )
    .split(",")[0]
    .trim();
  return proto === "https";
}

function sessionCookieOptions(request?: Request) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: cookieSecure(request),
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  };
}

export async function setSessionCookie(request?: Request) {
  const jar = await cookies();
  jar.set(COOKIE, await createSessionValue(), sessionCookieOptions(request));
}

export async function attachSessionCookie(response: NextResponse, request: Request) {
  response.cookies.set(COOKIE, await createSessionValue(), sessionCookieOptions(request));
}

export function clearSessionOnResponse(response: NextResponse) {
  response.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export function operatorNextPath(raw: string | null | undefined) {
  const next = String(raw || "/dashboard");
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/api") || next.startsWith("/c/")) {
    return "/dashboard";
  }
  if (next === "/" || next === "/login" || next === "/ops") return "/dashboard";
  return next;
}

export function passwordMatches(input: string) {
  const expected = dashboardPassword().trim();
  return safeEqual(input.trim(), expected);
}

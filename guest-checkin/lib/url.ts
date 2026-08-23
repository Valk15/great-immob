import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function appOrigin() {
  const h = await headers();
  const host = (h.get("x-forwarded-host") || h.get("host") || "").split(",")[0].trim();
  const proto = (h.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https"))
    .split(",")[0]
    .trim();
  if (host && !host.startsWith("localhost") && !host.startsWith("127.0.0.1")) {
    return `${proto}://${host}`.replace(/\/$/, "");
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  return `${proto}://${host || "localhost:3000"}`;
}

export function guestUrl(origin: string, token: string) {
  return `${origin}/c/${token}`;
}

/** Stay on the current browser origin (http localhost vs https tunnel). */
export function relativeRedirect(path: string) {
  const location = path.startsWith("/") ? path : `/${path}`;
  return new NextResponse(null, {
    status: 303,
    headers: { Location: location },
  });
}

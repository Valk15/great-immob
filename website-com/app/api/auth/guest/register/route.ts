import { NextResponse } from "next/server";
import { attachGuestCookie } from "@/lib/guest-auth";
import { createGuest, guestPublic } from "@/lib/guests";
import { relativeRedirect } from "@/lib/url";

export async function POST(request: Request) {
  const form = await request.formData();
  const next = String(form.get("next") || "/account");
  const safe = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  try {
    const guest = createGuest({
      email: String(form.get("email") || ""),
      name: String(form.get("name") || ""),
      phone: String(form.get("phone") || ""),
      password: String(form.get("password") || ""),
    });
    const res = relativeRedirect(safe);
    await attachGuestCookie(res, guest.id, request);
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not create account";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

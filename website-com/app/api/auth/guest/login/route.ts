import { attachGuestCookie } from "@/lib/guest-auth";
import { getGuestByEmail, verifyPassword } from "@/lib/guests";
import { relativeRedirect } from "@/lib/url";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");
  const next = String(form.get("next") || "/account");
  const safe = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  const guest = await getGuestByEmail(email);
  if (!guest || !verifyPassword(password, guest.passwordHash)) {
    return relativeRedirect(`/account/login?error=1&next=${encodeURIComponent(safe)}`);
  }
  const res = relativeRedirect(safe);
  await attachGuestCookie(res, guest.id, request);
  return res;
}

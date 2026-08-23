import { clearGuestCookie } from "@/lib/guest-auth";
import { relativeRedirect } from "@/lib/url";

export async function POST() {
  const res = relativeRedirect("/");
  clearGuestCookie(res);
  return res;
}

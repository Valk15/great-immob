import { attachSessionCookie, operatorNextPath, passwordMatches } from "@/lib/auth";
import { relativeRedirect } from "@/lib/url";

export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get("password") || "");
  if (!passwordMatches(password)) {
    return relativeRedirect("/ops?error=1");
  }
  const safe = operatorNextPath(String(form.get("next") || "/dashboard"));
  const res = relativeRedirect(safe);
  await attachSessionCookie(res, request);
  return res;
}

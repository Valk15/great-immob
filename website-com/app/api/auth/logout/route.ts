import { clearSessionOnResponse } from "@/lib/auth";
import { relativeRedirect } from "@/lib/url";

export async function POST() {
  const res = relativeRedirect("/ops");
  clearSessionOnResponse(res);
  return res;
}

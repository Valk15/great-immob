import { requireOperatorApi } from "@/lib/auth";
import { declineBooking } from "@/lib/bookings";
import { relativeRedirect } from "@/lib/url";

export async function POST(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const denied = await requireOperatorApi();
  if (denied) return denied;
  const { id } = await ctx.params;
  await declineBooking(id);
  return relativeRedirect("/dashboard?declined=1");
}

import { notFound } from "next/navigation";
import { getStayByToken } from "@/lib/store";
import { GuestCheckin } from "./GuestCheckin";

export const dynamic = "force-dynamic";

export default async function GuestCheckinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const stay = getStayByToken(token);
  if (!stay) notFound();
  const closed = stay.status === "countersigned" || stay.status === "guest_completed";
  return <GuestCheckin stay={stay} closed={closed} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStayByToken } from "@/lib/store";
import { GuestCheckin } from "./GuestCheckin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  title: "Check-in",
};

export default async function GuestCheckinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const stay = await getStayByToken(token);
  if (!stay) notFound();
  const closed = stay.status === "countersigned" || stay.status === "guest_completed";
  return <GuestCheckin stay={stay} closed={closed} />;
}

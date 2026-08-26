import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default async function LoginAliasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const q = await searchParams;
  const params = new URLSearchParams();
  if (q.error) params.set("error", q.error);
  if (q.next) params.set("next", q.next);
  redirect(params.size ? `/ops?${params.toString()}` : "/ops");
}

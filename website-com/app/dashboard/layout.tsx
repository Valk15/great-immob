import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { isOperator } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isOperator())) redirect("/ops?next=/dashboard");
  return children;
}

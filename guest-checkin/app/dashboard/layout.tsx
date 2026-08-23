import { redirect } from "next/navigation";
import { isOperator } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isOperator())) redirect("/?next=/dashboard");
  return children;
}

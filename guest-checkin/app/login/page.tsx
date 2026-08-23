import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const q = await searchParams;
  const params = new URLSearchParams();
  if (q.error) params.set("error", q.error);
  if (q.next) params.set("next", q.next);
  redirect(params.size ? `/?${params.toString()}` : "/");
}

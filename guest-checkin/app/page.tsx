import { redirect } from "next/navigation";
import { BrandLockup, Eyebrow } from "@/components/BrandMark";
import { isOperator } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  if (await isOperator()) redirect("/dashboard");

  const q = await searchParams;
  const next = q.next && q.next.startsWith("/") ? q.next : "/dashboard";

  return (
    <main className="min-h-screen bg-ink text-bone">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
        <BrandLockup inverted href="/" />
        <div className="mt-8">
          <Eyebrow>Opérateur</Eyebrow>
          <h1 className="mt-4 font-display text-5xl leading-tight">Tableau de bord</h1>
          <p className="mt-3 text-sm text-mist">Hamza uniquement. Entrez le mot de passe pour continuer.</p>

          {q.error ? (
            <p className="mt-6 border border-champagne/40 bg-ink px-3 py-2 text-sm text-champagne">
              Mot de passe incorrect.
            </p>
          ) : null}

          <form action="/api/auth/login" method="post" className="mt-8 space-y-4">
            <input type="hidden" name="next" value={next} />
            <label className="block text-xs uppercase tracking-wide text-champagne">Mot de passe</label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="w-full rounded-gi border border-mist/30 bg-white px-3 py-3 text-ink outline-none focus:border-champagne"
            />
            <button type="submit" className="w-full rounded-gi bg-champagne py-3 text-sm font-medium text-ink">
              Entrer
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

import { BrandLockup } from "@/components/BrandMark";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bone px-6">
      <BrandLockup href="/" />
      <h1 className="mt-8 font-display text-4xl">Lien introuvable</h1>
      <p className="mt-2 text-sm text-ink/70">Ce check-in n&apos;existe pas ou a expiré.</p>
    </main>
  );
}

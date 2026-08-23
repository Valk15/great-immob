import Image from "next/image";
import Link from "next/link";

export function BrandLockup({
  href = "/",
  inverted = false,
  compact = false,
}: {
  href?: string | null;
  inverted?: boolean;
  compact?: boolean;
}) {
  const size = compact
    ? "h-8 w-auto max-w-[11rem] bg-transparent object-contain sm:h-9 sm:max-w-[13rem]"
    : inverted
      ? "h-20 w-auto max-w-[min(100%,22rem)] bg-transparent object-contain sm:h-24 sm:max-w-[28rem]"
      : "h-14 w-auto max-w-[min(100%,18rem)] bg-transparent object-contain sm:h-[4.25rem] sm:max-w-[22rem]";
  const mark = inverted ? (
    <Image
      src="/brand/lockup-inverse.png"
      alt="GreatImmob — Gestion locative"
      width={1408}
      height={379}
      className={size}
      priority
    />
  ) : (
    <Image
      src="/brand/lockup.png"
      alt="GreatImmob — Gestion locative"
      width={1408}
      height={379}
      className={size}
      priority
    />
  );
  if (!href) return <span className="inline-flex items-center">{mark}</span>;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="GreatImmob">
      {mark}
    </Link>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-brand text-champagne">{children}</p>
  );
}

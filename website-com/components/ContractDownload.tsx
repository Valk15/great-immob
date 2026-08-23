export function ContractDownload({
  token,
  label,
  hint,
}: {
  token: string;
  label: string;
  hint: string;
}) {
  return (
    <a
      href={`/api/checkin/${token}/contrat`}
      className="mt-6 inline-flex flex-col items-center rounded-gi bg-ink px-5 py-3 text-sm text-bone"
    >
      {label}
      <span className="mt-1 text-[11px] font-normal text-bone/70">{hint}</span>
    </a>
  );
}

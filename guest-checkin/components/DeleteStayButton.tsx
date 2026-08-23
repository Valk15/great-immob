"use client";

export function DeleteStayButton({
  stayId,
  compact = false,
}: {
  stayId: string;
  compact?: boolean;
}) {
  return (
    <form
      action={`/api/stays/${stayId}/delete`}
      method="post"
      onSubmit={(e) => {
        if (
          !confirm(
            "Supprimer ce séjour, le contrat, la fiche de police et les pièces d'identité ? Cette action est définitive.",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className={
          compact
            ? "text-xs uppercase tracking-wide text-champagne"
            : "rounded-gi border border-champagne px-5 py-3 text-sm text-ink"
        }
      >
        Supprimer
      </button>
    </form>
  );
}

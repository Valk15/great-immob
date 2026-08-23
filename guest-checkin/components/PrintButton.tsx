"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-gi bg-ink px-5 py-3 text-sm text-bone print:hidden"
    >
      Imprimer le dossier
    </button>
  );
}

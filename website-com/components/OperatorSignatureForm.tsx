"use client";

import { useState } from "react";
import { SignaturePad } from "./SignaturePad";

export function OperatorSignatureForm({ hasSig }: { hasSig: boolean }) {
  const [signature, setSignature] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setError("");
    if (!signature) {
      setError("Dessinez votre signature dans le cadre.");
      return;
    }
    setBusy(true);
    const form = new FormData();
    form.set("signatureData", signature);
    const res = await fetch("/api/operator-signature", {
      method: "POST",
      body: form,
      headers: { Accept: "application/json" },
    });
    setBusy(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error || "Enregistrement impossible.");
      return;
    }
    window.location.href = "/dashboard?sig=1";
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink/70">
        Signez ici avec la souris ou le doigt. Cette signature sera collée sur le contrat quand
        vous contresignez.
      </p>
      {hasSig ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/api/operator-signature"
          alt="Signature actuelle"
          className="h-20 w-auto bg-transparent p-0"
        />
      ) : null}
      <SignaturePad value={signature} onChange={setSignature} label="Signature du bailleur" />
      {error ? <p className="text-sm text-champagne">{error}</p> : null}
      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="rounded-gi bg-ink px-4 py-2 text-xs uppercase tracking-wide text-bone disabled:opacity-50"
      >
        {busy ? "Enregistrement…" : "Enregistrer ma signature"}
      </button>
    </div>
  );
}

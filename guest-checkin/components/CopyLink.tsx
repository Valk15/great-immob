"use client";

import { useState } from "react";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <code className="max-w-full break-all rounded-gi border border-mist bg-white px-3 py-2 text-xs text-ink">
        {url}
      </code>
      <button
        type="button"
        onClick={copy}
        className="rounded-gi bg-ink px-3 py-2 text-xs uppercase tracking-wide text-bone"
      >
        {copied ? "Copié" : "Copier le lien"}
      </button>
    </div>
  );
}

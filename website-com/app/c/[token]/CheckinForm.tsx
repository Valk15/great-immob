"use client";

import { useMemo, useRef, useState } from "react";
import { LANDLORD } from "@/lib/brand";
import { NationalitySelect, PhoneFields } from "@/components/CountryFields";
import { ContractDownload } from "@/components/ContractDownload";
import { SignaturePad, type SignaturePadHandle } from "@/components/SignaturePad";
import type { GuestCopy, GuestLocale } from "@/lib/i18n";
import type { Stay } from "@/lib/types";

const emptyMate = { nom: "", prenom: "", cin: "", nationalite: "", telephone: "" };

export function CheckinForm({
  stay,
  copy,
  locale,
}: {
  stay: Stay;
  copy: GuestCopy;
  locale: GuestLocale;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const padRef = useRef<SignaturePadHandle>(null);
  const [step, setStep] = useState(0);
  const [signature, setSignature] = useState("");
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [signedBoth, setSignedBoth] = useState(true);
  const [mates, setMates] = useState([emptyMate]);

  const steps = useMemo(() => copy.steps, [copy.steps]);

  function field(name: string) {
    const el = formRef.current?.elements.namedItem(name);
    if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
      return el.value.trim();
    }
    return "";
  }

  function stepError(s: number) {
    if (s === 0) {
      if (!field("nom") || !field("prenom") || !field("cin") || !field("phoneLocal")) {
        return copy.errors.identity;
      }
      const genre = field("genre");
      if (genre !== "homme" && genre !== "femme") return copy.errors.gender;
    }
    if (s === 1) {
      const input = formRef.current?.elements.namedItem("idRecto");
      const fromInput = input instanceof HTMLInputElement ? input.files?.[0] : undefined;
      const file = idFront || fromInput;
      if (!file || file.size < 80) return copy.errors.idRecto;
    }
    if (s === 2) {
      const box = formRef.current?.elements.namedItem("acceptedRules");
      if (!(box instanceof HTMLInputElement) || !box.checked) return copy.errors.rules;
    }
    return "";
  }

  function goNext() {
    const msg = stepError(step);
    if (msg) {
      setError(msg);
      return;
    }
    setError("");
    setStep((s) => s + 1);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formEl = formRef.current;
    if (!formEl) return;

    for (const s of [0, 1, 2]) {
      const msg = stepError(s);
      if (msg) {
        setStep(s);
        setError(msg);
        return;
      }
    }

    const ink = padRef.current?.snapshot() || signature;
    if (!ink || ink.length < 80) {
      setError(copy.signMissing);
      return;
    }

    setBusy(true);
    const form = new FormData(formEl);
    const rectoInput = formEl.elements.namedItem("idRecto");
    const versoInput = formEl.elements.namedItem("idVerso");
    const rectoFile =
      idFront || (rectoInput instanceof HTMLInputElement ? rectoInput.files?.[0] : undefined);
    const versoFile =
      idBack || (versoInput instanceof HTMLInputElement ? versoInput.files?.[0] : undefined);
    if (rectoFile) form.set("idRecto", rectoFile);
    if (versoFile) form.set("idVerso", versoFile);
    form.set("signature", ink);
    form.set("locale", locale);

    try {
      const res = await fetch(`/api/checkin/${stay.token}`, { method: "POST", body: form });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : copy.sendFail);
        setBusy(false);
        return;
      }
      setDone(true);
      setSignedBoth(json.signedBoth !== false);
    } catch {
      setError(copy.sendFail);
    }
    setBusy(false);
  }

  if (done) {
    return (
      <div className="border border-mist bg-white p-8 text-center">
        <p className="text-[11px] uppercase tracking-brand text-champagne">{copy.doneEyebrow}</p>
        <h2 className="mt-3 font-display text-3xl">{copy.doneTitle}</h2>
        <p className="mt-3 text-sm text-ink/70">{signedBoth ? copy.doneBoth : copy.doneGuestOnly}</p>
        <ContractDownload token={stay.token} label={copy.download} hint={copy.downloadHint} />
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="space-y-8">
      <ol className="flex gap-3 text-[11px] uppercase tracking-wide text-champagne">
        {steps.map((label, i) => (
          <li key={label} className={i === step ? "text-ink" : ""}>
            0{i + 1} {label}
          </li>
        ))}
      </ol>

      <div className="space-y-8">
        <section className={step === 0 ? "space-y-4 border border-mist bg-white p-6" : "hidden"}>
          <h2 className="font-display text-3xl">{copy.tenant}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="nom" label={copy.lastName} />
            <Field name="prenom" label={copy.firstName} />
            <Field name="cin" label={copy.cin} />
            <div>
              <label className="text-xs uppercase tracking-wide text-champagne">{copy.gender}</label>
              <select name="genre" className="mt-1 w-full border border-mist px-3 py-3">
                <option value="">{copy.genderChoose}</option>
                <option value="homme">{copy.genderMale}</option>
                <option value="femme">{copy.genderFemale}</option>
              </select>
            </div>
            <NationalitySelect name="nationalite" copy={copy} locale={locale} />
            <PhoneFields
              codeName="phoneCode"
              localName="phoneLocal"
              copy={copy}
              locale={locale}
            />
            <Field name="email" label={copy.email} type="email" />
          </div>

          <div className="pt-4">
            <h3 className="font-display text-2xl">{copy.cohabitants}</h3>
            <p className="text-sm text-ink/60">{copy.cohabitantsHint}</p>
            {mates.map((m, i) => (
              <div key={i} className="mt-4 space-y-2 border border-mist p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    name={`co_nom_${i}`}
                    placeholder={copy.lastName}
                    defaultValue={m.nom}
                    className="border border-mist px-2 py-2 text-sm"
                  />
                  <input
                    name={`co_prenom_${i}`}
                    placeholder={copy.firstName}
                    className="border border-mist px-2 py-2 text-sm"
                  />
                  <input
                    name={`co_cin_${i}`}
                    placeholder={copy.cin}
                    className="border border-mist px-2 py-2 text-sm"
                  />
                </div>
                <NationalitySelect name={`co_nationalite_${i}`} copy={copy} locale={locale} />
                <PhoneFields
                  codeName={`co_code_${i}`}
                  localName={`co_local_${i}`}
                  copy={copy}
                  locale={locale}
                />
              </div>
            ))}
            {mates.length < 5 ? (
              <button
                type="button"
                className="mt-3 text-xs uppercase tracking-wide text-champagne"
                onClick={() => setMates((rows) => [...rows, emptyMate])}
              >
                {copy.addCohabitant}
              </button>
            ) : null}
          </div>
        </section>

        <section className={step === 1 ? "space-y-4 border border-mist bg-white p-6" : "hidden"}>
          <h2 className="font-display text-3xl">{copy.idTitle}</h2>
          <p className="text-sm text-ink/70">{copy.idHint}</p>
          <label className="block text-xs uppercase tracking-wide text-champagne">{copy.idFront}</label>
          <input
            type="file"
            name="idRecto"
            accept="image/jpeg,image/png,image/webp,image/*"
            capture="environment"
            onChange={(e) => setIdFront(e.target.files?.[0] ?? null)}
          />
          {idFront ? <p className="text-xs text-ink/60">{idFront.name}</p> : null}
          <label className="block text-xs uppercase tracking-wide text-champagne">{copy.idBack}</label>
          <input
            type="file"
            name="idVerso"
            accept="image/jpeg,image/png,image/webp,image/*"
            capture="environment"
            onChange={(e) => setIdBack(e.target.files?.[0] ?? null)}
          />
          {idBack ? <p className="text-xs text-ink/60">{idBack.name}</p> : null}
        </section>

        <section className={step === 2 ? "space-y-4 border border-mist bg-white p-6" : "hidden"}>
          <h2 className="font-display text-3xl">{copy.contractTitle}</h2>
          <p className="text-[11px] uppercase tracking-brand text-champagne">
            {copy.contractKind} · {stay.propertyAddress}
          </p>
          <p className="text-sm">
            {copy.staySummary(
              stay.checkIn,
              stay.checkOut,
              stay.guestCount,
              `${LANDLORD.prenom} ${LANDLORD.nom}`,
            )}
          </p>
          <div className="max-h-72 space-y-2 overflow-y-auto border border-mist p-4 text-sm leading-relaxed">
            {copy.houseRules.map((rule) => (
              <p key={rule}>• {rule}</p>
            ))}
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="acceptedRules" className="mt-1" />
            <span>{copy.acceptRules}</span>
          </label>
        </section>

        {step === 3 ? (
          <section className="space-y-4 border border-mist bg-white p-6">
            <h2 className="font-display text-3xl">{copy.signTitle}</h2>
            <SignaturePad
              ref={padRef}
              value={signature}
              onChange={setSignature}
              label={copy.signLabel}
              hint={copy.signHint}
              clearLabel={copy.signClear}
            />
          </section>
        ) : null}

        {error ? <p className="text-sm text-champagne">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="rounded-gi border border-ink px-4 py-3 text-sm"
            >
              {copy.back}
            </button>
          ) : null}
          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-gi bg-ink px-5 py-3 text-sm text-bone"
            >
              {copy.continue}
            </button>
          ) : (
            <button
              type="submit"
              disabled={busy}
              className="rounded-gi bg-champagne px-5 py-3 text-sm text-ink disabled:opacity-50"
            >
              {busy ? copy.sending : copy.signSend}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
}: {
  name: string;
  label: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wide text-champagne">{label}</span>
      <input name={name} type={type} className="mt-1 w-full border border-mist px-3 py-3" />
    </label>
  );
}

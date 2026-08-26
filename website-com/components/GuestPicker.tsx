"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useSite } from "@/components/SiteLocaleProvider";
import {
  MAX_PETS,
  type GuestParty,
  clampParty,
  peopleCount,
} from "@/lib/guest-party";

function CircleBtn({
  label,
  ariaLabel,
  disabled,
  onClick,
}: {
  label: string;
  ariaLabel: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-mist text-base leading-none text-ink transition hover:border-ink disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:border-mist"
    >
      {label}
    </button>
  );
}

function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-3.5">
      <div className="min-w-0">
        <p className="text-[15px] font-medium text-ink">{label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink/50">{hint}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3" dir="ltr">
        <CircleBtn
          label="−"
          ariaLabel={`${label} −`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        />
        <span className="w-5 text-center text-sm tabular-nums text-ink">{value}</span>
        <CircleBtn
          label="+"
          ariaLabel={`${label} +`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        />
      </div>
    </div>
  );
}

function PartyRows({
  value,
  onChange,
  maxPeople,
  petsAllowed,
  capacityNote,
}: {
  value: GuestParty;
  onChange: (next: GuestParty) => void;
  maxPeople: number;
  petsAllowed: boolean;
  capacityNote?: string;
}) {
  const { copy } = useSite();
  const people = peopleCount(value);
  const room = Math.max(0, maxPeople - people);

  function patch(partial: Partial<GuestParty>) {
    onChange(clampParty({ ...value, ...partial }, maxPeople));
  }

  return (
    <div>
      <Stepper
        label={copy.search.adults}
        hint={copy.search.adultsHint}
        value={value.adults}
        min={1}
        max={value.adults + room}
        onChange={(adults) => patch({ adults })}
      />
      <div className="border-t border-mist">
        <Stepper
          label={copy.search.children}
          hint={copy.search.childrenHint}
          value={value.children}
          min={0}
          max={value.children + room}
          onChange={(children) => patch({ children })}
        />
      </div>
      <div className="border-t border-mist">
        <Stepper
          label={copy.search.pets}
          hint={copy.search.petsHint}
          value={value.pets}
          min={0}
          max={MAX_PETS}
          onChange={(pets) => patch({ pets })}
        />
      </div>
      {!petsAllowed ? (
        <p className="pt-1 text-xs leading-relaxed text-champagne">{copy.search.petsNotAllowed}</p>
      ) : null}
      {capacityNote && people >= maxPeople ? (
        <p className="pt-1 text-xs leading-relaxed text-ink/50">{capacityNote}</p>
      ) : null}
    </div>
  );
}

export function guestSummary(
  copy: { search: { peopleSummary: (n: number) => string; petsSummary: (n: number) => string } },
  party: GuestParty,
) {
  const people = copy.search.peopleSummary(peopleCount(party));
  if (party.pets > 0) return `${people} · ${copy.search.petsSummary(party.pets)}`;
  return people;
}

export function GuestPicker({
  value,
  onChange,
  maxPeople,
  petsAllowed = false,
  capacityNote,
  variant = "popover",
  placement = "bottom",
}: {
  value: GuestParty;
  onChange: (next: GuestParty) => void;
  maxPeople: number;
  petsAllowed?: boolean;
  capacityNote?: string;
  variant?: "popover" | "inline";
  placement?: "top" | "bottom";
}) {
  const { copy } = useSite();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const summary = guestSummary(copy, value);
  const rows = (
    <PartyRows
      value={value}
      onChange={onChange}
      maxPeople={maxPeople}
      petsAllowed={petsAllowed}
      capacityNote={capacityNote}
    />
  );

  if (variant === "inline") {
    return (
      <div ref={rootRef} className="col-span-2 bg-white">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-3 py-3 text-start"
        >
          <span>
            <span className="block text-[11px] uppercase tracking-wide text-champagne">{copy.search.who}</span>
            <span className="mt-1 block text-sm text-ink">{summary}</span>
          </span>
          <Chevron open={open} />
        </button>
        {open ? (
          <div id={panelId} className="border-t border-mist px-3 pb-3">
            {rows}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative px-4 py-3">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-start"
      >
        <span className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45">
            {copy.search.who}
          </span>
          <span className="mt-1 block truncate text-sm text-ink">{summary}</span>
        </span>
        <Chevron open={open} />
      </button>
      {open ? (
        <div
          id={panelId}
          className={`absolute z-[60] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-mist bg-white p-4 shadow-[0_18px_50px_rgba(11,28,44,0.14)] max-md:start-0 md:end-0 ${
            placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {rows}
        </div>
      ) : null}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`h-3 w-3 shrink-0 text-ink/40 transition ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="M2.5 4.25 6 8l3.5-3.75" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

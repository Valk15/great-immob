"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LISTING, addDays, isoDate, nightlyRateMad, nightsBetween, quoteStay } from "@/lib/listing";
import { clampParty, partySearchParams, peopleCount, type GuestParty } from "@/lib/guest-party";
import { useSite } from "@/components/SiteLocaleProvider";
import { GuestPicker } from "@/components/GuestPicker";

export function BookingPanel({
  loggedIn,
  initialIn,
  initialOut,
  initialAdults,
  initialChildren,
  initialPets,
}: {
  loggedIn: boolean;
  initialIn?: string;
  initialOut?: string;
  initialAdults?: number;
  initialChildren?: number;
  initialPets?: number;
}) {
  const router = useRouter();
  const { copy } = useSite();
  const today = isoDate(new Date());
  const start = initialIn && initialIn >= today ? initialIn : today;
  const end = initialOut && initialOut > start ? initialOut : addDays(start, 3);
  const [checkIn, setCheckIn] = useState(start);
  const [checkOut, setCheckOut] = useState(end);
  const [party, setParty] = useState<GuestParty>(() =>
    clampParty(
      {
        adults: initialAdults ?? 2,
        children: initialChildren ?? 0,
        pets: initialPets ?? 0,
      },
      LISTING.guests,
    ),
  );
  const [blocked, setBlocked] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const from = today;
    const to = addDays(today, 180);
    fetch(`/api/availability?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((data) => setBlocked(Array.isArray(data.blocked) ? data.blocked : []))
      .catch(() => setBlocked([]));
  }, [today]);

  const quote = useMemo(() => {
    if (nightsBetween(checkIn, checkOut) < 1) return null;
    return quoteStay(checkIn, checkOut);
  }, [checkIn, checkOut]);

  const conflict = useMemo(() => {
    if (!quote) return false;
    return quote.lines.some((line) => blocked.includes(line.date));
  }, [blocked, quote]);

  const petsBlocked = party.pets > 0 && !LISTING.petsAllowed;

  async function book() {
    setError("");
    if (!loggedIn) {
      const params = new URLSearchParams({
        in: checkIn,
        out: checkOut,
        ...partySearchParams(party),
      });
      router.push(`/account/login?next=${encodeURIComponent(`/stay?${params.toString()}`)}`);
      return;
    }
    if (petsBlocked) {
      setError(copy.search.petsNotAllowed);
      return;
    }
    if (!quote || conflict) {
      setError(copy.booking.unavailable);
      return;
    }
    setBusy(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkIn,
        checkOut,
        guests: peopleCount(party),
        adults: party.adults,
        children: party.children,
        pets: party.pets,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error === "This apartment does not allow pets." ? copy.search.petsNotAllowed : copy.booking.failed);
      return;
    }
    router.push("/account?requested=1");
  }

  const from = nightlyRateMad(checkIn);

  return (
    <aside className="border border-mist bg-white p-6 shadow-[0_12px_40px_rgba(11,28,44,0.06)]">
      <p className="font-display text-3xl text-ink">
        {from} <span className="text-lg font-sans">MAD</span>
        <span className="ms-1 text-sm font-sans text-ink/50">{copy.booking.perNight}</span>
      </p>
      <p className="mt-1 text-xs text-ink/50">{copy.booking.seasonal}</p>

      <div className="mt-5 grid grid-cols-2 gap-px border border-mist bg-mist">
        <label className="bg-white px-3 py-3 text-[11px] uppercase tracking-wide text-champagne">
          {copy.search.checkIn}
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (e.target.value >= checkOut) setCheckOut(addDays(e.target.value, 2));
            }}
            className="mt-1 block w-full bg-transparent text-sm normal-case tracking-normal text-ink outline-none"
          />
        </label>
        <label className="bg-white px-3 py-3 text-[11px] uppercase tracking-wide text-champagne">
          {copy.search.checkout}
          <input
            type="date"
            value={checkOut}
            min={addDays(checkIn, 1)}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mt-1 block w-full bg-transparent text-sm normal-case tracking-normal text-ink outline-none"
          />
        </label>
        <GuestPicker
          variant="inline"
          value={party}
          onChange={setParty}
          maxPeople={LISTING.guests}
          petsAllowed={LISTING.petsAllowed}
          capacityNote={copy.search.maxPeople}
        />
      </div>

      {quote ? (
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex justify-between">
            <span>{copy.booking.nights(quote.nights)}</span>
            <span>{quote.totalMad} MAD</span>
          </li>
          <li className="flex justify-between border-t border-mist pt-2 font-medium">
            <span>{copy.booking.total}</span>
            <span>{quote.totalMad} MAD</span>
          </li>
        </ul>
      ) : null}

      {conflict ? <p className="mt-3 text-sm text-ink/70">{copy.booking.conflict}</p> : null}
      {petsBlocked ? <p className="mt-3 text-sm text-champagne">{copy.search.petsNotAllowed}</p> : null}
      {error ? <p className="mt-3 text-sm text-champagne">{error}</p> : null}

      <button
        type="button"
        onClick={book}
        disabled={busy || conflict || !quote || petsBlocked}
        className="mt-5 w-full rounded-gi bg-champagne py-3 text-sm font-medium text-ink disabled:opacity-50"
      >
        {busy ? copy.booking.sending : loggedIn ? copy.booking.request : copy.booking.logInToRequest}
      </button>
      <p className="mt-3 text-xs leading-relaxed text-ink/50">{copy.booking.notInstant}</p>
    </aside>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, isoDate } from "@/lib/listing";
import { DESTINATIONS } from "@/lib/destinations";
import { LISTING } from "@/lib/listing";
import {
  DEFAULT_PARTY,
  SEARCH_MAX_PEOPLE,
  type GuestParty,
  partySearchParams,
} from "@/lib/guest-party";
import { useSite } from "@/components/SiteLocaleProvider";
import { GuestPicker } from "@/components/GuestPicker";

export function StaySearch({
  variant = "hero",
  defaultCity = "agadir",
  defaultParty = DEFAULT_PARTY,
}: {
  variant?: "hero" | "bar";
  defaultCity?: string;
  defaultParty?: GuestParty;
}) {
  const router = useRouter();
  const { copy } = useSite();
  const [city, setCity] = useState(defaultCity);
  const [minDate, setMinDate] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [party, setParty] = useState<GuestParty>(defaultParty);

  useEffect(() => {
    const today = isoDate(new Date());
    setMinDate(today);
    setCheckIn(today);
    setCheckOut(addDays(today, 3));
  }, []);

  const minOut = useMemo(() => (checkIn ? addDays(checkIn, 1) : ""), [checkIn]);

  function search(e: React.FormEvent) {
    e.preventDefault();
    const out = checkOut && checkIn && checkOut > checkIn ? checkOut : minOut;
    if (!checkIn || !out) return;
    const params = new URLSearchParams({
      city,
      in: checkIn,
      out,
      ...partySearchParams(party),
    });
    router.push(`/stays?${params.toString()}`);
  }

  const field = variant === "hero" ? "bg-transparent" : "bg-white";

  return (
    <form
      onSubmit={search}
      className={
        variant === "hero"
          ? "grid overflow-visible rounded-2xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] md:grid-cols-[1.2fr_1fr_1fr_1fr_auto]"
          : "grid overflow-visible rounded-2xl border border-mist bg-white md:grid-cols-[1.2fr_1fr_1fr_1fr_auto]"
      }
    >
      <label className={`rounded-t-2xl border-b border-mist px-4 py-3 md:rounded-t-none md:rounded-s-2xl md:border-b-0 md:border-e ${field}`}>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45">{copy.search.where}</span>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="mt-1 w-full bg-transparent text-sm text-ink outline-none"
        >
          {DESTINATIONS.map((d) => (
            <option key={d.slug} value={d.slug}>
              {copy.city[d.slug].name}
            </option>
          ))}
        </select>
      </label>
      <label className="border-b border-mist px-4 py-3 md:border-b-0 md:border-e">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45">{copy.search.checkIn}</span>
        <input
          type="date"
          min={minDate || undefined}
          value={checkIn}
          onChange={(e) => {
            const v = e.target.value;
            setCheckIn(v);
            if (checkOut <= v) setCheckOut(addDays(v, 1));
          }}
          className="mt-1 w-full bg-transparent text-sm text-ink outline-none"
        />
      </label>
      <label className="border-b border-mist px-4 py-3 md:border-b-0 md:border-e">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45">{copy.search.checkout}</span>
        <input
          type="date"
          min={minOut || undefined}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="mt-1 w-full bg-transparent text-sm text-ink outline-none"
        />
      </label>
      <div className="relative z-20 border-b border-mist md:border-b-0 md:border-e">
        <GuestPicker
          value={party}
          onChange={setParty}
          maxPeople={SEARCH_MAX_PEOPLE}
          petsAllowed={LISTING.petsAllowed}
          placement={variant === "hero" ? "top" : "bottom"}
        />
      </div>
      <button
        type="submit"
        className="rounded-b-2xl bg-champagne px-8 py-4 text-sm font-semibold text-ink hover:bg-[#d4b78a] md:rounded-b-none md:rounded-e-2xl md:px-6"
      >
        {copy.search.search}
      </button>
    </form>
  );
}

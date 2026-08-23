# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audiences (equal weight):

1. **Property owners living in Agadir / the coast** who have (or want) a short-term rental and need someone on the ground for guests, cleaning coordination, and day-to-day ops.
2. **MRE / owners abroad** who own a furnished apartment in the Agadir belt and cannot manage Airbnb/Booking themselves.

Job to be done: turn the property into reliable short-term rental income without daily involvement, with clear fees and honest proof.

Secondary (not phase-1 site focus): real-estate agents who may refer owners; guests book via Airbnb/Booking, not via GreatImmob marketing sites.

## Product Purpose

**GreatImmob** is a **gestion locative courte durée** (conciergerie) service for Agadir and the coastal strip **Anza → Imi Ouaddar** (including Hay Mohammadi, Tamraght, Taghazout, Aourir).

It exists to:

- Operate listings on Airbnb (and Booking when relevant): messaging, pricing, check-in/out, cleaning coordination, owner reporting.
- Grow recurring management-fee revenue (target **8 000–10 000 MAD/month** within ~6 months via ~3 managed units).

Success for an owner: higher occupancy/revenue with less stress than self-hosting.  
Success for the business: signed management mandates and predictable monthly fees — **not** classic agency sale commissions in phase 1.

## Positioning

What neighboring conciergeries (Nesty, Locaga, etc.) cannot truthfully copy from us today:

- A **live Superhost / Guest Favorite** reference apartment in **Hay Mohammadi, Agadir**, hosted publicly by **Hamza**, with verifiable Airbnb stats (see Evidence).
- A **two-person ops model** with Hamza as the sole public face for owners and guests (local ops + WhatsApp).
- Honest scale: we do **not** claim dozens of units or fake client counts; proof starts from the real listing.

Fee model (confirmed): **management commission + ménage billed separately** (Nesty-style). Phase-1 commission rate in use: **25%** of booking revenue; cleaning / maintenance interventions are separate (owner may use own cleaners later if agreed).

## Operating Context

- **Owner journey:** discover site (greatimmob.ma / greatimmob.com) → WhatsApp Hamza → visit/estimate → management mandate → listing live → monthly report + payout.
- **Guest journey:** Airbnb (primary proof channel) / Booking; GreatImmob sites do not sell stays to tourists as the main CTA.
- **Ops:** Hamza handles guest contact, check-in/out, agent relationships in Agadir; systems/scraper/sites are internal (not public-facing under another personal brand).
- **Lead engine:** Avito / Mubawab / Airbnb scrapers → Google Sheet → Hamza outreach.
- **Sites:** `greatimmob.ma` (WordPress, main brand) and `greatimmob.com` (Next.js / Vercel owner landing). Repo: this `GREATIMMOB` monorepo (`website-com/` + scraper).

## Capabilities and Constraints

**Capabilities (phase 1)**

- Full STR management for 1–2 BR furnished apartments in the defined geography.
- Listing optimization, guest messaging, arrivals/departures, pricing, cleaning coordination, owner follow-up.
- Owner acquisition via WhatsApp (Hamza) and lead scraping.

**Constraints (binding)**

- **Public brand face = Hamza only.** Do not publish Youness’s name, personal brand, or personal phone on sites, ads, or owner materials.
- **Contact number = Hamza’s WhatsApp only** for the whole project (currently used on `.com`: `212641553583`). Do not use other personal numbers.
- **No classic agency catalog** as the product story (no fake “à vendre” mandates). Sales / villas / fermes are phase 2 after ≥3 managed units.
- **No fabricated metrics:** client counts, “+1500 clients”, invented %, licenses, or testimonials.
- **Budget:** reuse existing WordPress + Vercel hosting; no new VPS required for sites.
- **Geography for management:** Anza → Imi Ouaddar (Agadir residential including Hay Mohammadi + coast).

**Open / undecided (do not invent on site)**

- Exact published “ops hours” string (e.g. 7j/7 9h–23h) — confirm before claiming.
- Whether Booking is live on the reference unit today.
- Formal legal entity / tourism authorization wording for “100% légal” badges — only claim what is true.

## Brand Commitments

- **Name:** GreatImmob / GREATIMMOB.
- **Public spokesperson:** Hamza (ops, Superhost host name on Airbnb).
- **Voice:** calm, local, proof-led (Nesty-like clarity); not keyword-spam “meilleure conciergerie” and not fear-only compliance marketing as the whole story.
- **Languages on `.com` today:** FR / EN / AR supported in code — keep FR primary for owners unless decided otherwise.
- Binding competitive quality bar for UX clarity: [nesty.ma](https://nesty.ma/) (structure/honesty), without copying their false claims or inventing scale.

## Evidence on Hand

Verified from Airbnb listing (2026-07-28 scrape of public page):

| Field | Value |
|-------|--------|
| Listing URL | https://www.airbnb.com/rooms/1567644686324751910 |
| Title | Luxury 1BR Apartment \| Fiber WiFi \| Quiet & Elegant |
| Place | Entire rental unit, **Agadir** — **Hay Mohammadi**, Résidence Essafa |
| Capacity | 2 guests · 1 bedroom · 1 bed · 1.5 baths |
| Rating | **4.92** / 5 |
| Reviews | **36** |
| Badges | **Guest favorite**; **Top 10% of homes**; exceptional check-in callout |
| Host | **Hamza** — **Superhost** · ~8 months hosting |
| Operator-stated occupancy (not scraped from calendar) | ~**80–90%** (use only if still accurate when publishing) |
| Nightly range (operator-stated) | ~**300–600 MAD** (seasonal) |
| Fee | **25%** management + **cleaning separate** |

**Must not fabricate:** additional managed units, aggregate review counts across a portfolio, “+50 / +1500 propriétaires”, invented +% revenue claims without basis.

**Assets still to collect for design:** apartment photos (from listing/host), calendar screenshot if used as proof, Hamza photo optional.

## Product Principles

1. **Proof before scale claims** — show the real Superhost listing; never inflate portfolio size.
2. **Hamza is the product interface** — one WhatsApp, one public name, local ops trust.
3. **Owners first** — sites convert property owners, not tourists booking nights.
4. **Transparent economics** — state % + separate cleaning like Nesty; no hidden “all-in” ambiguity.
5. **Coast focus** — Agadir belt only until capacity and proof support expansion.

## Accessibility & Inclusion

No product-specific legal accessibility standard recorded yet. Web surfaces should remain readable on mobile (primary owner device) with clear FR copy; do not block Arabic/English where already supported on `.com`.

# greatimmob.ma — Full site audit + image plan

**Date:** 2026-08-05
**Measured against:** `PRODUCT.md`, `BRAND_DNA.md`, `DESIGN.md`, `STRATEGY_CHECKLIST.md`
**Excludes:** blog posts — see `BLOG_AUDIT.md`

---

## A. Verdict per page

| Page | Strategy fit | State |
|---|---|---|
| `/` Accueil | ✅ On strategy | Good. Real proof, 25%, corridor named, WhatsApp CTA. |
| `/conciergerie/` | ✅ | Not yet line-audited. |
| `/formule/` | ✅ | Not yet line-audited. |
| `/zones/` | ⚠️ Right structure, wrong pictures | See section C — this is your image problem. |
| `/preuve/` | ✅ | Not yet line-audited. |
| **`/apropos/`** | ❌ **Off strategy** | Untouched Houzez demo. Contains a false claim. |
| **`/nous-contacter/`** | ❌ **Off strategy** | Untouched Houzez demo. Broken link. Unverified office + hours. |
| `/demande-dinformation/` | ❌ | Agency-era leftover, still in sitemap. |
| `/actualites/` | ⚠️ | Blog index — only as good as the posts under it. |

---

## B. The two broken pages — fix these first

### B1. `/apropos/` — last touched 7 Dec 2025

This page still says you are an estate agency, and one line is straightforwardly untrue.

| Live text | Problem |
|---|---|
| "Nous sommes bien plus que de simples **agents immobiliers**" | You are a conciergerie, not agents. |
| "Forts de **plusieurs décennies d'expérience cumulée**" | **Fabricated.** Hamza has ~8 months hosting. This is the single worst line on the non-blog site. |
| "projets d'**achat, de vente ou d'investissement**" | Phase 2 at the earliest. |
| 8 service cards: Marketing du logement · Guide d'achat · Évaluations · Relocalisation · Expertise de quartier · **Négociation et conclusion** · Services d'investissement · Assistance continue | Every one of these is a sales-agency service you do not offer. |
| FAQ: "achat de propriétés de **luxe**", "visites virtuelles", "avocats et notaires" | Wrong business entirely. |
| `og:image` = `interieur-Riad-Le-Calife.webp` | A **Marrakech riad interior**. Wrong city, wrong property, not yours. Every share of this page previews someone else's riad. |
| No mention of Hamza anywhere | The page that should be *most* about him doesn't name him. |

**Action:** rewrite from scratch as a Hamza-only page. Structure: who Hamza is → Superhost proof → what "sur place" actually means → the corridor → WhatsApp. Kill all 8 cards and the entire FAQ. Replace `og:image`.

### B2. `/nous-contacter/` — last touched 8 Dec 2025

| Live text | Problem |
|---|---|
| "Centre d'Affaire Le Littoral, 3e Etage, Haut Founty" | **Verify this.** If it's not a real GreatImmob office, it must go — a fake address is worse than no address. |
| "lundi–vendredi 9h00–18h00, samedi 10:00 AM–2:00 PM, dimanche: Rendez-Vous" | Contradicts the WhatsApp-first model, mixes FR and AM/PM formats, and `PRODUCT.md` lists ops hours as **undecided — do not claim**. |
| `[about:blank](about:blank)` | A **broken link** rendering on the live page. Probably a dead map embed. |
| Same luxury-sales FAQ as `/apropos/` | Duplicate content *and* wrong business. |
| No WhatsApp button in the body, no `contact@greatimmob.ma` | The footer has both. The contact page has neither. |

**Action:** strip to WhatsApp + email + corridor + one honest response-time line. Only publish the address and hours if both are real.

---

## C. Images — the actual problem, and how to fix it properly

### C1. What's wrong now

You have 13 files in `brand/web/places/`, and their names tell the story:

```
place-agadir-beach-mt   place-agadir-hill      place-agadir-sand
place-atlantic-horizon  place-boats-beach      place-boats-sand
place-coast-houses      place-harbor-houses    place-sand-boat
place-seashore-village  place-shore-life       place-surf-line
place-taghazout-village
```

Only **one** names a real place in your corridor (`taghazout-village`). The rest are generic coast imagery. But `/zones/` presents them as specific villages:

| Zone card on `/zones/` | Image actually behind it | Honest? |
|---|---|---|
| **Aghroud** | `place-coast-houses.jpg` (alt: "Maisons sur la côte — Aghroud / sud Agadir") | ❌ Generic |
| **Tamraght · Aourir** | generic "rivage" | ❌ Generic |
| **Imi Ouaddar** | generic "Atlantique vers Imi Ouaddar" | ❌ Generic |
| **Taghazout** | `place-taghazout-village.jpg` | ⚠️ Plausible — verify |
| **Agadir & Hay Mohammadi** | `place-agadir-hill.jpg` | ⚠️ Plausible — verify |

This is the same category of problem as the fake stats: a claim that isn't true. And it's the one your **customers can personally check** — an Agadir owner knows what Aghroud looks like. Swapping one generic beach photo for another generic beach photo does not fix it.

Two further issues: the provenance/licence of these 13 files is unrecorded, and `/zones/` sets its `og:image` to the **512×512 site icon** instead of a photo, so every social share of your zones page previews a tiny logo.

### C2. Each village has a real identity — and you're not using any of it

This is the opportunity. Your competitors' zone pages are interchangeable. Yours don't have to be:

| Place | What it is actually known for |
|---|---|
| **Aghroud** | The **colourful village** — brightly painted houses. Calm shallow beach, ~27 km north of Agadir, family-friendly. Sold commercially as the "Colorful Village" day trip. |
| **Aourir** | **Banana Village** — nicknamed by Jimi Hendrix in the 1960s. Roadside banana stalls, banana groves running inland. **Wednesday souk** draws people from miles around. |
| **Taghazout** | White surf village on the cliff, international surf crowd, constant winter swell. |
| **Tamraght** | Surf village at the mouth of the banana valley, between Aourir and Taghazout. |
| **Imi Ouaddar** | Quiet fishing beach, northern limit of your corridor. |
| **Agadir** | The crescent bay and corniche; Kasbah on the hill above the port. |
| **Hay Mohammadi** | Residential Agadir — where your Superhost proof unit is. |

Note how much better the copy gets for free: *"Aourir — le village des bananes, souk du mercredi"* beats *"Studios et appartements meublés pour la saison"*. That's local authority no competitor can fake, and it's genuinely useful to a traveller deciding where to stay.

### C3. What I can and can't do here

I can't source these photographs for you. Authentic, rights-cleared images of Aghroud, Aourir, Tamraght and Imi Ouaddar essentially don't exist in stock libraries — these are small villages — and grabbing a generic Moroccan coast shot and captioning it "Imi Ouaddar" just recreates the problem at a new file path.

`DESIGN.md` already has the right answer: *"Prefer **real** apartment / Agadir photos"* and *"Real photography — beats AI"*. **Hamza is physically in the corridor.** Aghroud is 30 minutes up the coast; Aourir is 7 km from Agadir. This is a half-day drive with a phone, and it produces assets no competitor has.

### C4. Shot list for Hamza

One drive, north along the coast road. Shoot **landscape 3:2** and one **portrait 3:4** per place. Morning or late afternoon — hard midday sun will fight the Atlantic Ledger palette.

| # | Place | Shots to get | Why |
|---|---|---|---|
| 1 | **Agadir — hero** | The bay curve from up near the Kasbah, late afternoon. Wide, calm, horizon level. | Replaces the current random hero. This is the one image that must be unmistakably Agadir. |
| 2 | Agadir — corniche | Promenade detail, low sun | Secondary |
| 3 | **Hay Mohammadi** | Street outside the résidence, plus the building | Ties the proof unit to a real address |
| 4 | **Aghroud** | The **painted houses** — colour full-frame. Plus the shallow beach. | The single most recognisable image in your corridor |
| 5 | **Tamraght** | Village from the road, banana valley behind | Distinguishes it from Taghazout |
| 6 | **Aourir** | **Roadside banana stalls** (the yellow). Wednesday souk if timing allows. | Instantly reads as Aourir to anyone local |
| 7 | **Taghazout** | White houses stacked above the water | You may already have this — verify |
| 8 | **Imi Ouaddar** | Fishing boats / quiet beach, north end | Proves the corridor's northern edge is real |

Naming convention — make the filename carry the claim, so this can't drift again:

```
place-agadir-bay-hero.jpg
place-agadir-corniche.jpg
place-hay-mohammadi-street.jpg
place-aghroud-colourful-houses.jpg
place-aghroud-beach.jpg
place-tamraght-village.jpg
place-aourir-bananas.jpg
place-taghazout-village.jpg
place-imi-ouaddar-beach.jpg
```

Rule going forward: **if no filename names the place, the caption may not name the place either.**

### C5. Interim position, until the photos exist

Don't leave false captions live while waiting. Two honest options:

1. **Re-caption, don't relabel.** Keep the generic images but change captions from "Aghroud" to atmosphere-only ("La côte, entre Agadir et Taghazout"). Honest immediately, zero new assets. Lets the *copy* carry the local knowledge from C2 while the photos catch up.
2. **Collapse to what's true.** Use the verified Taghazout + Agadir shots and the real Hay Mohammadi interiors (`brand/web/hay/`, 5 files) and run fewer, honest images rather than nine generic ones.

I'd take option 1 now, then swap in Hamza's photos as they arrive.

---

## D. Technical SEO

| Issue | Where | Fix |
|---|---|---|
| `og:image` is the 512px site icon | `/zones/` | Set a real 1200×630 photo |
| `og:image` is a Marrakech riad | `/apropos/` | Replace |
| All images lazy-load as base64 SVG placeholders | Site-wide (LiteSpeed/SpeedyCache) | Fine for humans, but crawlers and AI scrapers see no imagery. Consider eager-loading the hero. |
| Duplicate luxury-sales FAQ on two pages | `/apropos/`, `/nous-contacter/` | Delete both |
| `/demande-dinformation/` still indexed | sitemap | Draft or redirect |

---

## E. Suggested order

1. `/apropos/` — remove "plusieurs décennies d'expérience", rewrite Hamza-only
2. `/nous-contacter/` — verify address + hours, kill `about:blank`, add WhatsApp
3. `/zones/` — re-caption honestly (C5 option 1) + fold in the real local detail from C2
4. Hamza's photo drive → swap images in, per C4 naming
5. Line-audit `/conciergerie/`, `/formule/`, `/preuve/`
6. Then blog (`BLOG_AUDIT.md`), then GSC

---

## F. Applying this

Cowork has no Novamira connection to `greatimmob.ma`. Apply in **Cursor**, where `novamira-greatimmob-ma` is configured.

**Sources for section C2:** [Aourir – Wikipedia](https://en.wikipedia.org/wiki/Aourir) · [5 Ways to Enjoy Aourir Like a Local – MarocMama](https://marocmama.com/aourir-morocco-like-a-local/) · [Aghroud Colorful Village day trip – Tazwit Tours](https://www.tazwittours.com/colorful-village-aghroud-half-day-trip/) · [Plage Aghroud – Evendo](https://evendo.com/locations/morocco/agadir-region/attraction/plage-aghroud)

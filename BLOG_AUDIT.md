# greatimmob.ma — Blog claims audit

**Date:** 2026-08-05
**Scope:** the 6 posts in `post-sitemap.xml`, all currently `index, follow`
**Purpose:** Phase C leftover — *"Soft claims audit — old blog posts still indexed with inflated claims"*

> Read this before touching anything in WordPress. Item 1 is urgent.

---

## 1. `/pourquoi-80-des-proprietaires-airbnb-a-agadir-risquent-une-fermeture-en-2026/`

**Published 2026-03-05 — the newest post, and the most damaging thing on either domain.**

### Fabricated or unverifiable

| Claim in post | Problem |
|---|---|
| "**80%** des propriétaires Airbnb à Agadir risquent une fermeture" | Invented statistic. It's in the H1, the `<title>`, **and the URL slug**. No source. |
| "Plus de **340 propriétaires** l'ont déjà téléchargé" | Invented count. Directly violates the `PRODUCT.md` ban on fabricated client numbers. |
| "**+23% de revenu net** en moyenne" pour nos clients | Invented metric. You have one managed unit. |
| "ce que GreatImmob fait pour ses clients **depuis des années**" | False. Hamza has ~8 months hosting history. |
| "La fermeture peut intervenir **sous 48 heures**, sans préavis" | Presented as settled fact with no citation. |

### Prohibited tactics (BRAND_DNA "hard don'ts")

- "*Disponible gratuitement pour une durée limitée*" — artificial scarcity.
- "*Places limitées — Priorité aux demandes reçues avant le 31 mars 2026*" — fake scarcity **and the deadline expired four months ago**, so the page is now visibly stale to anyone who reads it.
- Whole post is fear-first ("vous êtes visible, vous êtes traçable, et vous êtes exposé"), which `PRODUCT.md` explicitly rejects as the brand's story.

### Services promised that you do not provide

This is the part I'd treat as a genuine liability, not just a branding issue:

- "**Optimisation Fiscale pour MRE**" — structuring revenue, deducting charges, *"coordination avec votre conseiller fiscal en France, Belgique ou ailleurs pour éviter la double imposition"*, "déclarations annuelles déposées".
- "**Protection Juridique**" — *"contrats conformes au droit marocain"*, *"clause d'expulsion accélérée"*, *"assistance juridique en cas de litige"*.
- "**Gestion des relations avec les corps de contrôle en cas d'inspection**".

You are a conciergerie. This page advertises tax advisory and legal representation. I'm not your lawyer and can't tell you where the regulatory line sits in Morocco — but selling those services without the relevant qualification is worth a professional opinion before it stays up another week.

### Broken funnel

Every CTA points to `https://www.greatimmob.com/` for a "**Guide Gratuit : Conformité Location Courte Durée Agadir 2026**". That guide does not exist — `.com` is a landing page with an estimate form. Three separate links promise a download that cannot be delivered.

### → Recommended action: **unpublish now** (set to draft), then rewrite

Do not simply `noindex` it. The expired deadline, the fake download count, and the tax/legal offer are all live on a page a prospect can read today. Draft it, then rebuild it later as an honest, sourced piece on STR compliance — which is a legitimately strong topic for you. Keep the URL slug out of it; `80%` in the slug can never be made truthful.

---

## 2. `/investir-en-immobilier-locatif-maroc-guide-expert-2025/`

**Published 2025-12-15. ~16 min read. Genuinely well-written, and entirely off-strategy.**

### The problem is positioning, not honesty

Unlike item 1, this post is largely accurate and carefully hedged (it even tells readers to consult a fiscalist). Its damage is different: it tells Google and every reader that GreatImmob is a **national property-investment agency**.

- Covers Casablanca, Rabat, Tanger, Marrakech, Fès, Kénitra, Tétouan — the whole country.
- Closing CTA offers "**Sélection de biens à fort potentiel locatif**", "**Accompagnement juridique et administratif complet**", "gestion locative clé en main".
- Describes GreatImmob as "*une agence immobilière*".

That is the exact identity `STRATEGY_CHECKLIST.md` says to shed, and it's Phase 2 work at best.

### One reason not to delete it

It has an **inbound backlink**: `marocains-du-monde.org/investissement-locatif-maroc/` pings it. That's real link equity for a young domain. Deleting the URL throws it away.

### → Recommended action: **keep the URL, rewrite the ending**

Leave the educational body (it's good, and it ranks). Cut the agency-services CTA and replace it with a short, honest block: *you manage short-term rentals on the Agadir coast, 25% + ménage, Hamza on WhatsApp*. Add a line near the top scoping the brand: "GreatImmob gère la location courte durée d'Anza à Imi Ouaddar." Keeps the traffic and the backlink, kills the wrong positioning.

---

## 3–6. Remaining posts — not yet read in full

All four are from **December 2025**, the agency era, and all are `index, follow`:

| URL | Provisional call |
|---|---|
| `/guide-complet-pour-acheter-un-appartement-a-marrakech-en-2026/` | Wrong city, wrong business. Strong candidate for `noindex` or redirect. |
| `/vendre-son-bien-immobilier-au-maroc/` | Sales-agency service you don't offer. `noindex` or draft. |
| `/investir-dans-limmobilier-a-agadir-marrakech/` | Half-relevant (Agadir). Possible rewrite candidate. |
| `/investir-dans-limmobilier/` | Generic. Likely thin content. |

**I haven't read these line by line yet** — the calls above are from titles, dates and the pattern in items 1–2. Don't action them on my say-so; let me audit them properly next.

---

## Suggested order of work

1. **Draft post #1 today.** Expired scarcity + fabricated numbers + tax/legal offer. Nothing else on the site is this exposed.
2. **Rewrite the CTA on post #2.** ~20 minutes, preserves the backlink.
3. **Audit posts 3–6** properly, then batch the `noindex` / rewrite / redirect decisions.
4. **Then** Google Search Console: submit `sitemap_index.xml` and request indexing for `/conciergerie/`, `/formule/`, `/zones/`, `/preuve/`. Do this *after* the cleanup — no point asking Google to recrawl while the bad pages are still live.
5. **Then** `/apropos/` + `/nous-contacter/` (still December 2025 copy, not Hamza-only).

Note on ordering: submitting the sitemap first, as the current checklist has it, would push Google to recrawl a site that still contains the fabricated claims. Cleanup should come first.

---

## Applying these changes

Cowork has no Novamira connection to `greatimmob.ma` — the only WordPress MCP available here points at a different property. Apply these in **Cursor**, where `novamira-greatimmob-ma` is configured in `.cursor/mcp.json`.

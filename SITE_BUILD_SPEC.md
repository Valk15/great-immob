# GREATIMMOB — Site Build Spec (greatimmob.ma)

> Structure modelled on nesty.ma. Design language stays **Atlantic Ledger** (ink / bone / champagne, Cormorant Garamond + Source Sans 3).
> Nothing here invents a metric. Every number traces to `PRODUCT.md` → Evidence on Hand.

Status: **blocked** — WordPress connector currently resolves to `sahriskin.com`. Verified 2026-08-06 via `home_url()`. Execute once greatimmob.ma has its own Novamira connection.

---

## 1. What we take from Nesty, and what we reject

| Take | Why | Reject |
|------|-----|--------|
| Page order & section rhythm | It walks an owner from doubt → proof → call, cleanly | Their scale claims (17 properties, 23 000 travellers, 404 reviews) |
| Numbered service index (01–04) | Makes a 4-service business legible in one screen | Their photography and copy verbatim |
| Numbered zone cards with 3 bullets each | Best SEO-to-design pattern on the site | "Properties for sale" as identity — phase 2 for us |
| Fat 6-column SEO footer | This is their actual traffic engine | Keyword-stuffed zone pages |
| Free-tools cluster (calculator, checklist, templates) | Highest-leverage thing they built | — |
| "Evidence, not a promise" framing | Aligns exactly with our proof-led voice | — |

**Nesty's real advantage is not the design. It's the footer and the free tools.** The design is copyable in a day; the tool cluster is what compounds.

---

## 2. Design tokens (unchanged from DESIGN.md)

| Token | Hex | Role |
|-------|-----|------|
| ink | `#0B1C2C` | Text, dark sections, wordmark |
| bone | `#F7F4EF` | Page background |
| champagne | `#C4A574` | Hairlines, accents, numerals |
| mist | `#E8E2D9` | Borders, muted panels |
| white | `#FFFFFF` | Cards on ink |
| success | `#2F5D50` | Occupancy stat only |

- Display: **Cormorant Garamond** — headlines, stat numerals, the italic second clause in hero
- Body/UI: **Source Sans 3**
- Eyebrows: Source Sans 3 Medium, tracked small caps, champagne
- Buttons: ink fill / bone text, 0–2px radius, hover → champagne border
- Rules: 1px champagne hairlines between sections
- Motion: fade/slide 200–400ms ease-out only. One calm entrance in the first viewport.

**Nesty-specific device worth stealing:** headline splits across two lines with the second clause in *italic display* — e.g. "Votre bien est ici. *Nous aussi.*" Do this on hero + 2 section heads max.

---

## 3. Homepage — section by section

Language: **FR primary**, EN + AR via Polylang (already active on the site).

### 3.1 Navbar
Sticky, transparent over hero → solid bone on scroll.
Wordmark left. Links: Conciergerie · La côte · Outils · Blog · **Parler à Hamza** (champagne outline). Lang switcher FR/EN/AR right.

### 3.2 Hero — full-bleed photo, ink overlay
- Image: `brand/web/places/place-surf-line.jpg` or `place-atlantic-horizon.jpg`
- Eyebrow: `CONCIERGERIE COURTE DURÉE · AGADIR → IMI OUADDAR`
- H1: **Votre bien est ici.** *Nous aussi.*
- Sub: GreatImmob prend l'annonce, les voyageurs, les prix et le quotidien de votre location courte durée — avec Hamza sur place, joignable directement.
- CTA primary: `Estimer le potentiel de mon bien →`
- CTA secondary: `Voir la formule 25% →`
- Trust chip: `Sur place · WhatsApp direct · Hamza, Superhost`
- Scroll cue: `Découvrir GreatImmob ↓`

> Do **not** publish an ops-hours string (7j/7 9h–23h) until confirmed — flagged undecided in PRODUCT.md.

### 3.3 Service index — 01–04
Four cards, champagne numerals in Cormorant, hairline dividers, hover lifts to ink.

| # | Title | Line | CTA |
|---|-------|------|-----|
| 01 | Conciergerie | Annonce, voyageurs, tarification, suivi local. Une formule claire à 25% + ménage à part. | Confier mon bien → |
| 02 | Mise en location | Préparation, photos, ameublement, mise en ligne Airbnb. | Préparer mon bien → |
| 03 | La côte | Anza, Hay Mohammadi, Aourir, Tamraght, Taghazout, Aghroud, Imi Ouaddar. | Voir la zone → |
| 04 | Estimation | Un appel de 15 minutes pour clarifier le potentiel réel — et l'étape suivante. | Prendre l'appel → |

### 3.4 Proof band — ink background
Eyebrow: `LA PREUVE, PAS LA PROMESSE`

Real numbers (verified Airbnb, `PRODUCT.md`):

| Value | Label |
|-------|-------|
| **4,92/5** | note Airbnb · 36 avis |
| **Guest Favorite** | Top 10% des logements |
| **Superhost** | Hamza · hôte depuis 2025 |
| **Hay Mohammadi** | Agadir · appartement de référence |

Qualitative slots (no fabrication, fills the band like Nesty's):

| Value | Label |
|-------|-------|
| **25% + ménage à part** | commission annoncée, pas d'ambiguïté |
| **WhatsApp direct** | un numéro, une personne |
| **Anza → Imi Ouaddar** | zone d'intervention |

Footnote: *Chiffres issus de l'annonce Airbnb publique de notre appartement de référence. Nous ne publions pas de portefeuille gonflé.*

Link out to the live Airbnb listing — verifiability is the whole point.

### 3.5 Editorial — "la valeur est locale"
Two columns: text left, photo right (`brand/web/gi-ops-detail.jpg`).

- Eyebrow: `POURQUOI SUR PLACE`
- H2: **De loin, tout paraît simple.** *Jusqu'au premier imprévu.*
- Body: Un voyageur arrive à 1h du matin. Un prix doit bouger avant le week-end. Une fuite n'attend pas. Notre valeur commence exactement là : être sur place, décider vite, et vous dire ce qui a été fait.
- CTA: `Voir ce que nous gérons ↗`

### 3.6 Estimation block
- Eyebrow: `ESTIMATION PROPRIÉTAIRE`
- H2: **Une estimation crédible part de votre bien, pas d'un chiffre générique.**
- Body: En 15 minutes, on clarifie l'adresse, l'état, les travaux éventuels et la manière dont le bien peut réellement être exploité. L'estimation vient après — jamais avant.
- CTA primary: `Estimer mon bien — appel gratuit 15 min`
- CTA secondary: `Voir la formule conciergerie`

*(The Next.js `.com` already has a working estimation form in `app/page.tsx` → port that logic to WPForms or Jetpack Forms, both active.)*

### 3.7 Zone cards — the SEO spine
Numbered cards, photo + 3 bullets, matching Nesty's pattern. Images already in the project folder.

| # | Zone | Image | Bullets |
|---|------|-------|---------|
| 01 | Agadir | `place-agadir-beach-mt.jpg` | Emplacement & résidence · Préparation courte durée · Opérations locales |
| 02 | Taghazout | `Taghazout-street.jpg` / `taghazout-marokko-1.jpg` | Usage du bien · Cadre & accès · Saisonnalité à évaluer |
| 03 | Aghroud | `aghroud beach.avif`, `aghroud 2.webp`, `aghroud 3.webp` | Front de mer · Ameublement · Exploitation réaliste |
| 04 | Imi Ouaddar | `imi ouaddar.jpg` | Budget de rénovation · Ameublement · Quotidien opérationnel |

Section CTA: `Explorer la côte →`

### 3.8 Team — Hamza only
**Hard constraint from PRODUCT.md: Hamza is the sole public face. Youness's name and number appear nowhere.**

Nesty shows three faces; we show one and turn that into the point:

- Eyebrow: `L'ÉQUIPE`
- H2: **Un interlocuteur. Pas un standard.**
- Body: Hamza gère les voyageurs, les arrivées, le ménage et votre suivi. C'est lui qui répond sur WhatsApp, et c'est lui qui est sur place. Nous préférons annoncer une petite structure claire plutôt qu'un effectif inventé.
- Card: photo Hamza · **Hamza** · Conciergerie & opérations · Superhost Airbnb
- CTA: `Écrire à Hamza sur WhatsApp` → `wa.me/212641553583`

### 3.9 Final CTA — full-bleed ink
- Image behind: `brand/web/gi-hero-coast.jpg`
- Eyebrow: `GREATIMMOB · 2026`
- H2: **Parlons de votre bien.**
- Body: Un appel gratuit de 15 minutes pour comprendre votre projet et estimer le potentiel réel.
- CTA: `Réserver mon appel de 15 min` · `Estimer mes revenus →`
- Newsletter: *Marché locatif d'Agadir — notes occasionnelles.* (Klaviyo is active on the stack.)

### 3.10 Footer — 6 columns
This is the SEO engine. Build it properly.

| Column | Links |
|--------|-------|
| **Services** | Conciergerie · Mise en location · Estimation de revenus · Tarifs |
| **La côte** | Conciergerie Agadir · Hay Mohammadi · Taghazout · Aghroud · Imi Ouaddar · Tamraght · Aourir · Anza |
| **Outils gratuits** | Calculateur de rendement Airbnb · Estimateur de prix à la nuit · Checklist conformité Maroc · Pack modèles hôte · Comparateur de conciergeries |
| **Guides** | Investir à Agadir · Loi location saisonnière au Maroc · Devenir Superhost · Fiche de police courte durée · Calculer le rendement net · Fixer le prix à la nuit |
| **Pour qui** | Propriétaires à Agadir · Investisseurs MRE · Investisseurs étrangers · Hôtes Airbnb · Agences partenaires |
| **GreatImmob** | Contact · Mentions légales · Politique de confidentialité |

Bottom bar: wordmark · descriptor · Instagram · WhatsApp `+212 641-553-583` · Agadir, Maroc · © 2026.

Floating WhatsApp bubble, prefilled: *Bonjour, je souhaite estimer le potentiel locatif de mon bien.*

---

## 4. Inner pages

| Route | Purpose | Priority |
|-------|---------|----------|
| `/conciergerie` | The offer in full: what's included, the 25% + ménage breakdown, onboarding steps, FAQ | **P0** |
| `/la-zone` | Coast overview, links to each zone page | P0 |
| `/contact` | Form + WhatsApp + Hamza block | P0 |
| `/conciergerie-airbnb-agadir` | Zone landing | P1 |
| `/conciergerie-airbnb-taghazout` | Zone landing | P1 |
| `/conciergerie-airbnb-aghroud` | Zone landing | P1 |
| `/conciergerie-airbnb-imi-ouaddar` | Zone landing | P1 |
| `/outils/calculateur-rendement` | Lead magnet — highest leverage on the whole site | **P1** |
| `/blog` + guides | Rank Math is already active; long game | P2 |

**Zone page template** (one build, four instances): hero with zone photo → what makes this zone work → what we assess before projecting → the formula → 3 local FAQ → CTA. Rank Math focus keyword: `conciergerie airbnb {zone}`.

---

## 5. Build approach on WordPress

Stack is already there: Elementor Pro v4 (atomic), Polylang, Rank Math Pro, WPForms, Klaviyo, SpeedyCache.

1. Run `novamira-design` skill first, save **Atlantic Ledger** as the site's design direction (tokens above).
2. Create Elementor v4 **Global Classes** for: eyebrow, display-h1, display-h2, italic-clause, btn-primary, btn-secondary, stat-numeral, hairline, zone-card, service-row.
3. Create Elementor **Variables** for the six colours + two font families — so a palette change is one edit, not forty.
4. Build homepage with `elementor-build-page`. Then zone template once, duplicate ×4.
5. Rank Math per page: focus keyword, meta, schema `LocalBusiness` + `Service`.
6. Polylang: FR canonical, EN + AR translations after FR is signed off.

---

## 6. Hard rules carried from BRAND_DNA / PRODUCT.md

- Hamza is the only name and the only number: `+212 641-553-583`
- No invented client counts, no "+X%", no fake testimonials, no countdown timers
- No "à vendre" catalog as brand identity — phase 2, after ≥3 managed units
- No purple gradients, glassmorphism, palm-tree clipart, emoji in marks
- Ops-hours string stays off the site until confirmed
- Don't claim Booking is live on the reference unit until verified
- Legal/authorisation badges: only what is true

---

*Spec written 2026-08-06. Execute on greatimmob.ma once its own Novamira connector is live.*

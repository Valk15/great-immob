# GREATIMMOB — Strategy & Work Checklist

**Business:** Gestion locative courte durée (Airbnb / Booking) — Agadir → Imi Ouaddar (Hay Mohammadi, Tamraght, Taghazout, Aourir)  
**Not:** Classic sales agency / national property portal  
**Goal (6 months):** 8 000–10 000 MAD/month from management fees (~3 units like Hay Mohammadi)  
**Team:** Youness (systems / sites / scraper) · Hamza (ops / WhatsApp / agents / guests)

> **How to use this file:** When a task is finished, change `[ ]` → `[x]`. Do not delete history — keep checkmarks as a progress log.

---

## 0. Status snapshot

| Asset | Role | Status |
|-------|------|--------|
| **greatimmob.ma** | Main brand site (WordPress) → conciergerie only | Multi-page live (Accueil + Conciergerie/Formule/Zones/Preuve) + SEO/AEO files; traffic still mostly old blog |
| **greatimmob.com** | Owner acquisition landing (Next.js / Vercel) | Exists — needs align to honest STR offer |
| **Lead scraper** | Find weak hosts + private owners | Exists in this repo |
| **1 Superhost unit** | Hay Mohammadi — proof | Live (~80–90% occ, 300–600 MAD/night, 25% fee) |
| **Novamira MCP** | Edit `.ma` from Cursor | Connected (this project only) |

---

## 1. Competitor analysis (what “good” looks like)

### 1.1 [nesty.ma](https://nesty.ma/) — closest model (quality bar)

| Pattern | What they do | Steal for GreatImmob? |
|---------|--------------|------------------------|
| **One clear promise** | “Conciergerie à Agadir. Votre bien, géré sur place.” | Yes — same clarity |
| **Proof numbers** | 4.8★, 404 reviews, 17 units, 15 owners, 78% occ, 23k guests | Yes — but **only real numbers** (start with 1 unit / Superhost / occ %) |
| **Transparent fee** | **20%** + cleaning separate | We are at **25%** — justify with occ or match later |
| **Geo pages** | Agadir / Taghazout / Imi Ouaddar dedicated | Yes — SEO + trust |
| **CTA system** | Estimate + 15‑min call + WhatsApp | Yes — WhatsApp first (we have no Calendly yet) |
| **Team faces** | Named people + roles | Yes — Youness + Hamza |
| **Ops hours** | 7j/7, 9h–23h | State what Hamza can actually deliver |
| **Secondary upsell** | “Biens à vendre” + buy→renovate→manage | **Phase 2 only** after 3+ managed units |
| **Tone** | Calm, local, no fake “+1500 clients” | Yes — drop inflated claims |

### 1.2 [locaga.com](https://locaga.com/) — scale competitor

- Claims **100+** units, office at Agadir Bay, fee from **20%**
- Broad zone list including **Hay Mohammadi**, Taghazout, Tamraght
- Heavy SEO keyword stuffing (“meilleure conciergerie”)
- Shows **managed listings** as social proof
- **Lesson:** We cannot out-SEO Locaga tomorrow. We win with **proof + outreach + honest site**, not keyword spam.

### 1.3 [agadir-conciergerie.ma](https://agadir-conciergerie.ma/)

- Generic “full service” copy, commission from **20%**
- Portfolio of listings (often similar nightly prices = weak differentiation)
- **Lesson:** Portfolio without real ratings/occ is noise. Our edge = **real Superhost calendar + rating**.

### 1.4 What GreatImmob must copy (structure)

```
Homepage (owner-first)
  → Hero: manage your Airbnb in Agadir/coast
  → Proof: 1 real unit (rating, occ, Superhost)
  → Offer: what’s included + % fee
  → Zones: Anza → Imi Ouaddar
  → Team: Hamza (ops) / Youness (systems)
  → CTA: WhatsApp + short form
  → FAQ
Geo / service pages (SEO)
Case study page (Hay Mohammadi anonymized OK)
Blog: keep only STR / conformité / Agadir coast
Contact / WhatsApp sticky
```

### 1.5 What we must NOT copy

- Fake inventory “à vendre” we don’t mandate
- Fake client counts (+50 / +1500)
- National Morocco agency homepage
- “Conformité totale” as main pitch without process proof

---

## 2. Product & pricing (locked for phase 1)

| Item | Decision |
|------|----------|
| Product | Full STR management (listing, messages, check-in/out, cleaning coord, pricing) |
| Fee | **25%** of booking revenue + **ménage separate** (Nesty-style) |
| Cleaning | Separate / pass-through (not inside the 25%) |
| Geography | **Agadir → Imi Ouaddar** (Hay Mohammadi + Tamraght / Taghazout / Aourir) |
| Property type | 1–2 BR furnished apartments first |
| Public face | **Hamza only** (no Youness on site); WhatsApp = Hamza |
| Sales / villas / fermes | **After** 3 managed units |

---

## 3. Domains & tech (aligned)

| Domain | Builder | Job |
|--------|---------|-----|
| **greatimmob.ma** | WordPress + Elementor (Novamira MCP) | Main conciergerie site |
| **greatimmob.com** | Next.js in `website-com/` → GitHub → Vercel | Owner funnel / ads landing |
| Scraper | Python in this repo | Lead list for Hamza |
| CRM | Google Sheet (existing) | Status: new → contacted → signed |

**Budget rule:** no new VPS / no paid stack unless required. Reuse current hosting.

---

## 4. Skills & connectors — creative stack (UI/UX, motion, images, video)

Nesty-level sites need **design craft + motion + real photos**, not more MCPs. Remotion / heavy video is for **ads later**, not for the MVP website.

### 4.1 What “like Nesty” actually needs

| Layer | Purpose | Skill / tool type |
|-------|---------|-------------------|
| **UI / UX** | Layout, hierarchy, spacing, anti-AI-slop design | Frontend-design / Impeccable |
| **Brand tokens** | Colors, type, buttons consistent on `.ma` + `.com` | Design skill + project rule |
| **Motion (web)** | Subtle scroll / hover (not cinema) | GSAP or Framer Motion (already on `.com`) |
| **Image generation** | Hero / section art when you lack photos | Higgsfield / Cursor GenerateImage |
| **Real photography** | Apartment, team, Agadir — **beats AI** | Phone + Airbnb photos (manual) |
| **Dynamic UI** | Simulator, forms, WhatsApp deep links | Next.js code (already) / Elementor |
| **Video (Remotion)** | Reels / ads / owner pitch MP4 | Remotion skill — **Phase F / marketing** |
| **WordPress edit** | Apply design on `.ma` | Novamira (have) |
| **Visual QA** | Compare to Nesty in browser | cursor-ide-browser (have) |

### 4.2 Already on this machine (use / enable)

| Skill / plugin | Path / name | Use for GreatImmob |
|----------------|-------------|--------------------|
| **Higgsfield** `generate-image` | Cursor plugin cache | AI images / posters / section visuals |
| **Higgsfield** `generate-video` | Cursor plugin cache | Short AI videos if plugin enabled |
| **Cursor `GenerateImage`** | Built-in tool | Quick stills when asked |
| **GSAP pack** | `~/.claude/skills/gsap-*` | Scroll / timeline motion on `.com` |
| **Framer Motion** | Already in `website-com` | Page animations (no new skill) |
| **Novamira MCP** | Project MCP | Apply UI on WordPress/Elementor |
| **Browser MCP** | Built-in | Live UI/UX audit vs Nesty |

### 4.3 YOU must install manually (priority order)

Install into **this project** (`.cursor/skills/` or Cursor Skills UI). Prefer project scope so SAHRI stays separate.

#### P0 — install before we redesign the site

| Skill | What it is | How to get it | Checklist |
|-------|------------|---------------|-----------|
| **Impeccable** (UI/UX + frontend-design) | Design system for agents: hierarchy, typography, anti-generic UI, `/audit` | [impeccable.style](https://impeccable.style) or `npx impeccable install` in project root | [ ] |
| **Agent Skills enabled** | Cursor must load skills | Settings → Beta → Nightly if needed; Settings → Rules → enable Agent Skills | [ ] |
| Confirm **Higgsfield** plugin enabled | Image (+ video) generation | Cursor Settings → Plugins → Higgsfield ON + auth if asked | [ ] |

#### P1 — motion / polish (same week as redesign)

| Skill | What it is | How to get it | Checklist |
|-------|------------|---------------|-----------|
| **GSAP skills** | Already on disk under Claude skills — enable/copy into Cursor project skills if agent doesn’t auto-see them | Copy or symlink `gsap-core`, `gsap-react`, `gsap-scrolltrigger` into `.cursor/skills/` | [ ] |
| **frontend-design** (Anthropic / via Impeccable) | Distinctive landing aesthetics | Comes with Impeccable OR search Cursor Skills for `frontend-design` | [ ] |

#### P2 — marketing video (after site is live — optional)

| Skill | What it is | How to get it | Checklist |
|-------|------------|---------------|-----------|
| **Remotion official skills** | Programmatic React → MP4 (owner ads, proof reels) | [github.com/remotion-dev/skills](https://github.com/remotion-dev/skills) — e.g. `npx skills add` / docs “agent skills” | [ ] |
| **Remotion skill pack** (alt) | Spec → video helpers | [isatimur/remotion-skill-pack](https://github.com/isatimur/remotion-skill-pack) `npx @remotion-skill-pack/install cursor` | [ ] |
| Remotion **license** note | Free for personal; company automation may need paid | remotion.dev pricing | [ ] Decide later |

**Do not install Remotion yet** unless you want ads this month. Website first.

#### P3 — nice-to-have (skip for MVP)

| Skill / connector | Why skip now |
|-------------------|--------------|
| Figma MCP | We design in code/Elementor, not Figma |
| Midjourney Discord bot | Higgsfield + phone photos enough |
| Lottie / Rive skill | Overkill for Nesty-style calm site |
| 3D / Spline | Not Nesty’s look |

### 4.4 Connectors (infra — not design skills)

| Priority | Connector | Why | Checklist |
|----------|-----------|-----|-----------|
| P0 | **Novamira** project-only | Edit `.ma` | [x] Connected |
| P1 | **Vercel** dashboard / login | Confirm `.com` deploy | [ ] |
| P1 | **GitHub** `Valk15/great-immob` | Push website | [x] Git works |
| P2 | `gh` CLI | PRs | [ ] Optional |
| P2 | Google Sheets MCP | Leads in chat | [ ] Optional — Python OK |
| P3 | Cal.com | 15‑min booking like Nesty | [ ] Optional — WhatsApp first |

### 4.5 Manual “go install” list for you (copy this)

Do these, then reply **“skills ready”**:

1. [x] Enable **Agent Skills** in Cursor (Rules / Beta Nightly if required)
2. [x] Install **Impeccable** in `GREATIMMOB` (`npx impeccable install` or download Cursor bundle)
3. [ ] Enable **Higgsfield** plugin (image gen) and test one image
4. [ ] (Optional) Copy **GSAP** skills into `.cursor/skills/` if not visible
5. [ ] **Do not** install Remotion until Phase F (ads)
6. [ ] Prepare **real photos**: apartment interior, building, Hamza (or logo) — AI is backup only
7. [x] Proof numbers for UI: Airbnb rating, occupancy %, WhatsApp number to publish
8. [x] Run `/impeccable init` → `PRODUCT.md` written
9. [ ] Enable **Higgsfield** if image gen needed later
10. [ ] (Optional) Remotion only in Phase F

### 4.6 What we will use when (so we don’t overbuild)

| Phase | Skills in play |
|-------|----------------|
| **B — Copy** | None special — strategy MD |
| **C/D — Site UI** | Impeccable + frontend-design + Novamira + Browser + Higgsfield (if missing assets) + Framer Motion/GSAP lightly |
| **E — Leads** | Scraper only |
| **F — Ads / Reels** | Remotion + Higgsfield video + real Superhost footage |

---

## 4b. Legacy note (connectors only)

Previous connector-focused section is merged above into **§4.4**.
---

## 5. Site information architecture (target)

### 5.1 greatimmob.ma (WordPress)

| Page | Action |
|------|--------|
| Accueil | Rewrite → conciergerie homepage |
| Gestion / Formule | New or rewrite → include % + what’s included |
| Zones (Agadir, Taghazout, …) | Add thin geo pages like Nesty |
| Preuve / Notre bien | Case study Hay Mohammadi |
| Équipe | Hamza + Youness |
| Blog | Keep STR/Agadir posts; unpublish agency fluff if any |
| Contact | WhatsApp primary |
| Listings “à vendre / à louer” catalog | **Hide / draft / delete** |

### 5.2 greatimmob.com (Next.js)

| Block | Action |
|-------|--------|
| Hero | Align to gestion locative Agadir/coast (honest) |
| Stats | Only verifiable (rating, occ, Superhost) |
| Simulator / form | Keep → WhatsApp + Sheet |
| Legal / conformité | Secondary section, not fake authority |
| CTA | Hamza WhatsApp |

---

## 6. Master work checklist (step by step)

### Phase A — Foundation (this week)

- [x] Define business: STR gestion locative only (Agadir coast)
- [x] Isolate Novamira MCP in GREATIMMOB project folder
- [x] Consolidate repos into `GREATIMMOB/` (`website-com` + scraper)
- [x] Competitor analysis (Nesty / Locaga / Agadir-Conciergerie)
- [x] Write this `STRATEGY_CHECKLIST.md`
- [x] Map creative skills needed (UI/UX, image gen, motion, Remotion later)
- [x] Install Impeccable into project `.cursor/skills/`
- [x] `/impeccable init` → write `PRODUCT.md` (users, fee model, Hamza-only brand, Airbnb proof)
- [ ] You: complete **§4.5** remaining (Higgsfield + Agent Skills on if not already)
- [ ] Clarify ops hours string before publishing 7j/7 claims
- [ ] You: collect real apartment photos for sites (listing photos OK with rights)

### Phase B — Brand & content

- [x] Brand DNA written (`BRAND_DNA.md`) — Atlantic Ledger luxury
- [x] Design system (`DESIGN.md`)
- [x] Logo lockup chosen + heavier v2 saved as primary (`brand/logos/greatimmob-logo-lockup.png`)
- [x] Write homepage copy FR (honest, Nesty-level clarity) — live on Accueil
- [x] Write offer page (what’s included / 25% + cleaning / exclusions) — live `/formule/`
- [x] Write 1 case study (Hay Mohammadi / Airbnb proof) — live `/preuve/` + Accueil gallery
- [x] Write FAQ (5–8 questions) — Accueil + FAQPage schema
- [ ] Decide which blog posts stay / go — **urgent**: old blog still ranks with outdated/agency claims
- [ ] Hamza outreach script (agents + scraped Airbnb weak hosts)
- [x] You: collect real apartment photos — Hay Mohammadi Airbnb photos live on site

### Phase C — Rebuild greatimmob.ma (WordPress via Novamira)

- [x] Inventory pages/menus
- [x] **Theme switched:** Houzez → **Hello Elementor** (lightweight)
- [x] **Deleted Houzez theme** + all Houzez plugins / RevSlider / demo import / GTranslate / Meta pixel / etc.
- [x] **Deleted all listings** + agencies/agents/testimonials/partners/packages
- [x] Deleted junk portal pages
- [x] Menu: Accueil / À Propos / Actualités / Contact
- [x] Active stack left: Elementor (+Pro), Novamira, Rank Math, LiteSpeed, WhatsApp Click-to-Chat, Code Snippets, Site Mailer
- [x] Upload lockup logo to Media Library + Site Identity
- [x] Clear Elementor homepage → rebuild Atlantic Ledger conciergerie page
- [x] Polylang FR / EN / AR + language switcher on Accueil
- [x] SEO/AEO/GEO: Rank Math titles, `llms.txt`, `ai.txt`, `robots.txt`, `seo-indexation.txt`, LocalBusiness + FAQ JSON-LD
- [x] Build formule / services page (dedicated) — `/formule/` + `/conciergerie/`
- [x] Build preuve page (Airbnb Superhost) — `/preuve/` with real photos
- [x] Multi-page IA (menu → real pages, not landing anchors)
- [ ] Build équipe (**Hamza only**) + contact polish — `/apropos/` + `/nous-contacter/` still old copy
- [x] Fix Acceuil → Accueil typo
- [x] Mobile QA (pass 2) — v3 chrome: drawer nav, sticky WA, spacing, motion
- [ ] Soft claims audit — **old blog posts still indexed with inflated claims**
- [ ] Submit updated sitemap in Google Search Console + monitor traffic

### Phase D — Align greatimmob.com

- [ ] Update hero + stats to match Phase B copy
- [ ] Restrict geography wording to Agadir coast (not “tout le Maroc”)
- [ ] Verify Google Apps Script / Sheet still receives leads
- [ ] `npm install` in `website-com` when editing locally
- [ ] Commit + push to GitHub → confirm Vercel deploy

### Phase E — Lead machine (scraper → Hamza)

- [ ] Confirm Sheet columns match ops workflow
- [ ] Run pipeline weekly (Airbnb priority leads first)
- [ ] Hamza: 15–20 owner contacts / week target
- [ ] Track: contacted → visit → signed

### Phase F — Scale to 8–10k MAD/mo

- [ ] Sign unit #2
- [ ] Sign unit #3
- [ ] Monthly reporting template for owners (PDF/Sheet)
- [ ] Revisit fee 25% vs 20% when portfolio ≥ 3
- [ ] Only then: villa / sale / buy-to-rent add-ons

---

## 7. Working rules for the agent (Cursor)

1. Read this file before each work session; update checkboxes when done.
2. Prefer **Novamira** for `.ma`, **code edits** for `website-com/`.
3. Never put GreatImmob MCP credentials in global Cursor config.
4. Never invent client counts, revenue %, or licenses.
5. Agency sales content stays **off** public sites until Phase F.
6. One step at a time — finish Phase A leftovers before Phase C design.

---

## 8. Next action (default)

**Where we are (2026-08-05):** Phase A–C mostly done on `.ma` (multi-page live). SEO foundation online; new URLs now in Rank Math sitemap. Traffic/indexation still dominated by **old agency/blog URLs** — Google has not yet ranked `/conciergerie/`, `/formule/`, `/zones/`, `/preuve/` as primary results.

**Do next (priority):**
1. Google Search Console: submit `https://greatimmob.ma/sitemap_index.xml` + request indexing for the 4 new pages.
2. Soft claims / junk cleanup: noindex or rewrite old blog + `/agency/` + `/proprietes/` leftovers that still rank.
3. Polish `/apropos/` + `/nous-contacter/` (Hamza-only, WhatsApp).
4. Then Phase D (`.com`) and Phase E (scraper → Hamza outreach).

---

*Last updated: 2026-08-05*

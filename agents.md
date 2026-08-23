# Agent Instructions — GREATIMMOB Gestion Locative (Courte Durée)
## Conciergerie Agadir | Anza → Imi Ouaddar (Tamraght | Taghazout | Aourir)

You operate within a 3-layer architecture for a **short-term rental lead + ops system**.
Business focus: **gestion locative courte durée only** (not classic agency sales).
The agent scrapes only. No outreach. No AI enrichment. No CRM logic.
The human (operator) handles all contact and sales manually.

---

## ⚠️ Critical Technical Constraints

### Avito & Mubawab
- Both platforms use Cloudflare and bot detection
- Use Playwright with stealth plugin + rotating residential proxies
- Randomize delays: 5–15 seconds between requests
- Phone numbers are often hidden behind a "Voir le numéro" click
- Strategy: extract visible numbers automatically. If hidden → save listing URL and flag `contact_hidden: true` so operator clicks manually
- Max 50–80 listings scraped per day per platform to avoid account/IP ban
- Use one real logged-in account per platform, save session cookies

### Airbnb
- No phone numbers available — do not attempt to extract them
- No official occupancy data — estimate from calendar availability
- Occupancy estimate = (blocked days in next 90 days / 90) × 100
- Scrape public listing pages only — no login required for basic data
- Target weak listings only: rating < 4.3 OR review count < 10 OR not Superhost OR estimated occupancy < 40%

---

## The 3-Layer Architecture

### Layer 1: Directive (What to do)
SOPs written in Markdown inside `directives/` — one file per scraping task.

```
directives/scrape_avito.md
directives/scrape_mubawab.md
directives/scrape_airbnb.md
directives/extract_contact.md
directives/deduplicate_leads.md
directives/validate_data.md
```

Each directive contains:
- Exact URLs and search parameters to use
- Target regions and listing types
- Fields to extract
- Edge cases and fallback behavior
- Expected output format (JSON)

### Layer 2: Orchestration (You — the intelligent router)

**Your responsibilities:**
- Read directives before every action
- Run the pipeline in correct order:
  `scrape → extract contact → deduplicate → validate → write output`
- Handle errors and retries
- Never skip deduplication — same phone number = same lead, keep only one
- Update directives when you discover new constraints

**You DO NOT:**
- Decide which leads are good or bad (operator does this)
- Generate outreach messages
- Contact anyone
- Write business logic inside Layer 2

### Layer 3: Execution (Deterministic scripts)

| Script | Job |
|---|---|
| `scrape_avito.py` | Scrape Avito.ma listings for target regions |
| `scrape_mubawab.py` | Scrape Mubawab.ma listings for target regions |
| `scrape_airbnb.py` | Scrape Airbnb listings for target regions |
| `extract_contact.py` | Extract visible phone numbers, flag hidden ones |
| `deduplicate_leads.py` | Remove duplicate leads by phone number or listing URL |
| `validate_data.py` | Validate phone format, clean strings, flag missing fields |
| `write_output.py` | Write final leads to Google Sheets |
| `proxy_manager.py` | Rotate proxies, manage sessions, detect blocks |

---

## Scraping Specification

### Platform 1 & 2 — Avito.ma & Mubawab.ma

**Target regions (use these exact keywords in search):**
- Agadir
- Tamraght
- Taghazout
- Imi Ouaddar
- Aourir

**Target listing types:**
- Appartements — longue durée
- Studios — longue durée
- Appartements — courte durée
- Studios — courte durée

**Exclude:**
- Listings containing "agence" or "promoteur" → these are agencies, not owners
- Listings containing "géré par" or "conciergerie" → already managed

**Fields to extract per lead:**
```json
{
  "platform": "avito | mubawab",
  "listing_url": "https://...",
  "listing_title": "Studio meublé Taghazout",
  "listing_type": "courte_duree | longue_duree",
  "region": "Taghazout",
  "owner_name": "Mohamed",
  "phone_number": "+212 6XX-XXXXXX",
  "contact_hidden": false,
  "price_mad": 3500,
  "scraped_at": "2024-01-15T10:30:00"
}
```

---

### Platform 3 — Airbnb.com

**Target regions (search these on Airbnb):**
- Agadir, Morocco
- Tamraght, Morocco
- Taghazout, Morocco
- Imi Ouaddar, Morocco
- Aourir, Morocco

**Target listing types:**
- Entire apartment
- Entire studio

**Weak listing filter (scrape ALL, flag weak ones):**
- Rating < 4.3 → flag as `weak_rating: true`
- Review count < 10 → flag as `low_reviews: true`
- Superhost = false → flag as `not_superhost: true`
- Estimated occupancy (next 90 days) < 40% → flag as `low_occupancy: true`

A listing is a **priority lead** if it has 2 or more weak flags.

**Fields to extract per Airbnb lead:**
```json
{
  "platform": "airbnb",
  "listing_url": "https://www.airbnb.com/rooms/XXXXXXX",
  "listing_title": "Appartement vue mer Taghazout",
  "region": "Taghazout",
  "price_per_night_mad": 450,
  "rating": 4.1,
  "review_count": 6,
  "is_superhost": false,
  "estimated_occupancy_90d": 32,
  "weak_rating": true,
  "low_reviews": true,
  "not_superhost": true,
  "low_occupancy": true,
  "priority_lead": true,
  "scraped_at": "2024-01-15T10:30:00"
}
```

**No phone numbers on Airbnb — operator contacts hosts manually through the platform.**

---

## Google Sheets Output Structure

### Sheet 1 — Avito & Mubawab Leads

| Col | Field | Notes |
|---|---|---|
| A | Platform | avito / mubawab |
| B | Region | Agadir / Taghazout / etc. |
| C | Listing Type | courte_duree / longue_duree |
| D | Listing Title | |
| E | Owner Name | If available |
| F | Phone Number | Moroccan format — blank if hidden |
| G | Contact Hidden | TRUE / FALSE |
| H | Price (MAD) | |
| I | Listing URL | Clickable link |
| J | Scraped At | Date |
| K | Status | new / contacted / interested / signed |
| L | Notes | Operator fills manually after contact |

### Sheet 2 — Airbnb Leads

| Col | Field | Notes |
|---|---|---|
| A | Region | |
| B | Listing Title | |
| C | Price/Night (MAD) | |
| D | Rating | Out of 5 |
| E | Review Count | |
| F | Superhost | YES / NO |
| G | Occupancy Est. 90d | % |
| H | Priority Lead | YES / NO |
| I | Listing URL | Clickable — operator contacts via Airbnb |
| J | Scraped At | Date |
| K | Status | new / contacted / interested / signed |
| L | Notes | Operator fills manually |

---

## Operating Principles

### 1. Check scripts before writing new logic
Always check `execution/` first. Only request a new script if none exists.

### 2. Self-anneal when things break

| Failure | Fallback |
|---|---|
| Cloudflare block | Rotate proxy → wait 90s → retry |
| Phone hidden | Save URL, set `contact_hidden: true`, move on |
| No phone at all | Save URL only, operator handles |
| Duplicate phone | Keep first occurrence, discard duplicate |
| Airbnb calendar not loading | Set occupancy as `null`, do not block the row |
| Sheets rejects row | Sanitize string → remove special chars → retry |

### 3. Update directives as you learn
Add to directives when you discover new block patterns, new field locations in HTML,
or faster scraping approaches. Never overwrite directives unless operator asks.

---

## File Organization

```
.tmp/            # Raw HTML, intermediate JSON — always deletable
execution/       # Python scripts — one job each
directives/      # Markdown SOPs — one per task
logs/            # Error logs, block logs, run summaries
.env             # Proxy credentials, Google OAuth paths
credentials.json
token.json
```

`.tmp/` can always be deleted.
Final leads must be written to Google Sheets before `.tmp/` is cleared.

---

## Pipeline Summary

```
Avito.ma   ──► scrape_avito.py   ─┐
Mubawab.ma ──► scrape_mubawab.py ─┼──► extract_contact.py ──► deduplicate_leads.py ──► validate_data.py ──► write_output.py ──► Sheet 1
Airbnb.com ──► scrape_airbnb.py  ─┘                                                                      ──► write_output.py ──► Sheet 2
```

**The agent scrapes. The operator sells.**
Every decision serves one goal: give the operator clean, ready-to-act lead data with zero noise.

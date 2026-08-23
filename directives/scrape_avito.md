# Scrape Avito.ma — Directive SOP

> **Agent role:** Scrape only. No outreach, no AI enrichment.
> The operator handles all contact and sales manually.

---

## Target Regions

| Region | Avito Slug | Type |
|---|---|---|
| Agadir | `agadir` | Direct city slug |
| Taghazout | `taghazout` | Direct city slug |
| Aourir | `aourir` | Direct city slug |
| Tamraght | `agadir` + filter `à_tamraght` | Sub-region of Agadir |
| Imi Ouaddar | `agadir` + filter `à_imi_ouaddar` | Sub-region of Agadir |

---

## Target Listing Types

| Property | Duration | Avito Category Slug |
|---|---|---|
| Appartements | Longue durée | `appartements-à_louer` |
| Appartements | Courte durée | `location_de_vacances_-_journalière` |
| Studios | Longue durée | `appartements-à_louer` (filter by "studio" in title) |
| Studios | Courte durée | `location_de_vacances_-_journalière` (filter by "studio" in title) |
| Villas | Longue durée | `villas_et_riads-à_louer` |
| Villas | Courte durée | `location_de_vacances_-_journalière` (filter by "villa" in title) |

> **Note:** Avito does not always have separate URL slugs for studios — they often appear
> under `appartements-à_louer`. The script must check listing titles for "studio" to
> classify correctly. Similarly, villas in courte durée appear under the general
> vacation rental category.

---

## Search URL Patterns

### Direct city slugs (Agadir, Taghazout, Aourir)

```
https://www.avito.ma/fr/{region_slug}/{category_slug}
```

**Examples:**
```
https://www.avito.ma/fr/agadir/appartements-à_louer
https://www.avito.ma/fr/taghazout/villas_et_riads-à_louer
https://www.avito.ma/fr/aourir/location_de_vacances_-_journalière
```

### Sub-region slugs (Tamraght, Imi Ouaddar)

```
https://www.avito.ma/fr/agadir/{category_slug}/à_{sub_region}
```

**Examples:**
```
https://www.avito.ma/fr/agadir/appartements-à_louer/à_tamraght
https://www.avito.ma/fr/agadir/villas_et_riads-à_louer/à_imi_ouaddar
```

### Pagination

Avito uses `?o={page}` for pagination (page 1 = `?o=1`, page 2 = `?o=2`, etc.).

```
https://www.avito.ma/fr/agadir/appartements-à_louer?o=2
```

---

## Fields to Extract Per Listing

```json
{
  "platform": "avito",
  "listing_url": "https://www.avito.ma/fr/.../Listing_Title_12345678.htm",
  "listing_title": "Appartement meublé Taghazout",
  "listing_type": "courte_duree | longue_duree",
  "property_type": "appartement | studio | villa",
  "region": "Taghazout",
  "owner_name": "Mohamed",
  "phone_number": "+212 6XX-XXXXXX",
  "contact_hidden": false,
  "price_mad": 3500,
  "scraped_at": "2026-02-18T12:35:00"
}
```

### Field Notes

| Field | Source | Notes |
|---|---|---|
| `listing_url` | Listing card `<a href>` | Always available |
| `listing_title` | Listing card title text | Always available |
| `listing_type` | Derived from category slug | `location_de_vacances` → courte_duree, else longue_duree |
| `property_type` | Derived from title keywords | Check for "studio", "villa", default to "appartement" |
| `region` | Known from search URL | Passed to script as parameter |
| `owner_name` | Seller name on listing card | Sometimes an agency name — check exclusion rules |
| `phone_number` | Detail page — often hidden | Extracted by `extract_contact.py`, not this script |
| `contact_hidden` | Detail page | Set by `extract_contact.py` |
| `price_mad` | Listing card price | Parse number, strip "DH" suffix |
| `scraped_at` | Script runtime | ISO 8601 format |

> **Important:** This scraper extracts data from listing cards on the search results
> page. Phone number extraction happens separately in `extract_contact.py` which
> visits each individual listing page.

---

## Exclusion Rules

**Skip any listing where the title OR seller name contains (case-insensitive):**

| Keyword | Reason |
|---|---|
| `agence` | Agency listing, not an owner |
| `promoteur` | Real estate developer |
| `géré par` | Already managed by a conciergerie |
| `conciergerie` | Already managed |
| `immobilier` | Likely an agency (e.g. "Opera Immobilier") |
| `immobilière` | Likely an agency (e.g. "Immobilière D'Agadir") |

> **Note:** The keyword `immobilier` / `immobilière` in the **seller name** is a strong
> signal of an agency. Many real Avito agencies use names like "Bien Chez Vous Immobilier",
> "AZ Immobilier", "Opera Immobilier". These should be excluded.

---

## Anti-Bot & Cloudflare Strategy

1. **Playwright with stealth plugin** — Use `playwright-stealth` to mask
   automation signals (WebDriver flag, plugins, languages)
2. **Random delays** — Wait 5–15 seconds between each page load
3. **Session cookies** — Save and reuse a real logged-in session to look human
4. **User-Agent rotation** — Rotate between 5+ real Chrome user-agent strings
5. **No headless initially** — Run headed during development to debug Cloudflare challenges

### Cloudflare Block Fallback

| Step | Action |
|---|---|
| 1 | Detect block (HTTP 403, challenge page, CAPTCHA) |
| 2 | Rotate proxy (when proxy_manager is available) |
| 3 | Wait 90 seconds |
| 4 | Retry the same URL |
| 5 | If blocked 3 times → log error, skip URL, move to next |

---

## Rate Limiting

- **Max 50 listings scraped per day** (across all regions and categories)
- Counter stored in `.tmp/avito_daily_count.json` with date key
- If daily limit reached → stop gracefully, log "Daily limit reached"
- Reset counter at midnight (or on new date)

---

## Output

- Raw scraped data written to: `.tmp/avito_raw.json`
- One JSON object per listing, appended to array
- Downstream pipeline: `extract_contact.py` → `deduplicate_leads.py` → `validate_data.py` → `write_output.py`

---

## Edge Cases

| Situation | Behavior |
|---|---|
| Price shows "Demander le prix" | Set `price_mad: null` |
| No seller name visible | Set `owner_name: null` |
| Listing title in Arabic | Keep as-is, do not translate |
| Duplicate listing across pages | Handled by `deduplicate_leads.py` |
| Empty search results for a region | Log warning, move to next region |
| Pagination ends | Stop when no listing cards found on page |

---

## Lessons Learned (2026-08-06)

### Search card layout (current Avito)
Cards no longer put seller name first. Typical text order:
`title → rooms/m² → price → DH → city → il y a …`
Price is often on its own line above `DH`. Do **not** allow newlines inside the price capture group (avoids gluing "Étage 1" + "1 400" → 11400).

### Photo filter
Avito lazy-loads images (`data-src` / empty `src`). Hard "no photo" exclusion was wiping almost all cards — soft-pass unless an explicit no-photo placeholder is detected.

### Neighborhood URL slugs (Agadir)
Search `…/fr/agadir/…` returns cards whose href uses neighborhood slugs (`haut_founty`, `hay_mohammadi`, `marina`, `illigh`, …) — **not** `/agadir/` in the path. Zone filters must not require `/agadir/` in the listing URL.

### Detail pages + Cloudflare
List search often works headless; **detail pages** frequently stay on CF challenge. Fallback: keep URL, set `contact_hidden: true`, operator clicks "Voir le numéro" manually. Shorten CF retry wait (~25s) — 90s burns the daily session.

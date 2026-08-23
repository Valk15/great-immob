# Scrape Airbnb.com — Directive SOP

> **Agent role:** Scrape only. No outreach, no AI enrichment.
> **No phone numbers on Airbnb** — operator contacts hosts manually through the platform.

---

## Target Regions

| Region | Search Query | Place ID |
|---|---|---|
| Agadir | `Agadir, Morocco` | Auto-resolved by Airbnb |
| Tamraght | `Tamraght, Morocco` | Auto-resolved by Airbnb |
| Taghazout | `Taghazout, Morocco` | Auto-resolved by Airbnb |
| Imi Ouaddar | `Imi Ouaddar, Morocco` | Auto-resolved by Airbnb |
| Aourir | `Aourir, Morocco` | Auto-resolved by Airbnb |

---

## Target Listing Types

| Property Type | Airbnb Filter |
|---|---|
| Entire Apartment | `room_types[]=Entire home/apt` |
| Entire Studio | Same filter (studios appear under "Entire home/apt") |
| Entire Villa | Same filter (villas appear under "Entire home/apt") |

> **Note:** Airbnb groups apartments, studios, and villas under the single filter
> "Entire home/apt". The script classifies property type from listing title keywords.

---

## Search URL Pattern

```
https://www.airbnb.com/s/{query}/homes?refinement_paths[]=/homes&room_types[]=Entire home/apt&items_per_grid=18&query={query}&search_type=filter_change&tab_id=home_tab
```

### Pagination

Airbnb uses cursor-based pagination. The script scrolls to load more listings or
clicks "Show more" / "Next" to advance through results. Alternatively, pagination
can be driven by the `items_offset` URL parameter:

```
&items_offset=0    (page 1 — first 18 results)
&items_offset=18   (page 2 — next 18 results)
&items_offset=36   (page 3)
```

---

## Fields to Extract Per Listing

```json
{
  "platform": "airbnb",
  "listing_url": "https://www.airbnb.com/rooms/XXXXXXX",
  "listing_title": "Appartement vue mer Taghazout",
  "property_type": "appartement | studio | villa",
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
  "scraped_at": "2026-02-18T14:43:00"
}
```

---

## Two-Phase Scraping

### Phase 1 — Search Results (listing cards)

From search result pages, extract per card:
- `listing_url` — href of the listing card link (contains `/rooms/{id}`)
- `listing_title` — title text on the card
- `price_per_night_mad` — nightly price displayed on the card
- `rating` — star rating (if shown on card)
- `review_count` — number of reviews (if shown on card)
- `is_superhost` — Superhost badge visible on card

### Phase 2 — Listing Detail Pages (calendar + missing data)

For each listing, visit the detail page to:
- Confirm/fill `rating` and `review_count` if not available from card
- Check for `Superhost` badge if not visible on card
- **Extract calendar data** for occupancy estimation

---

## Occupancy Estimation

**Method:** Count blocked (unavailable) days in the listing's calendar for the
next 90 days from scrape date.

```
estimated_occupancy_90d = (blocked_days / 90) * 100
```

### Calendar Implementation

Airbnb's calendar is rendered as a monthly grid. The script must:

1. Open the listing detail page
2. Locate the calendar section (availability widget)
3. Count days that are **blocked/unavailable** (greyed out, crossed, unclickable)
4. Navigate forward through months until 90 days from today are covered
5. Calculate: `blocked_days / 90 * 100`

### Calendar Selectors (may change — update directive if broken)

- Calendar container: `[data-testid="availability-calendar"]` or `[data-section-id="AVAILABILITY_DEFAULT"]`
- Blocked days: `td[aria-disabled="true"]`, `button[disabled]`, or cells with strikethrough/grey styling
- Available days: `td[aria-disabled="false"]`, clickable date buttons
- Navigation arrows: `[aria-label="Move forward"]`, `[aria-label="Next"]`

> **Fallback:** If calendar fails to load or is not rendered, set
> `estimated_occupancy_90d: null`. Do not block the row.

---

## Weak Listing Flags

| Flag | Condition | Field |
|---|---|---|
| Weak rating | `rating < 4.3` | `weak_rating: true` |
| Low reviews | `review_count < 10` | `low_reviews: true` |
| Not Superhost | `is_superhost == false` | `not_superhost: true` |
| Low occupancy | `estimated_occupancy_90d < 60` | `low_occupancy: true` |

**Priority lead:** A listing with **2 or more** weak flags → `priority_lead: true`

---

## Property Type Classification

Derived from listing title (case-insensitive):

| Keywords | Property Type |
|---|---|
| `studio` | `studio` |
| `villa`, `riad`, `maison`, `house`, `dar` | `villa` |
| Everything else | `appartement` |

---

## Rate Limiting

- **No login required** — public listing pages only
- Random delay of **3–8 seconds** between search page loads
- Random delay of **5–12 seconds** between detail page visits
- Max **100 listings** per scraping session (search cards collected)
- Max **40 detail page visits** per session (for calendar data)
- If rate limited or blocked → wait 120s → retry once → skip

---

## Output

- Raw data written to: `.tmp/airbnb_raw.json`
- One JSON object per listing
- Downstream: `deduplicate_leads.py` → `validate_data.py` → `write_output.py` → Sheet 2

---

## Edge Cases

| Situation | Behavior |
|---|---|
| Calendar not loading | Set `estimated_occupancy_90d: null`, continue |
| No rating shown | Set `rating: null`, `weak_rating: null` |
| No review count | Set `review_count: 0`, `low_reviews: true` |
| Price in USD/EUR | Convert to MAD using a hardcoded rate (10 MAD/USD, 11 MAD/EUR) or store as-is with currency note |
| Price shows "total" not per night | Parse carefully — look for "/night" indicator |
| Search returns 0 results | Log warning, move to next region |
| Listing page 404 | Skip, log error |
| Airbnb CAPTCHA/challenge | Wait 120s → retry → skip on second failure |
| New/unlisted property (no reviews) | Set `rating: null`, `review_count: 0` |

---

## CLI Usage

```bash
# Scrape all regions
py execution/scrape_airbnb.py

# Scrape one region
py execution/scrape_airbnb.py --region taghazout

# Dry run — show URLs
py execution/scrape_airbnb.py --dry-run

# Skip calendar phase (search cards only, no occupancy)
py execution/scrape_airbnb.py --skip-calendar

# Headless mode
py execution/scrape_airbnb.py --headless
```

# Extract Contact Information — Directive SOP

> **Scope:** Avito.ma and Mubawab.ma only. Airbnb has no phone numbers.
> **Agent role:** Extract phone numbers from listing detail pages. Never crash. Always output a valid JSON row.

---

## How It Works

This script receives a **list of listing URLs** (from `scrape_avito.py` or `scrape_mubawab.py` output).
For each URL, it visits the individual listing page and attempts to extract a phone number.

### Pipeline position

```
scrape_avito.py / scrape_mubawab.py → .tmp/avito_raw.json or .tmp/mubawab_raw.json
                                          ↓
                                   extract_contact.py    ← THIS SCRIPT
                                          ↓
                               .tmp/avito_enriched.json or .tmp/mubawab_enriched.json
```

---

## Target Property Types

- Appartements (courte durée & longue durée)
- Studios (courte durée & longue durée)
- Villas (courte durée & longue durée)

---

## Extraction Strategy

### Step 1 — Scan visible HTML for phone numbers

After loading the listing page with Playwright, scan the **full page text content** for
Moroccan phone number patterns using regex:

```
Moroccan mobile:  0[5-7]\d{8}          → 06XXXXXXXX, 07XXXXXXXX, 05XXXXXXXX
International:    \+212[5-7]\d{8}      → +2126XXXXXXXX
Spaced:           0[5-7] \d{2} \d{2} \d{2} \d{2}  → 06 XX XX XX XX
Dashed:           0[5-7]-\d{2}-\d{2}-\d{2}-\d{2}  → 06-XX-XX-XX-XX
Dotted:           0[5-7].\d{2}.\d{2}.\d{2}.\d{2}  → 06.XX.XX.XX.XX
```

If a valid phone number is found:
- Set `phone_number` to the normalized number (format: `+212 6XX-XXXXXX`)
- Set `contact_hidden` to `false`

### Step 2 — Check for "Voir le numéro" button

If no phone found in visible HTML, check for the presence of a phone reveal button:

**Avito patterns:**
- Button text: `Voir le numéro`, `Appeler`, `Afficher le numéro`
- CSS selectors to check: `button`, `[data-testid]`, `a[href^="tel:"]`

**Mubawab patterns:**
- Button text: `Voir téléphone`, `Afficher le numéro`, `Appeler`
- CSS selectors to check: `button`, `.phone-button`, `a[href^="tel:"]`

If a reveal button exists:
- **DO NOT click it** — this avoids triggering anti-bot detection
- Set `phone_number` to `null`
- Set `contact_hidden` to `true`
- The operator will click manually later

### Step 3 — No phone at all

If no phone found AND no reveal button detected:
- Set `phone_number` to `null`
- Set `contact_hidden` to `null` (unknown)
- Log a warning but **do not crash**

---

## Phone Number Normalization

All extracted numbers must be normalized to the format: `+212 6XX-XXXXXX`

| Input | Normalized Output |
|---|---|
| `0661234567` | `+212 661-234567` |
| `+212661234567` | `+212 661-234567` |
| `06 61 23 45 67` | `+212 661-234567` |
| `06-61-23-45-67` | `+212 661-234567` |
| `06.61.23.45.67` | `+212 661-234567` |

---

## Output Format

The script enriches the existing raw JSON entries by adding/updating these fields:

```json
{
  "phone_number": "+212 661-234567",
  "contact_hidden": false
}
```

If phone not found:
```json
{
  "phone_number": null,
  "contact_hidden": true
}
```

---

## Rate Limiting & Anti-Bot

- Random delay of **5–15 seconds** between each listing page visit
- Use the same Playwright stealth context as the scraper
- Do not attempt more than **30 detail page visits per session**
- If Cloudflare blocks → wait 90s → retry once → skip on second failure

---

## Edge Cases

| Situation | Behavior |
|---|---|
| Page returns 404 | Log warning, set phone=null, contact_hidden=null, continue |
| Page times out | Retry once after 30s, then skip |
| Phone number is a landline (05XX) | Still extract — operator decides usefulness |
| Multiple phone numbers on page | Keep the first valid mobile number |
| Number in image (not text) | Cannot extract — treat as hidden |
| Cloudflare challenge | Wait 90s → retry → skip |
| Invalid/malformed number | Log warning, set phone=null |
| Page loads but has no content | Log warning, skip |

---

## Error Handling — NEVER CRASH

The pipeline must **never crash** because of a missing or unextractable phone number.
Every listing URL that enters this script must produce a valid JSON row in the output,
even if `phone_number` is `null`.

```
INPUT:  listing with URL → always produces → OUTPUT: enriched JSON row
NEVER:  crash, throw unhandled exception, skip without logging
```

---

## CLI Usage

```bash
# Process all leads from Avito raw output
py execution/extract_contact.py --input .tmp/avito_raw.json --output .tmp/avito_enriched.json

# Process Mubawab leads
py execution/extract_contact.py --input .tmp/mubawab_raw.json --output .tmp/mubawab_enriched.json

# Process a single URL for testing
py execution/extract_contact.py --url "https://www.avito.ma/fr/.../Listing_12345.htm"

# Dry run — show what would be processed
py execution/extract_contact.py --input .tmp/avito_raw.json --dry-run
```

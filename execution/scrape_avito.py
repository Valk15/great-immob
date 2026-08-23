"""
scrape_avito.py — Avito.ma Listing Scraper
==========================================
Layer 3 execution script.
Scrapes rental listing cards from Avito.ma search results pages.

Uses Playwright with stealth plugin for anti-detection.
No proxy integration yet — placeholder for proxy_manager.py.

Usage:
    python execution/scrape_avito.py                    # Scrape all regions & types
    python execution/scrape_avito.py --region agadir    # Scrape one region
    python execution/scrape_avito.py --dry-run          # Print URLs only, no scraping
"""

import asyncio
import json
import os
import random
import re
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')
import argparse
from datetime import datetime, date
from pathlib import Path

# ---------------------------------------------------------------------------
# Dependencies check
# ---------------------------------------------------------------------------
try:
    from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
except ImportError:
    print("ERROR: playwright is not installed. Run: pip install playwright && playwright install chromium")
    sys.exit(1)

try:
    from playwright_stealth import Stealth
except ImportError:
    print("ERROR: playwright-stealth is not installed. Run: py -m pip install playwright-stealth")
    sys.exit(1)

stealth = Stealth()


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent
TMP_DIR = PROJECT_ROOT / ".tmp"
OUTPUT_FILE = TMP_DIR / "avito_raw.json"
LOG_DIR = PROJECT_ROOT / "logs"

MAX_TOTAL_PER_RUN = 150   # Default total listings per run (distributed across URLs)
MIN_DELAY = 5   # seconds
MAX_DELAY = 15  # seconds

# ---------------------------------------------------------------------------
# Filter 2 — Improved agency exclusion
# ---------------------------------------------------------------------------
# Hard keywords: any occurrence in title OR seller name → exclude
AGENCY_KEYWORDS = [
    "agence", "promoteur", "gérance", "syndic", "cabinet",
    "immobilière", "conciergerie", "géré par",
]

# Regex patterns that catch company-name usage of "immobilier" in seller name
AGENCY_NAME_PATTERNS = [
    re.compile(r"\bimmo\b", re.IGNORECASE),
    re.compile(r"immo\b", re.IGNORECASE),                 # "Chahidimmo", "FADL IMMO"
    re.compile(r"\bimmobilier\s+\w+", re.IGNORECASE),   # "Immobilier Luxe"
    re.compile(r"\b\w+\s+immobilier\b", re.IGNORECASE), # "SAFIN Immobilier"
    re.compile(r"immobilier", re.IGNORECASE),
    re.compile(r"\bsarl\b", re.IGNORECASE),
    re.compile(r"\bs\.?a\.?r\.?l\b", re.IGNORECASE),
]

# Filter 3 — Minimum price thresholds (MAD)
MIN_PRICE_LONGUE_DUREE = 1500
MIN_PRICE_COURTE_DUREE = 250

# Filter 4 — Max listing age in days
MAX_LISTING_AGE_DAYS = 60

# Filter 5 — Max listings per seller per session
MAX_PER_SELLER = 3

# User-Agent rotation pool (real Chrome on Windows)
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
]

# ---------------------------------------------------------------------------
# Region & Category definitions
# ---------------------------------------------------------------------------
# All 5 target cities — each has its own Avito URL slug
REGIONS = {
    "agadir":      {"slug": "agadir",      "label": "Agadir"},
    "taghazout":   {"slug": "taghazout",   "label": "Taghazout"},
    "tamraght":    {"slug": "tamraght",    "label": "Tamraght"},
    "imi_ouaddar": {"slug": "imi_ouaddar", "label": "Imi Ouaddar"},
    "aourir":      {"slug": "aourir",      "label": "Aourir"},
}

# Category slugs on Avito
CATEGORIES = [
    {
        "slug": "appartements-à_louer",
        "listing_type": "longue_duree",
        "label": "Appartements (location longue durée)",
    },
    {
        "slug": "villas_et_riads-à_louer",
        "listing_type": "longue_duree",
        "label": "Villas/Riads (location longue durée)",
    },
    {
        "slug": "locations_de_vacances",
        "listing_type": "courte_duree",
        "label": "Location vacances (toutes)",
    },
]

# ---------------------------------------------------------------------------
# Geography-aware region tagging
# ---------------------------------------------------------------------------
# Smaller towns often list under "Agadir". We scan listing titles for
# city keywords to correctly tag each lead's actual region.
REGION_KEYWORDS = {
    "Taghazout":   ["taghazout"],
    "Tamraght":    ["tamraght"],
    "Imi Ouaddar": ["imi ouaddar", "imi-ouaddar", "banana beach", "km 12", "km12"],
    "Aourir":      ["aourir"],
}

def detect_region(title: str, default_region: str) -> str:
    """Scan listing title for city keywords to refine the region tag."""
    t = title.lower()
    for region_label, keywords in REGION_KEYWORDS.items():
        if any(kw in t for kw in keywords):
            return region_label
    return default_region


def build_search_urls() -> list[dict]:
    """
    Build the full list of search URLs to scrape.
    Returns a list of dicts with: url, region, listing_type, category_slug
    """
    urls = []

    for region_key, region_info in REGIONS.items():
        for cat in CATEGORIES:
            url = f"https://www.avito.ma/fr/{region_info['slug']}/{cat['slug']}"
            urls.append({
                "url": url,
                "region": region_info["label"],
                "region_key": region_key,
                "listing_type": cat["listing_type"],
                "category_slug": cat["slug"],
                "category_label": cat["label"],
            })

    return urls





# ---------------------------------------------------------------------------
# Filter 2 — Exclusion filter (improved)
# ---------------------------------------------------------------------------
def is_excluded(title: str, seller_name: str) -> bool:
    """
    Check if a listing should be excluded as an agency.
    - Hard keywords in title OR seller → exclude
    - Regex patterns on title OR seller → exclude (seller often missing on cards)
    """
    combined = f"{title} {seller_name}".lower()
    # Hard keyword match
    if any(kw in combined for kw in AGENCY_KEYWORDS):
        return True
    # Regex patterns on title + seller (search cards often omit seller)
    for pat in AGENCY_NAME_PATTERNS:
        if pat.search(title or "") or pat.search(seller_name or ""):
            return True
    return False


OFF_COAST_URL_SLUGS = (
    "casablanca", "rabat", "marrakech", "kénitra", "kenitra", "tanger",
    "fès", "fes", "meknès", "meknes", "oujda", "salé", "mohammedia",
)


def url_in_target_zone(listing_url: str, search_region: str) -> bool:
    """Drop clear off-coast cities; keep coast corridor + current search city."""
    u = listing_url.lower()
    if any(f"/{slug}/" in u for slug in OFF_COAST_URL_SLUGS):
        return False
    coast = (
        "agadir", "taghazout", "tamraght", "aourir", "imi_ouaddar", "imi-ouaddar",
        "anza", "founty", "marina",
    )
    if any(f"/{slug}/" in u for slug in coast):
        return True
    # Search was scoped to a target city — keep page results unless off-coast above
    return True


# ---------------------------------------------------------------------------
# Filter 3 — Minimum price check
# ---------------------------------------------------------------------------
def check_min_price(price_mad: int | None, listing_type: str) -> bool:
    """Return True if listing should be EXCLUDED for being below price floor.
    Unknown prices (None) are kept."""
    if price_mad is None:
        return False
    if listing_type == "longue_duree" and price_mad < MIN_PRICE_LONGUE_DUREE:
        return True
    if listing_type == "courte_duree" and price_mad < MIN_PRICE_COURTE_DUREE:
        return True
    return False


# ---------------------------------------------------------------------------
# Filter 4 — Listing age parsing
# ---------------------------------------------------------------------------
def parse_listing_age_days(text: str) -> int | None:
    """
    Parse French time-ago text like 'il y a 2 mois', 'il y a 15 jours'.
    Returns estimated age in days, or None if not parseable.
    """
    if not text:
        return None
    t = text.lower()
    m = re.search(r'il y a\s+(\d+)\s*(heure|jour|semaine|mois|an)', t)
    if not m:
        # Try "Aujourd'hui" / "Hier" patterns
        if "aujourd" in t:
            return 0
        if "hier" in t:
            return 1
        return None
    num = int(m.group(1))
    unit = m.group(2)
    if unit.startswith("heure"):
        return 0
    elif unit.startswith("jour"):
        return num
    elif unit.startswith("semaine"):
        return num * 7
    elif unit.startswith("mois"):
        return num * 30
    elif unit.startswith("an"):
        return num * 365
    return None


# ---------------------------------------------------------------------------
# Filter 5 — Duplicate seller dedup (post-processing)
# ---------------------------------------------------------------------------
def dedup_by_seller(leads: list[dict], max_per_seller: int = MAX_PER_SELLER) -> list[dict]:
    """
    If the same seller appears more than max_per_seller times,
    keep only their most recent listings (by scraped_at).
    Returns filtered list and count of removed leads.
    """
    from collections import defaultdict
    seller_groups = defaultdict(list)
    no_seller = []

    for lead in leads:
        name = (lead.get("owner_name") or "").strip().lower()
        if not name:
            no_seller.append(lead)
        else:
            seller_groups[name].append(lead)

    kept = list(no_seller)
    removed = 0
    for name, group in seller_groups.items():
        if len(group) <= max_per_seller:
            kept.extend(group)
        else:
            # Sort by scraped_at descending, keep newest
            group.sort(key=lambda x: x.get("scraped_at", ""), reverse=True)
            kept.extend(group[:max_per_seller])
            removed += len(group) - max_per_seller

    return kept, removed


# ---------------------------------------------------------------------------
# Property type classification
# ---------------------------------------------------------------------------
def classify_property_type(title: str) -> str:
    """Determine property type from listing title."""
    title_lower = title.lower()
    if "studio" in title_lower:
        return "studio"
    if "villa" in title_lower or "riad" in title_lower:
        return "villa"
    return "appartement"


# ---------------------------------------------------------------------------
# Price parsing
# ---------------------------------------------------------------------------
def parse_price(price_text: str) -> int | None:
    """Extract numeric price from text like '3 500 DH' or 'Demander le prix'."""
    if not price_text or "demander" in price_text.lower():
        return None
    # Remove everything except digits
    digits = re.sub(r"[^\d]", "", price_text)
    if digits:
        return int(digits)
    return None


# ---------------------------------------------------------------------------
# Cloudflare detection
# ---------------------------------------------------------------------------
def is_cloudflare_blocked(page_title: str, page_content: str) -> bool:
    """Detect if Cloudflare is blocking us."""
    blocked_signals = [
        "just a moment",
        "attention required",
        "cloudflare",
        "ray id",
        "checking your browser",
    ]
    combined = f"{page_title} {page_content[:500]}".lower()
    return any(signal in combined for signal in blocked_signals)


# ---------------------------------------------------------------------------
# Main scraping logic
# ---------------------------------------------------------------------------
async def scrape_listing_cards(page, url: str, region: str, listing_type: str) -> list[dict]:
    """
    Scrape all listing cards from a single Avito search results page.
    Returns a list of lead dicts.
    """
    leads = []

    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
    except PlaywrightTimeout:
        log(f"TIMEOUT loading {url}")
        return leads

    # Wait for content to render
    await asyncio.sleep(random.uniform(2, 4))

    # Check for Cloudflare block
    page_title = await page.title()
    page_body = await page.inner_text("body")

    if is_cloudflare_blocked(page_title, page_body):
        log(f"CLOUDFLARE BLOCK detected on {url}")
        # Fallback: wait and retry once (no proxy rotation yet)
        log("Waiting 25 seconds before retry...")
        await asyncio.sleep(25)
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            await asyncio.sleep(random.uniform(2, 4))
            page_title = await page.title()
            page_body = await page.inner_text("body")
            if is_cloudflare_blocked(page_title, page_body):
                log(f"CLOUDFLARE BLOCK persists on {url} — skipping")
                return leads
        except PlaywrightTimeout:
            log(f"TIMEOUT on retry for {url}")
            return leads

    # Extract listing cards
    # Avito uses <a> tags with listing data — each listing card is a link
    # The structure is: listing cards are inside a container, each with href to the listing
    listing_cards = await page.query_selector_all("a[href*='/fr/'][href$='.htm']")

    for card in listing_cards:
        try:
            href = await card.get_attribute("href")
            if not href or ".htm" not in href:
                continue

            # Build full URL
            listing_url = href if href.startswith("http") else f"https://www.avito.ma{href}"

            # ---- Filter 1: No photos (lazy-load aware) ----
            # Avito often serves images via data-src / srcset / blur placeholders.
            # Only exclude when we positively detect a no-photo / placeholder card.
            has_photo = False
            explicit_no_photo = False
            try:
                imgs = await card.query_selector_all("img")
                for img in imgs:
                    attrs = []
                    for attr in ("src", "data-src", "data-lazy-src", "srcset", "data-srcset"):
                        val = (await img.get_attribute(attr)) or ""
                        if val:
                            attrs.append(val.lower())
                    joined = " ".join(attrs)
                    if any(tok in joined for tok in ("no-photo", "nophoto", "without-photo", "default-image", "placeholder")):
                        explicit_no_photo = True
                        continue
                    # Real CDN / uploaded asset, or non-trivial data URI
                    if any(
                        ("http" in a or "avito.ma" in a or "cloudfront" in a or len(a) > 80)
                        and "placeholder" not in a
                        for a in attrs
                    ):
                        has_photo = True
                        break
                # Soft pass: missing/lazy img must not kill owner leads
                if not has_photo and not explicit_no_photo:
                    has_photo = True
            except Exception:
                has_photo = True
            if explicit_no_photo and not has_photo:
                log(f"  EXCLUDED (no photo): {href[-40:]}")
                continue

            # ---- Zone guard: drop off-coast / wrong-city cards ----
            if not url_in_target_zone(listing_url, region):
                log(f"  EXCLUDED (off-zone URL): {listing_url[-50:]}")
                continue

            # Get all text content from the card
            # Current Avito card layout (2026):
            #   title
            #   N chambre(s) / N sdb / N m² / Étage…
            #   price
            #   DH
            #   city
            #   il y a …
            # Seller name is usually NOT on the search card.
            card_text = await card.inner_text()
            lines = [line.strip() for line in card_text.split("\n") if line.strip()]

            if len(lines) < 2:
                continue

            listing_title = lines[0]
            seller_name = None
            time_ago_text = next(
                (
                    line for line in lines
                    if re.search(r"il y a\s+\d+", line, re.I)
                    or "aujourd" in line.lower()
                    or line.lower() == "hier"
                ),
                None,
            )

            price_mad = None
            joined = "\n".join(lines)
            if re.search(r"demander le prix", joined, re.I):
                price_mad = None
            else:
                # Number must be on its own line above DH (no newlines inside amount)
                m_price = re.search(
                    r"(?m)^([0-9][0-9\s\u202f\u00a0]*)\s*\n\s*DH\s*$",
                    joined,
                    re.I,
                )
                if not m_price:
                    m_price = re.search(r"([0-9][0-9\s\u202f\u00a0]*)\s*DH\b", joined, re.I)
                if m_price:
                    price_mad = parse_price(m_price.group(0))

            if not listing_title or len(listing_title) < 5:
                continue
            # Avoid mistaking city-only lines for titles
            if listing_title.lower() in {r["label"].lower() for r in REGIONS.values()}:
                continue

            # ---- Filter 2: Agency exclusion (improved) ----
            if is_excluded(listing_title, seller_name or ""):
                log(f"  EXCLUDED (agency): {listing_title} | seller: {seller_name}")
                continue

            # ---- Filter 3: Minimum price ----
            if check_min_price(price_mad, listing_type):
                log(f"  EXCLUDED (low price {price_mad} MAD): {listing_title[:50]}")
                continue

            # ---- Filter 4: Listing age > 60 days ----
            age_days = parse_listing_age_days(time_ago_text)
            if age_days is not None and age_days > MAX_LISTING_AGE_DAYS:
                log(f"  EXCLUDED (age {age_days}d): {listing_title[:50]}")
                continue

            # Classify property type
            property_type = classify_property_type(listing_title)

            # Build lead dict
            lead = {
                "platform": "avito",
                "listing_url": listing_url,
                "listing_title": listing_title,
                "listing_type": listing_type,
                "property_type": property_type,
                "region": detect_region(listing_title, region),
                "owner_name": seller_name,
                "phone_number": None,       # Extracted by extract_contact.py
                "contact_hidden": None,     # Set by extract_contact.py
                "price_mad": price_mad,
                "scraped_at": datetime.now().isoformat(timespec="seconds"),
            }
            leads.append(lead)

        except Exception as e:
            log(f"  Error parsing card: {e}")
            continue

    return leads


async def scrape_paginated(page, base_url: str, region: str, listing_type: str,
                           remaining_budget: int, max_per_category: int = 0) -> list[dict]:
    """
    Scrape multiple pages of search results, respecting the daily budget.
    max_per_category: if > 0, stop after collecting this many leads from this URL.
    """
    all_leads = []
    page_num = 1
    effective_limit = min(remaining_budget, max_per_category) if max_per_category > 0 else remaining_budget

    while len(all_leads) < effective_limit:
        # Build paginated URL
        url = base_url if page_num == 1 else f"{base_url}?o={page_num}"
        log(f"  Page {page_num}: {url}")

        leads = await scrape_listing_cards(page, url, region, listing_type)

        if not leads:
            log(f"  No listings found on page {page_num} — stopping pagination")
            break

        all_leads.extend(leads)
        log(f"  Found {len(leads)} listings (total: {len(all_leads)})")

        # Check limit
        if len(all_leads) >= effective_limit:
            log(f"  Category limit reached — stopping")
            break

        # Random delay before next page
        delay = random.uniform(MIN_DELAY, MAX_DELAY)
        log(f"  Waiting {delay:.1f}s before next page...")
        await asyncio.sleep(delay)

        page_num += 1

        # Safety: don't go beyond 10 pages
        if page_num > 10:
            log(f"  Reached max page limit (10) — stopping")
            break

    return all_leads[:effective_limit]


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
def log(message: str):
    """Simple logger — prints to console and appends to log file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted = f"[{timestamp}] {message}"
    print(formatted)

    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_file = LOG_DIR / f"avito_{date.today()}.log"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(formatted + "\n")


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------
def save_leads(leads: list[dict]):
    """Save leads to the raw output JSON file."""
    TMP_DIR.mkdir(parents=True, exist_ok=True)

    # Load existing leads if file exists
    existing = []
    if OUTPUT_FILE.exists():
        try:
            existing = json.loads(OUTPUT_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            existing = []

    # Append new leads
    existing.extend(leads)

    OUTPUT_FILE.write_text(
        json.dumps(existing, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )
    log(f"Saved {len(leads)} new leads to {OUTPUT_FILE} (total: {len(existing)})")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
async def main(args):
    # Build URL list
    all_urls = build_search_urls()

    # Filter by region if specified
    if args.region:
        region_key = args.region.lower().replace(" ", "_")
        all_urls = [u for u in all_urls if u["region_key"] == region_key]
        if not all_urls:
            print(f"ERROR: No URLs found for region '{args.region}'")
            print(f"Valid regions: {', '.join(REGIONS.keys())}")
            sys.exit(1)

    # Dry run — just print URLs
    if args.dry_run:
        per_url = (args.max_total or MAX_TOTAL_PER_RUN) // len(all_urls)
        print(f"\n{'='*60}")
        print(f"DRY RUN — {len(all_urls)} URLs to scrape:")
        print(f"  Total limit: {args.max_total or MAX_TOTAL_PER_RUN}  |  Per-URL limit: {per_url}")
        print(f"{'='*60}\n")
        for i, u in enumerate(all_urls, 1):
            print(f"  {i:2d}. [{u['region']:12s}] [{u['listing_type']:12s}] {u['url']}")
        print(f"\n{'='*60}")
        return

    # ---- Compute per-URL limit ----
    total_limit = args.max_total or MAX_TOTAL_PER_RUN
    per_url_limit = total_limit // len(all_urls)
    # CLI --max-per-category overrides the computed per-URL limit
    if args.max_per_category and args.max_per_category > 0:
        per_url_limit = args.max_per_category

    log(f"Run limit: {total_limit} total  |  {per_url_limit} per URL  |  {len(all_urls)} URLs")

    # Launch browser
    log("Launching Playwright browser...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=args.headless,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
            ]
        )

        context = await browser.new_context(
            user_agent=random.choice(USER_AGENTS),
            viewport={"width": 1366, "height": 768},
            locale="fr-FR",
        )

        page = await context.new_page()

        # Apply stealth
        await stealth.apply_stealth_async(page)

        all_leads = []
        total_scraped = 0

        for url_info in all_urls:
            if total_scraped >= total_limit:
                log("Total run limit reached — stopping scrape")
                break

            log(f"\nScraping: {url_info['region']} / {url_info['category_label']}")
            log(f"URL: {url_info['url']}")

            remaining = total_limit - total_scraped
            cap = min(per_url_limit, remaining)

            leads = await scrape_paginated(
                page,
                url_info["url"],
                url_info["region"],
                url_info["listing_type"],
                cap,
                max_per_category=cap,
            )

            all_leads.extend(leads)
            total_scraped += len(leads)

            # Random delay between categories/regions
            if total_scraped < total_limit:
                delay = random.uniform(MIN_DELAY, MAX_DELAY)
                log(f"Waiting {delay:.1f}s before next category...")
                await asyncio.sleep(delay)

        await browser.close()

    # ---- Filter 5: Duplicate seller dedup ----
    if all_leads:
        all_leads, removed = dedup_by_seller(all_leads)
        if removed:
            log(f"  Filter 5: removed {removed} duplicate-seller listings")

    # Save results
    if all_leads:
        save_leads(all_leads)
        log(f"\n{'='*60}")
        log(f"DONE — Scraped {len(all_leads)} listings total")
        log(f"{'='*60}")
    else:
        log("No listings scraped.")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Scrape Avito.ma rental listings",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python execution/scrape_avito.py                       # Scrape all regions
  python execution/scrape_avito.py --region agadir       # Scrape Agadir only
  python execution/scrape_avito.py --region taghazout    # Scrape Taghazout only
  python execution/scrape_avito.py --region imi_ouaddar  # Scrape Imi Ouaddar only
  python execution/scrape_avito.py --dry-run             # Print URLs, don't scrape
  python execution/scrape_avito.py --headless            # Run headless (no browser window)
        """
    )
    parser.add_argument(
        "--region",
        type=str,
        default=None,
        help=f"Scrape a single region. Options: {', '.join(REGIONS.keys())}",
    )
    parser.add_argument(
        "--max-per-category",
        type=int,
        default=0,
        help="Override per-URL limit (0 = auto-calculate from --max-total)",
    )
    parser.add_argument(
        "--max-total",
        type=int,
        default=0,
        help=f"Total listings per run (default: {MAX_TOTAL_PER_RUN}, distributed evenly across URLs)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the list of URLs to scrape without actually scraping",
    )
    parser.add_argument(
        "--headless",
        action="store_true",
        default=False,
        help="Run browser in headless mode (default: headed for debugging)",
    )

    args = parser.parse_args()
    asyncio.run(main(args))

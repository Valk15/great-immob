"""
scrape_airbnb.py — Airbnb Listing Scraper
==========================================
Layer 3 execution script.
Two-phase scraping:
  Phase 1: Extract listing cards from search results pages
  Phase 2: Visit each listing to get calendar data for occupancy estimation

No phone numbers — operator contacts hosts via Airbnb platform.
No login required — public pages only.

Usage:
    py execution/scrape_airbnb.py                      # Scrape all regions
    py execution/scrape_airbnb.py --region taghazout   # One region
    py execution/scrape_airbnb.py --dry-run            # Print URLs only
    py execution/scrape_airbnb.py --headless           # Headless mode
"""

import asyncio
import json
import math
import os
import random
import re
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')
import argparse
from datetime import datetime, date, timedelta
from pathlib import Path
from urllib.parse import quote_plus, urlencode

# ---------------------------------------------------------------------------
# Dependencies
# ---------------------------------------------------------------------------
try:
    from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
except ImportError:
    print("ERROR: playwright not installed. Run: py -m pip install playwright")
    print("Then: py -m playwright install chromium")
    sys.exit(1)

try:
    from playwright_stealth import Stealth
except ImportError:
    print("ERROR: playwright-stealth not installed. Run: py -m pip install playwright-stealth")
    sys.exit(1)

stealth = Stealth()


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent
TMP_DIR = PROJECT_ROOT / ".tmp"
OUTPUT_FILE = TMP_DIR / "airbnb_raw.json"
LOG_DIR = PROJECT_ROOT / "logs"

# Rate limits
MAX_SEARCH_LISTINGS = 100   # Max listing cards to collect per session
SEARCH_DELAY_MIN = 3        # Seconds between search page loads
SEARCH_DELAY_MAX = 8
PAGE_TIMEOUT = 45000        # 45 seconds

# Priority lead thresholds
WEAK_RATING_THRESHOLD = 4.3
WEAK_REVIEWS_THRESHOLD = 10

# Currency conversion (approximate, for non-MAD prices)
CURRENCY_TO_MAD = {
    "USD": 10.0,
    "EUR": 11.0,
    "GBP": 12.5,
    "$": 10.0,
    "€": 11.0,
    "£": 12.5,
}

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
]


# ---------------------------------------------------------------------------
# Region definitions
# ---------------------------------------------------------------------------
REGIONS = {
    "agadir":      {"query": "Agadir, Morocco",      "label": "Agadir"},
    "tamraght":    {"query": "Tamraght, Morocco",     "label": "Tamraght"},
    "taghazout":   {"query": "Taghazout, Morocco",    "label": "Taghazout"},
    "imi_ouaddar": {"query": "Imi Ouaddar, Morocco",  "label": "Imi Ouaddar"},
    "aourir":      {"query": "Aourir, Morocco",       "label": "Aourir"},
}


def build_search_url(query: str, offset: int = 0) -> str:
    """Build an Airbnb search URL for entire homes in a given location."""
    params = {
        "tab_id": "home_tab",
        "refinement_paths[]": "/homes",
        "room_types[]": "Entire home/apt",
        "items_per_grid": "18",
        "query": query,
        "search_type": "filter_change",
    }
    if offset > 0:
        params["items_offset"] = str(offset)

    base = f"https://www.airbnb.com/s/{quote_plus(query)}/homes"
    return f"{base}?{urlencode(params, doseq=True)}"


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
def log(message: str):
    """Print to console and append to log file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted = f"[{timestamp}] {message}"
    print(formatted)
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_file = LOG_DIR / f"airbnb_{date.today()}.log"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(formatted + "\n")


# ---------------------------------------------------------------------------
# Property type classification
# ---------------------------------------------------------------------------
def classify_property_type(title: str) -> str:
    """Determine property type from listing title."""
    t = title.lower()
    if "studio" in t:
        return "studio"
    if any(kw in t for kw in ["villa", "riad", "maison", "house", "dar"]):
        return "villa"
    return "appartement"


# ---------------------------------------------------------------------------
# Price parsing
# ---------------------------------------------------------------------------
def parse_price(price_text: str) -> int | None:
    """
    Parse Airbnb price text to MAD integer.
    Handles: 'MAD 450', '$45', '€41', '450 MAD', 'MAD450 night', etc.
    """
    if not price_text:
        return None

    price_text = price_text.strip()

    # Detect currency
    currency_rate = 1.0  # Default: already MAD
    for symbol, rate in CURRENCY_TO_MAD.items():
        if symbol in price_text:
            currency_rate = rate
            break

    if "MAD" in price_text.upper() or "DH" in price_text.upper():
        currency_rate = 1.0

    # Extract digits
    digits = re.sub(r"[^\d]", "", price_text)
    if not digits:
        return None

    raw_price = int(digits)
    return round(raw_price * currency_rate)


# ---------------------------------------------------------------------------
# Weak flags computation
# ---------------------------------------------------------------------------
def compute_priority(lead: dict) -> dict:
    """
    Compute priority_lead status.
    Priority = True if rating < 4.3 OR review_count < 10 OR superhost is False.
    """
    rating = lead.get("rating")
    review_count = lead.get("review_count", 0)
    is_superhost = lead.get("is_superhost", False)

    is_priority = False

    if rating is not None and rating < WEAK_RATING_THRESHOLD:
        is_priority = True
    if review_count is not None and review_count < WEAK_REVIEWS_THRESHOLD:
        is_priority = True
    if is_superhost is False:
        is_priority = True

    lead["priority_lead"] = is_priority
    return lead


# ---------------------------------------------------------------------------
# Phase 1: Search results scraping
# ---------------------------------------------------------------------------
async def scrape_search_page(page, url: str, region: str) -> list[dict]:
    """
    Scrape listing cards from a single Airbnb search results page.
    Returns list of partial lead dicts (without calendar data).
    """
    leads = []

    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=PAGE_TIMEOUT)
    except PlaywrightTimeout:
        log(f"  TIMEOUT loading search page: {url}")
        return leads

    # Wait for JS rendering
    await asyncio.sleep(random.uniform(3, 6))

    # Check for blocking
    page_title = await page.title()
    if any(s in page_title.lower() for s in ["just a moment", "captcha", "access denied"]):
        log(f"  BLOCKED on search page — waiting 120s")
        await asyncio.sleep(120)
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=PAGE_TIMEOUT)
            await asyncio.sleep(random.uniform(3, 6))
        except PlaywrightTimeout:
            log(f"  Retry also timed out — skipping")
            return leads

    # Try to find listing cards
    # Airbnb listing cards are typically links with /rooms/ in href
    # Strategy: find all links to rooms and extract surrounding card data
    listing_links = await page.query_selector_all('a[href*="/rooms/"]')

    seen_ids = set()
    for link in listing_links:
        try:
            href = await link.get_attribute("href")
            if not href or "/rooms/" not in href:
                continue

            # Extract room ID
            room_id_match = re.search(r'/rooms/(\d+)', href)
            if not room_id_match:
                continue

            room_id = room_id_match.group(1)
            if room_id in seen_ids:
                continue
            seen_ids.add(room_id)

            listing_url = f"https://www.airbnb.com/rooms/{room_id}"

            # Try to get the card's container for more data
            # Navigate up to find the card container
            card = link
            card_text = ""
            try:
                # Get text from the card area
                card_text = await link.inner_text()
            except Exception:
                pass

            # Extract title
            title = ""
            try:
                # Airbnb typically shows title in the card text
                title_parts = [line.strip() for line in card_text.split("\n") if line.strip()]
                # Title is usually one of the first substantial text lines
                for part in title_parts:
                    if len(part) > 5 and not part.startswith("$") and "night" not in part.lower() \
                       and not re.match(r'^[\d.,]+$', part) and "Superhost" not in part:
                        title = part
                        break
            except Exception:
                pass

            # Extract rating
            rating = None
            try:
                rating_match = re.search(r'(\d+[.,]\d+)\s*(?:★|\*|out of)', card_text)
                if rating_match:
                    rating = float(rating_match.group(1).replace(",", "."))
                else:
                    # Try alternative: "4.85 (123)" pattern
                    alt_match = re.search(r'(\d+[.,]\d+)\s*\((\d+)\)', card_text)
                    if alt_match:
                        rating = float(alt_match.group(1).replace(",", "."))
            except Exception:
                pass

            # Extract review count
            review_count = None
            try:
                review_match = re.search(r'\((\d+)\s*(?:review|avis|评价)?\s*\)', card_text, re.IGNORECASE)
                if review_match:
                    review_count = int(review_match.group(1))
                else:
                    # Try: "123 reviews" pattern
                    alt_match = re.search(r'(\d+)\s+(?:reviews?|avis)', card_text, re.IGNORECASE)
                    if alt_match:
                        review_count = int(alt_match.group(1))
            except Exception:
                pass

            # Extract price
            price_per_night = None
            try:
                # Look for price patterns: "MAD 450 night", "$45 night", "€41 /night"
                price_match = re.search(
                    r'(?:MAD|DH|Dhs?|\$|€|£|USD|EUR)?\s*[\d,. ]+\s*(?:MAD|DH|Dhs?)?\s*(?:/?\s*night|nuit|per night)',
                    card_text, re.IGNORECASE
                )
                if price_match:
                    price_per_night = parse_price(price_match.group())
                else:
                    # Broader: find any currency + number pattern
                    broad_match = re.search(r'(?:MAD|DH|\$|€|£)\s*[\d,. ]+', card_text)
                    if broad_match:
                        price_per_night = parse_price(broad_match.group())
            except Exception:
                pass

            # Detect Superhost
            is_superhost = "superhost" in card_text.lower()

            # Detect Guest Favourite badge
            guest_favourite = "guest favo" in card_text.lower() or "guest fav" in card_text.lower()

            # Classify property type
            property_type = classify_property_type(title)

            lead = {
                "platform": "airbnb",
                "listing_url": listing_url,
                "listing_title": title or f"Airbnb listing {room_id}",
                "property_type": property_type,
                "region": region,
                "price_per_night_mad": price_per_night,
                "rating": rating,
                "review_count": review_count if review_count is not None else 0,
                "is_superhost": is_superhost,
                "guest_favourite": guest_favourite,
                "estimated_occupancy_90d": None,  # Not collected (Phase 2 skipped)
                "priority_lead": None,  # Computed after collection
                "outreach_note": "high_potential" if guest_favourite else "",
                "scraped_at": datetime.now().isoformat(timespec="seconds"),
            }
            leads.append(lead)

        except Exception as e:
            log(f"  Error parsing listing card: {e}")
            continue

    return leads


async def scrape_search_results(page, region_key: str, region_info: dict,
                                remaining_budget: int) -> list[dict]:
    """
    Scrape all search result pages for a region, respecting the budget.
    """
    all_leads = []
    offset = 0
    query = region_info["query"]
    label = region_info["label"]

    while len(all_leads) < remaining_budget:
        url = build_search_url(query, offset)
        log(f"  Search page (offset={offset}): {url[:100]}...")

        leads = await scrape_search_page(page, url, label)

        if not leads:
            log(f"  No listings found at offset {offset} — done with {label}")
            break

        all_leads.extend(leads)
        log(f"  Found {len(leads)} listings (total: {len(all_leads)})")

        offset += 18  # Airbnb shows 18 per page

        # Safety: don't go beyond 5 pages
        if offset >= 90:
            log(f"  Reached max pagination (5 pages) for {label}")
            break

        # Delay between pages
        delay = random.uniform(SEARCH_DELAY_MIN, SEARCH_DELAY_MAX)
        log(f"  Waiting {delay:.1f}s...")
        await asyncio.sleep(delay)

    return all_leads[:remaining_budget]


# Phase 2 (calendar scraping) has been removed for reliability.
# Occupancy is set to null for all listings.
# Priority is computed from Phase 1 data only.


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------
def save_leads(leads: list[dict]):
    """Save leads to the raw output JSON file."""
    TMP_DIR.mkdir(parents=True, exist_ok=True)

    existing = []
    if OUTPUT_FILE.exists():
        try:
            existing = json.loads(OUTPUT_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            existing = []

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
    # Determine which regions to scrape
    regions_to_scrape = REGIONS
    if args.region:
        region_key = args.region.lower().replace(" ", "_")
        if region_key not in REGIONS:
            print(f"ERROR: Unknown region '{args.region}'")
            print(f"Valid regions: {', '.join(REGIONS.keys())}")
            sys.exit(1)
        regions_to_scrape = {region_key: REGIONS[region_key]}

    # Dry run
    if args.dry_run:
        print(f"\n{'='*70}")
        print(f"DRY RUN — Airbnb search URLs:")
        print(f"{'='*70}\n")
        for i, (key, info) in enumerate(regions_to_scrape.items(), 1):
            url = build_search_url(info["query"])
            print(f"  {i}. [{info['label']:12s}] {url}")
        print(f"\n  Total regions: {len(regions_to_scrape)}")
        print(f"  Max listings per session: {MAX_SEARCH_LISTINGS}")
        print(f"{'='*70}")
        return

    # Launch browser
    log("Launching Playwright browser for Airbnb scraping...")
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
            viewport={"width": 1440, "height": 900},
            locale="en-US",  # English for consistent parsing
        )

        page = await context.new_page()
        await stealth.apply_stealth_async(page)

        # ===== PHASE 1: Search results =====
        log(f"\n{'='*50}")
        log(f"PHASE 1: Scraping search results")
        log(f"{'='*50}")

        all_leads = []
        remaining_budget = MAX_SEARCH_LISTINGS

        for region_key, region_info in regions_to_scrape.items():
            if remaining_budget <= 0:
                log("Session listing limit reached — stopping search")
                break

            log(f"\n--- Region: {region_info['label']} ---")

            leads = await scrape_search_results(page, region_key, region_info, remaining_budget)
            all_leads.extend(leads)
            remaining_budget -= len(leads)

            log(f"  {region_info['label']}: {len(leads)} listings collected")

            # Delay between regions
            if remaining_budget > 0:
                delay = random.uniform(SEARCH_DELAY_MIN, SEARCH_DELAY_MAX)
                log(f"  Waiting {delay:.1f}s before next region...")
                await asyncio.sleep(delay)

        log(f"\nPhase 1 complete: {len(all_leads)} listings collected")

        # Deduplicate by listing URL (same listing may appear in overlapping regions)
        seen_urls = set()
        unique_leads = []
        for lead in all_leads:
            if lead["listing_url"] not in seen_urls:
                seen_urls.add(lead["listing_url"])
                unique_leads.append(lead)
        if len(unique_leads) < len(all_leads):
            log(f"  Removed {len(all_leads) - len(unique_leads)} duplicates → {len(unique_leads)} unique")
        all_leads = unique_leads

        # Compute priority flags from Phase 1 data
        for lead in all_leads:
            compute_priority(lead)

        await browser.close()

    # Save results
    if all_leads:
        save_leads(all_leads)

        # Summary stats
        priority = sum(1 for l in all_leads if l.get("priority_lead"))
        log(f"\n{'='*50}")
        log(f"DONE -- Airbnb scraping complete")
        log(f"  Total listings: {len(all_leads)}")
        log(f"  Priority leads: {priority}")
        log(f"{'='*50}")
    else:
        log("No listings scraped.")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Scrape Airbnb listings for target regions",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  py execution/scrape_airbnb.py                      # Scrape all regions
  py execution/scrape_airbnb.py --region taghazout   # Scrape Taghazout only
  py execution/scrape_airbnb.py --region imi_ouaddar # Scrape Imi Ouaddar only
  py execution/scrape_airbnb.py --dry-run            # Print URLs, don't scrape
  py execution/scrape_airbnb.py --headless           # Headless mode
        """
    )
    parser.add_argument(
        "--region",
        type=str,
        default=None,
        help=f"Scrape a single region. Options: {', '.join(REGIONS.keys())}",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print URLs without scraping",
    )
    parser.add_argument(
        "--headless",
        action="store_true",
        default=False,
        help="Run browser in headless mode",
    )

    args = parser.parse_args()
    asyncio.run(main(args))

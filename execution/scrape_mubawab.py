"""
scrape_mubawab.py — Mubawab.ma Listing Scraper
================================================
Layer 3 execution script.
Scrapes rental listing cards from Mubawab.ma search results pages.

Same structure as scrape_avito.py:
  - Same 5 regions (Agadir, Tamraght, Taghazout, Imi Ouaddar, Aourir)
  - Same property types (appartements, studios, villas)
  - Same exclusion rules for agencies
  - Same Cloudflare handling
  - Same JSON output format

Uses Playwright with stealth plugin for anti-detection.

Usage:
    py execution/scrape_mubawab.py                      # Scrape all regions & types
    py execution/scrape_mubawab.py --region agadir       # Scrape one region
    py execution/scrape_mubawab.py --dry-run             # Print URLs only
    py execution/scrape_mubawab.py --headless            # Headless mode
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
OUTPUT_FILE = TMP_DIR / "mubawab_raw.json"
DAILY_COUNT_FILE = TMP_DIR / "mubawab_daily_count.json"
LOG_DIR = PROJECT_ROOT / "logs"

MAX_DAILY_LISTINGS = 50
MIN_DELAY = 5   # seconds
MAX_DELAY = 15  # seconds
PAGE_TIMEOUT = 30000  # 30s

# ---------------------------------------------------------------------------
# Filter 2 — Improved agency exclusion
# ---------------------------------------------------------------------------
AGENCY_KEYWORDS = [
    "agence", "promoteur", "gérance", "syndic", "cabinet",
    "immobilière", "conciergerie", "géré par",
]

AGENCY_NAME_PATTERNS = [
    re.compile(r"\bimmo\b", re.IGNORECASE),
    re.compile(r"\bimmobilier\s+\w+", re.IGNORECASE),
    re.compile(r"\b\w+\s+immobilier\b", re.IGNORECASE),
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

# User-Agent rotation pool
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
]


# ---------------------------------------------------------------------------
# Region & Category definitions
# ---------------------------------------------------------------------------
# Mubawab URL pattern: https://www.mubawab.ma/fr/ct/{city}/{category}
# Pagination: :p:2, :p:3, etc.
# Listing detail: /fr/a/{id}/{slug}
#
# Only 3 cities exist on Mubawab (tamraght and imi_ouaddar return 404).
# We use Agadir as the hub and tag leads from title keywords.

REGIONS = {
    "agadir":    {"slug": "agadir",    "label": "Agadir"},
    "taghazout": {"slug": "taghazout", "label": "Taghazout"},
    "aourir":    {"slug": "aourir",    "label": "Aourir"},
}

# Category definitions
CATEGORIES = [
    {
        "url_slug": "immobilier-vacational-all",
        "listing_type": "courte_duree",
        "label": "Location vacances (toutes)",
    },
    {
        "url_slug": "immobilier-a-louer-all",
        "listing_type": "longue_duree",
        "label": "Immobilier à louer (longue durée)",
    },
]

# Commercial/non-residential keywords to skip in long-term rental results
COMMERCIAL_KEYWORDS = [
    "local commercial", "bureau", "plateau", "cave", "magasin",
    "entrepôt", "hangar", "locaux", "commerce", "parking",
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

def is_commercial(title: str) -> bool:
    """Check if a listing is commercial (bureaux, locaux, etc.)."""
    t = title.lower()
    return any(kw in t for kw in COMMERCIAL_KEYWORDS)


def build_search_urls() -> list[dict]:
    """
    Build the full list of search URLs to scrape.
    Returns a list of dicts with: url, region, listing_type, label
    """
    urls = []

    for region_key, region_info in REGIONS.items():
        for cat in CATEGORIES:
            url = f"https://www.mubawab.ma/fr/ct/{region_info['slug']}/{cat['url_slug']}"
            urls.append({
                "url": url,
                "region": region_info["label"],
                "region_key": region_key,
                "listing_type": cat["listing_type"],
                "category_label": cat["label"],
            })

    return urls


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
def log(message: str):
    """Print to console and append to log file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted = f"[{timestamp}] {message}"
    print(formatted)
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_file = LOG_DIR / f"mubawab_{date.today()}.log"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(formatted + "\n")


# ---------------------------------------------------------------------------
# Daily rate limiting
# ---------------------------------------------------------------------------
def get_daily_count() -> int:
    """Read today's scrape count from the daily count file."""
    if not DAILY_COUNT_FILE.exists():
        return 0
    try:
        data = json.loads(DAILY_COUNT_FILE.read_text(encoding="utf-8"))
        if data.get("date") == str(date.today()):
            return data.get("count", 0)
    except (json.JSONDecodeError, KeyError):
        pass
    return 0


def update_daily_count(count: int):
    """Write today's scrape count to the daily count file."""
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    data = {"date": str(date.today()), "count": count}
    DAILY_COUNT_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")


# ---------------------------------------------------------------------------
# Filter 2 — Exclusion filter (improved)
# ---------------------------------------------------------------------------
def is_excluded(title: str, seller_name: str) -> bool:
    """Check if a listing should be excluded as an agency."""
    combined = f"{title} {seller_name}".lower()
    if any(kw in combined for kw in AGENCY_KEYWORDS):
        return True
    if seller_name:
        for pat in AGENCY_NAME_PATTERNS:
            if pat.search(seller_name):
                return True
    return False


# ---------------------------------------------------------------------------
# Filter 3 — Minimum price check
# ---------------------------------------------------------------------------
def check_min_price(price_mad: int | None, listing_type: str) -> bool:
    """Return True if listing should be EXCLUDED for being below price floor."""
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
    """Parse French time-ago text. Returns age in days or None."""
    if not text:
        return None
    t = text.lower()
    m = re.search(r'il y a\s+(\d+)\s*(heure|jour|semaine|mois|an)', t)
    if not m:
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
    """Keep max N listings per seller. Returns (filtered_list, removed_count)."""
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
            group.sort(key=lambda x: x.get("scraped_at", ""), reverse=True)
            kept.extend(group[:max_per_seller])
            removed += len(group) - max_per_seller
    return kept, removed


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
    """Extract numeric price from text like '3 500 DH/mois' or 'Prix non spécifié'."""
    if not price_text:
        return None
    if any(kw in price_text.lower() for kw in ["non spécifié", "demander", "n/a", "consulter"]):
        return None
    digits = re.sub(r"[^\d]", "", price_text)
    if digits:
        return int(digits)
    return None


# ---------------------------------------------------------------------------
# Cloudflare detection
# ---------------------------------------------------------------------------
def is_cloudflare_blocked(page_title: str, page_content: str) -> bool:
    """Detect if Cloudflare or anti-bot is blocking us."""
    blocked_signals = [
        "just a moment",
        "attention required",
        "cloudflare",
        "ray id",
        "checking your browser",
        "access denied",
        "captcha",
    ]
    combined = f"{page_title} {page_content[:500]}".lower()
    return any(signal in combined for signal in blocked_signals)


# ---------------------------------------------------------------------------
# Main scraping logic
# ---------------------------------------------------------------------------
async def scrape_listing_cards(page, url: str, region: str, listing_type: str) -> list[dict]:
    """
    Scrape all listing cards from a single Mubawab search results page.
    Returns a list of lead dicts.
    """
    leads = []

    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=PAGE_TIMEOUT)
    except PlaywrightTimeout:
        log(f"  TIMEOUT loading {url}")
        return leads

    # Wait for content to render
    await asyncio.sleep(random.uniform(2, 4))

    # Check for Cloudflare block
    page_title = await page.title()
    page_body = ""
    try:
        page_body = await page.inner_text("body")
    except Exception:
        pass

    if is_cloudflare_blocked(page_title, page_body):
        log(f"  CLOUDFLARE BLOCK detected on {url}")
        log("  Waiting 90 seconds before retry...")
        await asyncio.sleep(90)
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=PAGE_TIMEOUT)
            await asyncio.sleep(random.uniform(2, 4))
            page_title = await page.title()
            page_body = await page.inner_text("body")
            if is_cloudflare_blocked(page_title, page_body):
                log(f"  CLOUDFLARE BLOCK persists on {url} — skipping")
                return leads
        except PlaywrightTimeout:
            log(f"  TIMEOUT on retry for {url}")
            return leads

    # ---- Extract listing cards ----
    # Mubawab listing detail URLs: /fr/a/{id}/{slug}
    listing_links = await page.query_selector_all(
        'a[href*="/fr/a/"]'
    )

    # Deduplicate by href within this page
    seen_hrefs = set()

    for link in listing_links:
        try:
            href = await link.get_attribute("href")
            if not href:
                continue

            # Skip non-listing links (search pages, navigation, footer)
            if any(skip in href for skip in ["/fr/ct/", "/fr/s/", "/fr/r/", "javascript:", "#", "/compte/", "/aide/", "/app-mobile"]):
                continue

            # Must be a detail listing link: /fr/a/{id}/{slug}
            if "/fr/a/" not in href:
                continue

            # Build full URL
            listing_url = href if href.startswith("http") else f"https://www.mubawab.ma{href}"

            # Deduplicate within this page
            url_key = listing_url.split("?")[0].rstrip("/")
            if url_key in seen_hrefs:
                continue
            seen_hrefs.add(url_key)

            # ---- Extract listing title from link text ----
            # Mubawab links contain just the title (single line)
            listing_title = ""
            try:
                listing_title = (await link.inner_text()).strip()
            except Exception:
                pass

            # Fallback: extract title from URL slug
            if not listing_title or len(listing_title) < 5:
                try:
                    # URL: /fr/a/{id}/{slug} → slug has dashes
                    slug = href.rstrip("/").split("/")[-1]
                    listing_title = slug.replace("-", " ").replace("%C3%A9", "é").replace("%C3%A0", "à").title()
                except Exception:
                    continue

            if not listing_title or len(listing_title) < 5:
                continue

            # ---- Filter 1: No photos ----
            # Mubawab: link is in contentBox, images are in sibling photoBox.
            # Only check presence of img tags (not src — Mubawab lazy-loads).
            has_photo = True  # Default: keep on uncertainty
            try:
                has_photo = await link.evaluate("""el => {
                    const card = el.closest('.listingBox') || el.closest('[class*="listing"]');
                    if (!card) return true;
                    const photoBox = card.querySelector('.photoBox');
                    if (!photoBox) return false;
                    return photoBox.querySelectorAll('img').length > 0;
                }""")
            except Exception:
                pass
            if not has_photo:
                log(f"  EXCLUDED (no photo): {listing_title[:40]}")
                continue

            # ---- Get price/seller/date from parent container ----
            seller_name = None
            price_text = None
            time_ago_text = None
            try:
                parent = await link.evaluate_handle(
                    "el => el.closest('li') || el.closest('article') || el.closest('div[class*=\"listing\"]') || el.parentElement?.parentElement"
                )
                parent_text = await parent.inner_text()
                for line in parent_text.split("\n"):
                    line = line.strip()
                    if not line:
                        continue
                    if "DH" in line or "MAD" in line or re.search(r'\d+\s*(DH|MAD|dh)', line):
                        price_text = line
                    elif any(kw in line.lower() for kw in ["publiée", "posté", "par "]):
                        seller_name = line
                    elif re.search(r'il y a\s+\d+', line) or "Aujourd" in line or "Hier" in line:
                        time_ago_text = line
            except Exception:
                pass

            # ---- Filter 2: Agency exclusion (improved) ----
            if is_excluded(listing_title, seller_name or ""):
                log(f"  EXCLUDED (agency): {listing_title[:50]}...")
                continue

            # Parse price
            price_mad = parse_price(price_text)

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

            # Check commercial filter (only for longue_duree category)
            if listing_type == "longue_duree" and is_commercial(listing_title):
                log(f"  EXCLUDED (commercial): {listing_title[:60]}...")
                continue

            # Build lead dict (same format as Avito)
            lead = {
                "platform": "mubawab",
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
    Mubawab pagination: :p:2, :p:3, etc.
    max_per_category: if > 0, stop after collecting this many leads from this URL.
    """
    all_leads = []
    page_num = 1
    effective_limit = min(remaining_budget, max_per_category) if max_per_category > 0 else remaining_budget

    while len(all_leads) < effective_limit:
        # Build paginated URL
        url = base_url if page_num == 1 else f"{base_url}:p:{page_num}"
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

    # Dry run
    if args.dry_run:
        print(f"\n{'='*60}")
        print(f"DRY RUN — {len(all_urls)} URLs to scrape:")
        print(f"{'='*60}\n")
        for i, u in enumerate(all_urls, 1):
            print(f"  {i:2d}. [{u['region']:12s}] [{u['listing_type']:12s}] {u['url']}")
        print(f"\n{'='*60}")
        return

    # Check daily limit
    daily_count = get_daily_count()
    if daily_count >= MAX_DAILY_LISTINGS:
        log(f"Daily limit reached ({daily_count}/{MAX_DAILY_LISTINGS}). Stopping.")
        return

    remaining_budget = MAX_DAILY_LISTINGS - daily_count
    log(f"Daily budget: {remaining_budget} listings remaining ({daily_count}/{MAX_DAILY_LISTINGS} used)")

    # Launch browser
    log("Launching Playwright browser for Mubawab scraping...")
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

        for url_info in all_urls:
            if remaining_budget <= 0:
                log("Daily limit reached — stopping scrape")
                break

            log(f"\nScraping: {url_info['region']} / {url_info['category_label']}")
            log(f"URL: {url_info['url']}")

            leads = await scrape_paginated(
                page,
                url_info["url"],
                url_info["region"],
                url_info["listing_type"],
                remaining_budget,
                max_per_category=getattr(args, 'max_per_category', 0) or 0,
            )

            all_leads.extend(leads)
            remaining_budget -= len(leads)

            # Random delay between categories/regions
            if remaining_budget > 0:
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
        update_daily_count(daily_count + len(all_leads))
        log(f"\n{'='*60}")
        log(f"DONE — Scraped {len(all_leads)} Mubawab listings total")
        log(f"{'='*60}")
    else:
        log("No listings scraped.")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Scrape Mubawab.ma rental listings",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  py execution/scrape_mubawab.py                       # Scrape all regions
  py execution/scrape_mubawab.py --region agadir       # Scrape Agadir only
  py execution/scrape_mubawab.py --region taghazout    # Scrape Taghazout only
  py execution/scrape_mubawab.py --region imi_ouaddar  # Scrape Imi Ouaddar only
  py execution/scrape_mubawab.py --dry-run             # Print URLs, don't scrape
  py execution/scrape_mubawab.py --headless            # Run headless
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
        help="Max listings to collect per category (0 = unlimited, useful for testing)",
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
        help="Run browser in headless mode",
    )

    args = parser.parse_args()
    asyncio.run(main(args))

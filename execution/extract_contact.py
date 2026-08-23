"""
extract_contact.py — Contact Extraction from Listing Pages
==========================================================
Layer 3 execution script.
Visits individual listing detail pages (Avito / Mubawab) to extract phone numbers.

Strategy:
  1. Scan visible page text for Moroccan phone number patterns
  2. If no phone found, check for "Voir le numéro" / reveal button → flag contact_hidden
  3. Never crash — always produce a valid JSON row per listing

Usage:
    py execution/extract_contact.py --input .tmp/avito_raw.json --output .tmp/avito_enriched.json
    py execution/extract_contact.py --url "https://www.avito.ma/fr/.../Listing_12345.htm"
    py execution/extract_contact.py --input .tmp/avito_raw.json --dry-run
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
# Dependencies
# ---------------------------------------------------------------------------
try:
    from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
except ImportError:
    print("ERROR: playwright not installed. Run: py -m pip install playwright && py -m playwright install chromium")
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
LOG_DIR = PROJECT_ROOT / "logs"

MAX_VISITS_PER_SESSION = 30
MIN_DELAY = 5
MAX_DELAY = 15
PAGE_TIMEOUT = 30000  # 30 seconds

# User-Agent pool
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
]

# ---------------------------------------------------------------------------
# Moroccan phone number regex patterns
# ---------------------------------------------------------------------------
# Matches various Moroccan mobile formats:
#   0661234567, 06 61 23 45 67, 06-61-23-45-67, 06.61.23.45.67
#   +212661234567, +212 661234567, +212 6 61 23 45 67
#   00212661234567
PHONE_PATTERNS = [
    # International format with +212
    r'\+212[\s.-]?[5-7][\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}',
    # International format with 00212
    r'00212[\s.-]?[5-7][\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}',
    # Local format starting with 0
    r'0[5-7][\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}',
]

# Compile into a single combined pattern
PHONE_REGEX = re.compile('|'.join(f'({p})' for p in PHONE_PATTERNS))

# Button text patterns that indicate a hidden phone number
REVEAL_BUTTON_TEXTS = [
    "voir le numéro",
    "afficher le numéro",
    "appeler",
    "voir téléphone",
    "afficher téléphone",
    "show phone",
    "voir le tel",
    "voir tel",
    "call",
]


# ---------------------------------------------------------------------------
# Phone number normalization
# ---------------------------------------------------------------------------
def normalize_phone(raw: str) -> str | None:
    """
    Normalize a Moroccan phone number to format: +212 6XX-XXXXXX

    Examples:
        0661234567      → +212 661-234567
        +212661234567   → +212 661-234567
        06 61 23 45 67  → +212 661-234567
        00212661234567  → +212 661-234567
    """
    if not raw:
        return None

    # Strip all non-digit characters except leading +
    digits = re.sub(r'[^\d]', '', raw)

    # Handle different prefixes
    if digits.startswith('00212'):
        digits = digits[5:]  # Remove 00212
    elif digits.startswith('212'):
        digits = digits[3:]  # Remove 212 (from +212 after stripping +)
    elif digits.startswith('0'):
        digits = digits[1:]  # Remove leading 0

    # Validate: should now be 9 digits starting with 5, 6, or 7
    if len(digits) != 9 or digits[0] not in '567':
        return None

    # Format: +212 6XX-XXXXXX
    return f"+212 {digits[:3]}-{digits[3:]}"


def extract_phones_from_text(text: str) -> list[str]:
    """
    Find all Moroccan phone numbers in a text string.
    Returns a list of normalized phone numbers.
    """
    matches = PHONE_REGEX.findall(text)
    phones = []

    for match_groups in matches:
        # Each match is a tuple of groups (one per pattern)
        for group in match_groups:
            if group:
                normalized = normalize_phone(group)
                if normalized and normalized not in phones:
                    phones.append(normalized)

    return phones


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
# Contact extraction from a single listing page
# ---------------------------------------------------------------------------
async def extract_contact_from_page(page, listing_url: str) -> dict:
    """
    Visit a single listing URL and attempt to extract a phone number.

    Returns:
        dict with keys: phone_number, contact_hidden
        Always returns a valid dict — never raises.
    """
    result = {
        "phone_number": None,
        "contact_hidden": None,
    }

    try:
        # Load the page
        response = await page.goto(listing_url, wait_until="domcontentloaded", timeout=PAGE_TIMEOUT)

        if response and response.status == 404:
            log(f"  404 — Page not found: {listing_url}")
            return result

        # Wait for content to render
        await asyncio.sleep(random.uniform(2, 4))

        # Check for Cloudflare block
        page_title = await page.title()
        page_body_text = await page.inner_text("body")

        if is_cloudflare_blocked(page_title, page_body_text):
            log(f"  CLOUDFLARE BLOCK on {listing_url}")
            log("  Waiting 25 seconds before retry...")
            await asyncio.sleep(25)

            try:
                await page.goto(listing_url, wait_until="domcontentloaded", timeout=PAGE_TIMEOUT)
                await asyncio.sleep(random.uniform(2, 4))
                page_title = await page.title()
                page_body_text = await page.inner_text("body")

                if is_cloudflare_blocked(page_title, page_body_text):
                    log(f"  CLOUDFLARE persists — flag contact_hidden for operator: {listing_url}")
                    result["contact_hidden"] = True
                    return result
            except PlaywrightTimeout:
                log(f"  TIMEOUT on Cloudflare retry — flag contact_hidden for operator")
                result["contact_hidden"] = True
                return result

        # ----- STEP 1: Scan visible text for phone numbers -----
        phones = extract_phones_from_text(page_body_text)

        # Also check for tel: links in the HTML
        tel_links = await page.query_selector_all('a[href^="tel:"]')
        for tel_link in tel_links:
            href = await tel_link.get_attribute("href")
            if href:
                tel_number = href.replace("tel:", "").strip()
                normalized = normalize_phone(tel_number)
                if normalized and normalized not in phones:
                    phones.append(normalized)

        if phones:
            # Found at least one phone number
            result["phone_number"] = phones[0]  # Keep first valid mobile
            result["contact_hidden"] = False
            log(f"  ✓ Phone found: {phones[0]}")
            return result

        # ----- STEP 2: Check for reveal button -----
        has_reveal_button = False

        # Check all buttons and clickable elements
        buttons = await page.query_selector_all("button, a.phone-button, [class*='phone'], [class*='call'], [data-testid*='phone']")

        for button in buttons:
            try:
                button_text = (await button.inner_text()).strip().lower()
                if any(reveal in button_text for reveal in REVEAL_BUTTON_TEXTS):
                    has_reveal_button = True
                    break
            except Exception:
                continue

        # Also do a broader text search for reveal button language
        if not has_reveal_button:
            body_lower = page_body_text.lower()
            for reveal_text in REVEAL_BUTTON_TEXTS:
                if reveal_text in body_lower:
                    has_reveal_button = True
                    break

        if has_reveal_button:
            result["contact_hidden"] = True
            log(f"  ⚠ Phone hidden (reveal button detected) — flagged for manual check")
        else:
            result["contact_hidden"] = None
            log(f"  ✗ No phone found and no reveal button — unknown")

    except PlaywrightTimeout:
        log(f"  TIMEOUT loading {listing_url}")
        # Retry once
        try:
            log(f"  Retrying after 30s...")
            await asyncio.sleep(30)
            await page.goto(listing_url, wait_until="domcontentloaded", timeout=PAGE_TIMEOUT)
            await asyncio.sleep(random.uniform(2, 4))
            page_body_text = await page.inner_text("body")
            phones = extract_phones_from_text(page_body_text)
            if phones:
                result["phone_number"] = phones[0]
                result["contact_hidden"] = False
                log(f"  ✓ Phone found on retry: {phones[0]}")
        except Exception:
            log(f"  Retry also failed — skipping")

    except Exception as e:
        log(f"  ERROR processing {listing_url}: {type(e).__name__}: {e}")

    return result


# ---------------------------------------------------------------------------
# Batch processing
# ---------------------------------------------------------------------------
async def process_leads(leads: list[dict], args) -> list[dict]:
    """
    Process a list of lead dicts, visiting each listing URL to extract contact info.
    Returns enriched leads list.
    """
    enriched = []
    visit_count = 0

    log(f"Processing {len(leads)} leads...")

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
        await stealth.apply_stealth_async(page)

        for i, lead in enumerate(leads):
            listing_url = lead.get("listing_url", "")

            if not listing_url:
                log(f"  [{i+1}/{len(leads)}] No URL — skipping")
                lead["phone_number"] = None
                lead["contact_hidden"] = None
                enriched.append(lead)
                continue

            # Skip if already has a phone number
            if lead.get("phone_number"):
                log(f"  [{i+1}/{len(leads)}] Already has phone — keeping: {lead['phone_number']}")
                enriched.append(lead)
                continue

            # Check session visit limit
            if visit_count >= MAX_VISITS_PER_SESSION:
                log(f"  Session limit reached ({MAX_VISITS_PER_SESSION} visits) — remaining leads kept as-is")
                enriched.append(lead)
                continue

            log(f"  [{i+1}/{len(leads)}] Visiting: {listing_url}")

            # Extract contact
            contact = await extract_contact_from_page(page, listing_url)
            lead["phone_number"] = contact["phone_number"]
            lead["contact_hidden"] = contact["contact_hidden"]
            enriched.append(lead)
            visit_count += 1

            # Random delay between pages
            if i < len(leads) - 1 and visit_count < MAX_VISITS_PER_SESSION:
                delay = random.uniform(MIN_DELAY, MAX_DELAY)
                log(f"  Waiting {delay:.1f}s...")
                await asyncio.sleep(delay)

        await browser.close()

    log(f"\nDone — processed {visit_count} pages")

    # Stats
    with_phone = sum(1 for l in enriched if l.get("phone_number"))
    hidden = sum(1 for l in enriched if l.get("contact_hidden") is True)
    no_info = sum(1 for l in enriched if l.get("phone_number") is None and l.get("contact_hidden") is not True)
    log(f"Results: {with_phone} phones found, {hidden} hidden, {no_info} unknown")

    return enriched


# ---------------------------------------------------------------------------
# Single URL mode
# ---------------------------------------------------------------------------
async def process_single_url(url: str, args):
    """Process a single URL for testing purposes."""
    log(f"Single URL mode: {url}")

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=args.headless,
            args=["--disable-blink-features=AutomationControlled", "--no-sandbox"]
        )
        context = await browser.new_context(
            user_agent=random.choice(USER_AGENTS),
            viewport={"width": 1366, "height": 768},
            locale="fr-FR",
        )
        page = await context.new_page()
        await stealth.apply_stealth_async(page)

        contact = await extract_contact_from_page(page, url)

        await browser.close()

    # Print result
    result = {
        "listing_url": url,
        "phone_number": contact["phone_number"],
        "contact_hidden": contact["contact_hidden"],
    }
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return result


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
def log(message: str):
    """Print to console and append to log file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted = f"[{timestamp}] {message}"
    print(formatted)

    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_file = LOG_DIR / f"extract_contact_{date.today()}.log"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(formatted + "\n")


# ---------------------------------------------------------------------------
# File I/O
# ---------------------------------------------------------------------------
def load_leads(input_path: str) -> list[dict]:
    """Load leads from a JSON file. Returns empty list if file missing or invalid."""
    path = Path(input_path)
    if not path.exists():
        log(f"  Input file not found (skipping): {path}")
        return []

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(data, list):
            log(f"  WARNING: Expected a JSON array in {path}, got {type(data).__name__}")
            return []
        return data
    except json.JSONDecodeError as e:
        log(f"  ERROR: Invalid JSON in {path}: {e}")
        return []


def save_leads(leads: list[dict], output_path: str):
    """Save enriched leads to a JSON file."""
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(leads, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )
    log(f"Saved {len(leads)} enriched leads to {path}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(
        description="Extract phone numbers from Avito/Mubawab listing pages",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  py execution/extract_contact.py --input .tmp/avito_raw.json --output .tmp/avito_enriched.json
  py execution/extract_contact.py --input .tmp/mubawab_raw.json --output .tmp/mubawab_enriched.json
  py execution/extract_contact.py --url "https://www.avito.ma/fr/.../Listing_12345.htm"
  py execution/extract_contact.py --input .tmp/avito_raw.json --dry-run
        """
    )

    parser.add_argument(
        "--input",
        type=str,
        default=None,
        help="Path to input JSON file (from scrape_avito.py or scrape_mubawab.py)",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Path to output enriched JSON file",
    )
    parser.add_argument(
        "--url",
        type=str,
        default=None,
        help="Single listing URL to test contact extraction",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be processed without visiting pages",
    )
    parser.add_argument(
        "--headless",
        action="store_true",
        default=False,
        help="Run in headless mode (default: headed for debugging)",
    )

    args = parser.parse_args()

    # Validate arguments
    if not args.url and not args.input:
        parser.error("Either --input or --url is required")

    # Single URL mode
    if args.url:
        asyncio.run(process_single_url(args.url, args))
        return

    # Batch mode
    leads = load_leads(args.input)

    if not leads:
        log(f"No leads found in {args.input} -- nothing to process.")
        return

    if args.dry_run:
        print(f"\n{'='*60}")
        print(f"DRY RUN — {len(leads)} leads to process:")
        print(f"{'='*60}\n")
        for i, lead in enumerate(leads, 1):
            url = lead.get("listing_url", "N/A")
            has_phone = "✓" if lead.get("phone_number") else "✗"
            platform = lead.get("platform", "?")
            title = lead.get("listing_title", "")[:50]
            print(f"  {i:3d}. [{platform:7s}] [{has_phone}] {title:50s} {url}")

        already_have = sum(1 for l in leads if l.get("phone_number"))
        need_visit = len(leads) - already_have
        print(f"\n  {already_have} already have phone numbers")
        print(f"  {need_visit} need page visits")
        print(f"  Session limit: {MAX_VISITS_PER_SESSION} visits")
        print(f"{'='*60}")
        return

    # Determine output path
    if not args.output:
        input_path = Path(args.input)
        args.output = str(input_path.parent / input_path.name.replace("_raw", "_enriched"))
        if args.output == args.input:
            args.output = str(input_path.parent / f"{input_path.stem}_enriched{input_path.suffix}")

    # Run extraction
    enriched = asyncio.run(process_leads(leads, args))

    # Save results
    save_leads(enriched, args.output)


if __name__ == "__main__":
    main()

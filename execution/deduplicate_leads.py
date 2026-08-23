"""
deduplicate_leads.py — Lead Deduplication
==========================================
Layer 3 execution script.
Combines leads from all 3 platforms and removes duplicates:
  - Avito & Mubawab: deduplicate by phone number (keep first occurrence)
  - Airbnb: deduplicate by listing URL
  - Cross-platform: same phone on Avito + Mubawab = one lead

Usage:
    py execution/deduplicate_leads.py
    py execution/deduplicate_leads.py --avito .tmp/avito_enriched.json --mubawab .tmp/mubawab_enriched.json --airbnb .tmp/airbnb_raw.json
    py execution/deduplicate_leads.py --dry-run
"""

import json
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')
import argparse
from datetime import datetime, date
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent
TMP_DIR = PROJECT_ROOT / ".tmp"
LOG_DIR = PROJECT_ROOT / "logs"

# Default input files
DEFAULT_INPUTS = {
    "avito": TMP_DIR / "avito_enriched.json",
    "mubawab": TMP_DIR / "mubawab_enriched.json",
    "airbnb": TMP_DIR / "airbnb_raw.json",
}

# Output files
OUTPUT_AVITO_MUBAWAB = TMP_DIR / "leads_avito_mubawab_deduped.json"
OUTPUT_AIRBNB = TMP_DIR / "leads_airbnb_deduped.json"


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
def log(message: str):
    """Print to console and append to log file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted = f"[{timestamp}] {message}"
    print(formatted)
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_file = LOG_DIR / f"deduplicate_{date.today()}.log"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(formatted + "\n")


# ---------------------------------------------------------------------------
# File I/O
# ---------------------------------------------------------------------------
def load_json(path: Path) -> list[dict]:
    """Load a JSON file. Returns empty list if file not found."""
    if not path.exists():
        log(f"  File not found (skipping): {path}")
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, list):
            return data
        log(f"  WARNING: Expected JSON array in {path}, got {type(data).__name__}")
        return []
    except json.JSONDecodeError as e:
        log(f"  ERROR: Invalid JSON in {path}: {e}")
        return []


def save_json(leads: list[dict], path: Path):
    """Save leads to a JSON file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(leads, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )
    log(f"  Saved {len(leads)} leads to {path}")


# ---------------------------------------------------------------------------
# Deduplication: Avito & Mubawab (by phone number)
# ---------------------------------------------------------------------------
def deduplicate_by_phone(leads: list[dict]) -> list[dict]:
    """
    Deduplicate Avito & Mubawab leads by phone number.
    
    Rules:
    - Same phone number = same lead → keep first occurrence
    - Leads without a phone number are kept (deduplicated by listing URL instead)
    - Cross-platform: if same phone on Avito + Mubawab, keep the Avito one (first seen)
    """
    seen_phones: dict[str, int] = {}   # phone → index of first occurrence
    seen_urls: set[str] = set()        # for leads without phone
    unique: list[dict] = []
    duplicates_removed = 0

    for lead in leads:
        phone = lead.get("phone_number")
        url = lead.get("listing_url", "")

        if phone:
            # Normalize phone for comparison (strip spaces, dashes)
            phone_key = phone.replace(" ", "").replace("-", "").replace("+", "")

            if phone_key in seen_phones:
                duplicates_removed += 1
                log(f"    DUP (phone): {phone} — kept #{seen_phones[phone_key]+1}, "
                    f"removed [{lead.get('platform', '?')}] {lead.get('listing_title', '')[:40]}")
                continue

            seen_phones[phone_key] = len(unique)
            unique.append(lead)

        else:
            # No phone — deduplicate by URL
            if url in seen_urls:
                duplicates_removed += 1
                log(f"    DUP (url): {url[:60]} — removed")
                continue

            seen_urls.add(url)
            unique.append(lead)

    log(f"  Phone dedup: {len(leads)} → {len(unique)} leads ({duplicates_removed} duplicates removed)")
    return unique


# ---------------------------------------------------------------------------
# Deduplication: Airbnb (by listing URL)
# ---------------------------------------------------------------------------
def deduplicate_by_url(leads: list[dict]) -> list[dict]:
    """
    Deduplicate Airbnb leads by listing URL.
    
    Rules:
    - Same listing URL = same lead → keep first occurrence
    - Normalize URL: strip query params, trailing slashes
    """
    seen_urls: set[str] = set()
    unique: list[dict] = []
    duplicates_removed = 0

    for lead in leads:
        url = lead.get("listing_url", "")

        # Normalize: strip query params and trailing slash
        url_key = url.split("?")[0].rstrip("/").lower()

        if not url_key:
            unique.append(lead)  # Keep leads without URL (shouldn't happen, but safe)
            continue

        if url_key in seen_urls:
            duplicates_removed += 1
            log(f"    DUP (url): {url[:60]} — removed")
            continue

        seen_urls.add(url_key)
        unique.append(lead)

    log(f"  URL dedup: {len(leads)} → {len(unique)} leads ({duplicates_removed} duplicates removed)")
    return unique


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(
        description="Deduplicate leads from Avito, Mubawab, and Airbnb",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  py execution/deduplicate_leads.py
  py execution/deduplicate_leads.py --avito .tmp/avito_enriched.json --airbnb .tmp/airbnb_raw.json
  py execution/deduplicate_leads.py --dry-run
        """
    )
    parser.add_argument("--avito", type=str, default=str(DEFAULT_INPUTS["avito"]),
                        help="Path to Avito enriched JSON")
    parser.add_argument("--mubawab", type=str, default=str(DEFAULT_INPUTS["mubawab"]),
                        help="Path to Mubawab enriched JSON")
    parser.add_argument("--airbnb", type=str, default=str(DEFAULT_INPUTS["airbnb"]),
                        help="Path to Airbnb raw JSON")
    parser.add_argument("--output-am", type=str, default=str(OUTPUT_AVITO_MUBAWAB),
                        help="Output path for deduplicated Avito+Mubawab leads")
    parser.add_argument("--output-airbnb", type=str, default=str(OUTPUT_AIRBNB),
                        help="Output path for deduplicated Airbnb leads")
    parser.add_argument("--dry-run", action="store_true",
                        help="Show stats without writing output files")

    args = parser.parse_args()

    log(f"\n{'='*60}")
    log("DEDUPLICATE LEADS — Starting")
    log(f"{'='*60}")

    # ---- Load Avito & Mubawab leads ----
    log("\nLoading Avito leads...")
    avito_leads = load_json(Path(args.avito))
    log(f"  Loaded {len(avito_leads)} Avito leads")

    log("\nLoading Mubawab leads...")
    mubawab_leads = load_json(Path(args.mubawab))
    log(f"  Loaded {len(mubawab_leads)} Mubawab leads")

    # Combine Avito + Mubawab (Avito first so its entries are kept in case of dupes)
    combined_am = avito_leads + mubawab_leads
    log(f"\nCombined Avito + Mubawab: {len(combined_am)} leads")

    # Deduplicate by phone number
    if combined_am:
        log("\nDeduplicating Avito + Mubawab by phone number...")
        deduped_am = deduplicate_by_phone(combined_am)
    else:
        deduped_am = []
        log("\nNo Avito/Mubawab leads to deduplicate")

    # ---- Load Airbnb leads ----
    log("\nLoading Airbnb leads...")
    airbnb_leads = load_json(Path(args.airbnb))
    log(f"  Loaded {len(airbnb_leads)} Airbnb leads")

    # Deduplicate by URL
    if airbnb_leads:
        log("\nDeduplicating Airbnb by listing URL...")
        deduped_airbnb = deduplicate_by_url(airbnb_leads)
    else:
        deduped_airbnb = []
        log("\nNo Airbnb leads to deduplicate")

    # ---- Summary ----
    log(f"\n{'='*60}")
    log("DEDUPLICATION SUMMARY")
    log(f"{'='*60}")
    log(f"  Avito input:        {len(avito_leads)}")
    log(f"  Mubawab input:      {len(mubawab_leads)}")
    log(f"  Combined A+M:       {len(combined_am)}")
    log(f"  After dedup (A+M):  {len(deduped_am)} ({len(combined_am) - len(deduped_am)} removed)")
    log(f"  Airbnb input:       {len(airbnb_leads)}")
    log(f"  After dedup (Air):  {len(deduped_airbnb)} ({len(airbnb_leads) - len(deduped_airbnb)} removed)")
    log(f"  TOTAL unique leads: {len(deduped_am) + len(deduped_airbnb)}")

    if args.dry_run:
        log("\nDRY RUN — no files written")
        return

    # ---- Save output ----
    if deduped_am:
        log(f"\nSaving Avito+Mubawab leads...")
        save_json(deduped_am, Path(args.output_am))

    if deduped_airbnb:
        log(f"\nSaving Airbnb leads...")
        save_json(deduped_airbnb, Path(args.output_airbnb))

    log(f"\n{'='*60}")
    log("DONE")
    log(f"{'='*60}")


if __name__ == "__main__":
    main()

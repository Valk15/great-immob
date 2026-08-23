"""
validate_data.py — Lead Data Validation & Cleaning
====================================================
Layer 3 execution script.
Validates and cleans leads from the deduplication step:
  - Validates Moroccan phone format (+212 or 06/07/05 prefix)
  - Cleans all string fields (trim, strip special chars)
  - Flags rows with missing critical fields
  - Outputs validated JSON files to .tmp/

Input:  .tmp/leads_avito_mubawab_deduped.json, .tmp/leads_airbnb_deduped.json
Output: .tmp/leads_avito_mubawab_validated.json, .tmp/leads_airbnb_validated.json

Usage:
    py execution/validate_data.py
    py execution/validate_data.py --input .tmp/leads_avito_mubawab_deduped.json --output .tmp/validated.json
    py execution/validate_data.py --dry-run
"""

import json
import re
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')
import argparse
from datetime import datetime, date
from pathlib import Path
from unicodedata import normalize as unicode_normalize

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent
TMP_DIR = PROJECT_ROOT / ".tmp"
LOG_DIR = PROJECT_ROOT / "logs"

# Default input/output paths
DEFAULT_INPUT_AM = TMP_DIR / "leads_avito_mubawab_deduped.json"
DEFAULT_INPUT_AIRBNB = TMP_DIR / "leads_airbnb_deduped.json"
DEFAULT_OUTPUT_AM = TMP_DIR / "leads_avito_mubawab_validated.json"
DEFAULT_OUTPUT_AIRBNB = TMP_DIR / "leads_airbnb_validated.json"

# ---------------------------------------------------------------------------
# Critical fields per platform
# ---------------------------------------------------------------------------
# Always required regardless of platform
ALWAYS_REQUIRED = ["listing_url"]

# Required for Avito / Mubawab (phone is optional but flagged if missing)
AM_REQUIRED = ["listing_url", "listing_title", "region", "platform"]
AM_OPTIONAL_FLAGGED = ["phone_number", "owner_name", "price_mad"]

# Required for Airbnb (no phone expected)
AIRBNB_REQUIRED = ["listing_url", "listing_title", "region", "platform"]
AIRBNB_OPTIONAL_FLAGGED = ["price_per_night_mad", "rating"]

# ---------------------------------------------------------------------------
# Moroccan phone validation
# ---------------------------------------------------------------------------
# Valid formats:
#   +212 6XX-XXXXXX   (normalized format from extract_contact.py)
#   +212 7XX-XXXXXX
#   +212 5XX-XXXXXX
#   06XXXXXXXX, 07XXXXXXXX, 05XXXXXXXX (local)
#   +2126XXXXXXXX, +2127XXXXXXXX (compact international)
MOROCCAN_PHONE_REGEX = re.compile(
    r'^(?:'
    r'\+212[\s.-]?[5-7]\d{2}[\s.-]?\d{6}'  # +212 6XX-XXXXXX
    r'|0[5-7]\d{8}'                          # 06XXXXXXXX
    r'|\+212[5-7]\d{8}'                      # +2126XXXXXXXX (compact)
    r')$'
)


def is_valid_moroccan_phone(phone: str | None) -> bool:
    """Check if a phone number matches valid Moroccan mobile format."""
    if not phone:
        return False
    # Strip all whitespace, dashes, dots for validation
    cleaned = re.sub(r'[\s.\-]', '', phone)
    return bool(MOROCCAN_PHONE_REGEX.match(cleaned))


def normalize_phone_format(phone: str | None) -> str | None:
    """
    Ensure phone is in the canonical format: +212 6XX-XXXXXX.
    Returns None if phone is None or invalid.
    """
    if not phone:
        return None

    # Strip everything except digits and leading +
    digits = re.sub(r'[^\d]', '', phone)

    # Convert to standard form
    if digits.startswith('00212'):
        digits = digits[5:]
    elif digits.startswith('212'):
        digits = digits[3:]
    elif digits.startswith('0'):
        digits = digits[1:]

    # Validate: 9 digits starting with 5, 6, or 7
    if len(digits) != 9 or digits[0] not in '567':
        return phone  # Return original if can't normalize (don't destroy data)

    return f"+212 {digits[:3]}-{digits[3:]}"


# ---------------------------------------------------------------------------
# String cleaning
# ---------------------------------------------------------------------------
def clean_string(value: str | None) -> str | None:
    """
    Clean a string field:
    - Trim leading/trailing whitespace
    - Normalize unicode (NFC)
    - Remove control characters
    - Collapse multiple spaces to one
    - Strip zero-width chars
    """
    if value is None:
        return None
    if not isinstance(value, str):
        return value

    # Unicode normalization (NFC)
    cleaned = unicode_normalize('NFC', value)

    # Remove control characters (keep newlines for now, strip later)
    cleaned = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', cleaned)

    # Remove zero-width characters
    cleaned = re.sub(r'[\u200b\u200c\u200d\ufeff\u00ad]', '', cleaned)

    # Replace newlines/tabs with space
    cleaned = re.sub(r'[\n\r\t]+', ' ', cleaned)

    # Collapse multiple spaces
    cleaned = re.sub(r' +', ' ', cleaned)

    # Trim
    cleaned = cleaned.strip()

    return cleaned if cleaned else None


def clean_all_strings(lead: dict) -> dict:
    """Clean all string fields in a lead dict."""
    for key, value in lead.items():
        if isinstance(value, str):
            lead[key] = clean_string(value)
    return lead


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------
def validate_lead(lead: dict, platform_type: str) -> dict:
    """
    Validate a single lead and add validation metadata.

    Args:
        lead: The lead dict to validate
        platform_type: "avito_mubawab" or "airbnb"

    Returns:
        The lead dict with added validation fields:
        - _valid: bool — True if all critical fields present
        - _warnings: list[str] — human-readable warnings
        - _phone_valid: bool — (Avito/Mubawab only) phone format OK
    """
    warnings = []

    # ---- Check critical fields ----
    is_valid = True

    # URL is ALWAYS required
    url = lead.get("listing_url")
    if not url or not isinstance(url, str) or not url.startswith("http"):
        warnings.append("CRITICAL: missing or invalid listing_url")
        is_valid = False

    if platform_type == "avito_mubawab":
        # Required fields
        for field in AM_REQUIRED:
            val = lead.get(field)
            if val is None or (isinstance(val, str) and not val.strip()):
                if field != "listing_url":  # Already checked above
                    warnings.append(f"Missing required field: {field}")
                    is_valid = False

        # Phone validation (optional but flagged)
        phone = lead.get("phone_number")
        contact_hidden = lead.get("contact_hidden")

        if phone:
            if is_valid_moroccan_phone(phone):
                lead["_phone_valid"] = True
                # Normalize to canonical format
                lead["phone_number"] = normalize_phone_format(phone)
            else:
                lead["_phone_valid"] = False
                warnings.append(f"Invalid phone format: {phone}")
        else:
            lead["_phone_valid"] = None
            if contact_hidden is not True:
                warnings.append("No phone number and contact_hidden is not True")

        # Optional flagged fields
        for field in AM_OPTIONAL_FLAGGED:
            if field == "phone_number":
                continue  # Already handled
            val = lead.get(field)
            if val is None:
                warnings.append(f"Optional field missing: {field}")

    elif platform_type == "airbnb":
        # Required fields
        for field in AIRBNB_REQUIRED:
            val = lead.get(field)
            if val is None or (isinstance(val, str) and not val.strip()):
                if field != "listing_url":
                    warnings.append(f"Missing required field: {field}")
                    is_valid = False

        # No phone expected for Airbnb — no phone validation needed

        # Optional flagged fields
        for field in AIRBNB_OPTIONAL_FLAGGED:
            val = lead.get(field)
            if val is None:
                warnings.append(f"Optional field missing: {field}")

        # Validate numeric ranges
        rating = lead.get("rating")
        if rating is not None and (rating < 0 or rating > 5):
            warnings.append(f"Rating out of range [0-5]: {rating}")

        occupancy = lead.get("estimated_occupancy_90d")
        if occupancy is not None and (occupancy < 0 or occupancy > 100):
            warnings.append(f"Occupancy out of range [0-100]: {occupancy}")

        review_count = lead.get("review_count")
        if review_count is not None and review_count < 0:
            warnings.append(f"Negative review count: {review_count}")

    # ---- Add validation metadata ----
    lead["_valid"] = is_valid
    lead["_warnings"] = warnings
    lead["_validated_at"] = datetime.now().isoformat(timespec="seconds")

    return lead


# ---------------------------------------------------------------------------
# Batch processing
# ---------------------------------------------------------------------------
def validate_batch(leads: list[dict], platform_type: str) -> list[dict]:
    """
    Validate and clean a batch of leads.

    Returns the validated leads list (including invalid ones, flagged).
    """
    validated = []
    valid_count = 0
    invalid_count = 0
    total_warnings = 0

    for lead in leads:
        # Step 1: Clean all strings
        lead = clean_all_strings(lead)

        # Step 2: Validate
        lead = validate_lead(lead, platform_type)

        if lead["_valid"]:
            valid_count += 1
        else:
            invalid_count += 1

        total_warnings += len(lead.get("_warnings", []))
        validated.append(lead)

    log(f"  Validated: {valid_count} valid, {invalid_count} invalid, {total_warnings} total warnings")
    return validated


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
def log(message: str):
    """Print to console and append to log file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted = f"[{timestamp}] {message}"
    print(formatted)
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_file = LOG_DIR / f"validate_{date.today()}.log"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(formatted + "\n")


# ---------------------------------------------------------------------------
# File I/O
# ---------------------------------------------------------------------------
def load_json(path: Path) -> list[dict]:
    """Load a JSON file. Returns empty list if not found."""
    if not path.exists():
        log(f"  File not found (skipping): {path}")
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, list):
            return data
        log(f"  WARNING: Expected JSON array in {path}")
        return []
    except json.JSONDecodeError as e:
        log(f"  ERROR: Invalid JSON in {path}: {e}")
        return []


def save_json(leads: list[dict], path: Path):
    """Save validated leads to JSON."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(leads, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )
    log(f"  Saved {len(leads)} validated leads to {path}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(
        description="Validate and clean lead data",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  py execution/validate_data.py
  py execution/validate_data.py --input .tmp/leads_avito_mubawab_deduped.json --output .tmp/validated.json --type avito_mubawab
  py execution/validate_data.py --dry-run
        """
    )
    parser.add_argument("--input", type=str, default=None,
                        help="Single input JSON file to validate")
    parser.add_argument("--output", type=str, default=None,
                        help="Output path for validated JSON")
    parser.add_argument("--type", type=str, choices=["avito_mubawab", "airbnb"],
                        default=None, help="Platform type (required with --input)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Show validation results without writing files")

    args = parser.parse_args()

    log(f"\n{'='*60}")
    log("VALIDATE DATA — Starting")
    log(f"{'='*60}")

    if args.input:
        # ---- Single file mode ----
        if not args.type:
            parser.error("--type is required when using --input")

        leads = load_json(Path(args.input))
        log(f"\nLoaded {len(leads)} leads from {args.input}")

        if leads:
            validated = validate_batch(leads, args.type)
            if not args.dry_run:
                output_path = Path(args.output) if args.output else Path(args.input).with_suffix('.validated.json')
                save_json(validated, output_path)
        else:
            log("No leads to validate")

    else:
        # ---- Default mode: process both files ----

        # Avito + Mubawab
        log("\n--- Avito + Mubawab leads ---")
        am_leads = load_json(DEFAULT_INPUT_AM)
        log(f"  Loaded {len(am_leads)} leads")

        if am_leads:
            am_validated = validate_batch(am_leads, "avito_mubawab")

            # Stats
            phones_valid = sum(1 for l in am_validated if l.get("_phone_valid") is True)
            phones_invalid = sum(1 for l in am_validated if l.get("_phone_valid") is False)
            phones_missing = sum(1 for l in am_validated if l.get("_phone_valid") is None)
            log(f"  Phone stats: {phones_valid} valid, {phones_invalid} invalid format, {phones_missing} missing")

            if not args.dry_run:
                save_json(am_validated, DEFAULT_OUTPUT_AM)
        else:
            log("  No Avito/Mubawab leads found")

        # Airbnb
        log("\n--- Airbnb leads ---")
        airbnb_leads = load_json(DEFAULT_INPUT_AIRBNB)
        log(f"  Loaded {len(airbnb_leads)} leads")

        if airbnb_leads:
            airbnb_validated = validate_batch(airbnb_leads, "airbnb")

            # Stats
            priority = sum(1 for l in airbnb_validated if l.get("priority_lead") is True)
            with_occupancy = sum(1 for l in airbnb_validated if l.get("estimated_occupancy_90d") is not None)
            log(f"  Priority leads: {priority}")
            log(f"  With occupancy data: {with_occupancy}")

            if not args.dry_run:
                save_json(airbnb_validated, DEFAULT_OUTPUT_AIRBNB)
        else:
            log("  No Airbnb leads found")

    # ---- Summary ----
    log(f"\n{'='*60}")
    log("VALIDATION COMPLETE")
    if args.dry_run:
        log("DRY RUN — no files written")
    log(f"{'='*60}")


if __name__ == "__main__":
    main()

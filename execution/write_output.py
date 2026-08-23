"""
write_output.py — Google Sheets Lead Writer
=============================================
Layer 3 execution script.
Reads validated leads from .tmp/ and writes them to Google Sheets.

Sheet structure (from agents.md):
  Sheet 1 — "Avito & Mubawab": Platform, Region, Listing Type, Title, Owner,
            Phone, Contact Hidden, Price, URL, Scraped At, Status, Notes
  Sheet 2 — "Airbnb": Region, Title, Price/Night, Rating, Review Count,
            Superhost, Occupancy 90d, Priority Lead, URL, Scraped At, Status, Notes

Spreadsheet name: GREATIMMOB - Leads Gestion Locative

Requirements:
  py -m pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client

Usage:
  py execution/write_output.py                   # Write all validated leads
  py execution/write_output.py --sheet1-only     # Write Avito/Mubawab only
  py execution/write_output.py --sheet2-only     # Write Airbnb only
  py execution/write_output.py --dry-run         # Show what would be written
"""

import json
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')
import argparse
import os
from datetime import datetime, date
from pathlib import Path

# ---------------------------------------------------------------------------
# Dependencies check
# ---------------------------------------------------------------------------
try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError:
    print("ERROR: Google API libraries not installed. Run:")
    print("  py -m pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")
    sys.exit(1)


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent
TMP_DIR = PROJECT_ROOT / ".tmp"
LOG_DIR = PROJECT_ROOT / "logs"

# Input files (validated leads)
INPUT_AM = TMP_DIR / "leads_avito_mubawab_validated.json"
INPUT_AIRBNB = TMP_DIR / "leads_airbnb_validated.json"

# Google Sheets settings
SPREADSHEET_NAME = "GREATIMMOB - Leads Gestion Locative"
SPREADSHEET_ID = "1gd8oFon4P5Iq1hSLmlhGVfNMTpvRf-RuvKEAkK--m1o"
SHEET1_NAME = "Avito & Mubawab"
SHEET2_NAME = "Airbnb"

# OAuth2 credentials (must be in project root)
CREDENTIALS_FILE = PROJECT_ROOT / "credentials.json"
TOKEN_FILE = PROJECT_ROOT / "token.json"

# Google Sheets API scope — full read/write access
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]


# ---------------------------------------------------------------------------
# Sheet 1 — Avito & Mubawab column structure
# ---------------------------------------------------------------------------
SHEET1_HEADERS = [
    "Platform",          # A
    "Region",            # B
    "Listing Type",      # C
    "Listing Title",     # D
    "Owner Name",        # E
    "Phone Number",      # F
    "Contact Hidden",    # G
    "Price (MAD)",       # H
    "Listing URL",       # I
    "Scraped At",        # J
    "Status",            # K
    "Notes",             # L
]


def lead_to_sheet1_row(lead: dict) -> list:
    """Convert an Avito/Mubawab lead dict to a Sheet 1 row."""
    contact_hidden = lead.get("contact_hidden")
    if contact_hidden is True:
        hidden_str = "TRUE"
    elif contact_hidden is False:
        hidden_str = "FALSE"
    else:
        hidden_str = ""

    return [
        lead.get("platform", ""),
        lead.get("region", ""),
        lead.get("listing_type", ""),
        lead.get("listing_title", ""),
        lead.get("owner_name", "") or "",
        lead.get("phone_number", "") or "",
        hidden_str,
        lead.get("price_mad") or "",
        lead.get("listing_url", ""),
        lead.get("scraped_at", ""),
        "new",       # Default status
        "",          # Notes — operator fills manually
    ]


# ---------------------------------------------------------------------------
# Sheet 2 — Airbnb column structure
# ---------------------------------------------------------------------------
SHEET2_HEADERS = [
    "Region",            # A
    "Listing Title",     # B
    "Price/Night (MAD)", # C
    "Rating",            # D
    "Review Count",      # E
    "Superhost",         # F
    "Guest Favourite",   # G
    "Occupancy Est. 90d",# H
    "Priority Lead",     # I
    "Outreach Note",     # J
    "Listing URL",       # K
    "Scraped At",        # L
    "Status",            # M
    "Notes",             # N
]


def lead_to_sheet2_row(lead: dict) -> list:
    """Convert an Airbnb lead dict to a Sheet 2 row."""
    is_superhost = lead.get("is_superhost")
    superhost_str = "YES" if is_superhost else "NO"

    priority = lead.get("priority_lead")
    priority_str = "YES" if priority else "NO"

    occupancy = lead.get("estimated_occupancy_90d")
    occupancy_str = f"{occupancy}%" if occupancy is not None else ""

    guest_fav = lead.get("guest_favourite")
    guest_fav_str = "YES" if guest_fav else "NO"

    outreach_note = lead.get("outreach_note", "")

    return [
        lead.get("region", ""),
        lead.get("listing_title", ""),
        lead.get("price_per_night_mad") or "",
        lead.get("rating") or "",
        lead.get("review_count") or "",
        superhost_str,
        guest_fav_str,
        occupancy_str,
        priority_str,
        outreach_note,
        lead.get("listing_url", ""),
        lead.get("scraped_at", ""),
        "new",       # Default status
        "",          # Notes — operator fills manually
    ]


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
def log(message: str):
    """Print to console and append to log file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted = f"[{timestamp}] {message}"
    print(formatted)
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_file = LOG_DIR / f"write_output_{date.today()}.log"
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


# ---------------------------------------------------------------------------
# Google Sheets Authentication
# ---------------------------------------------------------------------------
def get_sheets_service():
    """
    Authenticate with Google Sheets API using OAuth2.
    
    Requires:
    - credentials.json in project root (download from Google Cloud Console)
    - On first run, opens browser for OAuth consent → saves token.json
    """
    creds = None

    # Load existing token
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)

    # If no valid creds, authenticate
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            log("  Refreshing expired OAuth token...")
            try:
                creds.refresh(Request())
            except Exception as e:
                log(f"  Token refresh failed ({e}) — starting fresh OAuth flow...")
                creds = None

        if not creds or not creds.valid:
            if not CREDENTIALS_FILE.exists():
                log(f"ERROR: {CREDENTIALS_FILE} not found!")
                log("Download it from Google Cloud Console → APIs & Services → Credentials")
                log("Create an OAuth 2.0 Client ID (Desktop application)")
                sys.exit(1)

            log("  Starting OAuth2 authorization flow...")
            log("  ╔════════════════════════════════════════════════════════════╗")
            log("  ║  CHECK YOUR BROWSER! A Google sign-in page should open.   ║")
            log("  ║  Sign in and click 'Allow' within 5 minutes.              ║")
            log("  ╚════════════════════════════════════════════════════════════╝")
            flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_FILE), SCOPES)
            creds = flow.run_local_server(port=0, timeout_seconds=300)

        # Save token for future use
        TOKEN_FILE.write_text(creds.to_json(), encoding="utf-8")
        log(f"  Token saved to {TOKEN_FILE}")

    service = build("sheets", "v4", credentials=creds)
    return service


# ---------------------------------------------------------------------------
# Spreadsheet operations
# ---------------------------------------------------------------------------
def find_or_create_spreadsheet(service) -> str:
    """
    Find the spreadsheet by name or create it if it doesn't exist.
    Returns the spreadsheet ID.
    """
    # Search for existing spreadsheet using Drive API
    try:
        drive_service = build("drive", "v3", credentials=service._http.credentials)
        results = drive_service.files().list(
            q=f"name='{SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
            spaces="drive",
            fields="files(id, name)",
        ).execute()
        files = results.get("files", [])

        if files:
            spreadsheet_id = files[0]["id"]
            log(f"  Found existing spreadsheet: {spreadsheet_id}")
            return spreadsheet_id
    except Exception as e:
        log(f"  Drive search failed: {e} — will create new spreadsheet")

    # Create new spreadsheet
    log(f"  Creating new spreadsheet: {SPREADSHEET_NAME}")

    spreadsheet_body = {
        "properties": {"title": SPREADSHEET_NAME},
        "sheets": [
            {
                "properties": {
                    "title": SHEET1_NAME,
                    "index": 0,
                    "gridProperties": {"frozenRowCount": 1},
                }
            },
            {
                "properties": {
                    "title": SHEET2_NAME,
                    "index": 1,
                    "gridProperties": {"frozenRowCount": 1},
                }
            },
        ],
    }

    spreadsheet = (
        service.spreadsheets()
        .create(body=spreadsheet_body, fields="spreadsheetId")
        .execute()
    )
    spreadsheet_id = spreadsheet["spreadsheetId"]
    log(f"  Created spreadsheet: {spreadsheet_id}")

    return spreadsheet_id


def ensure_sheet_exists(service, spreadsheet_id: str, sheet_name: str):
    """Ensure a sheet tab exists in the spreadsheet."""
    try:
        metadata = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
        existing_sheets = [s["properties"]["title"] for s in metadata.get("sheets", [])]

        if sheet_name not in existing_sheets:
            log(f"  Creating sheet tab: {sheet_name}")
            service.spreadsheets().batchUpdate(
                spreadsheetId=spreadsheet_id,
                body={
                    "requests": [
                        {
                            "addSheet": {
                                "properties": {
                                    "title": sheet_name,
                                    "gridProperties": {"frozenRowCount": 1},
                                }
                            }
                        }
                    ]
                },
            ).execute()
    except HttpError as e:
        log(f"  Error checking/creating sheet: {e}")


def get_existing_urls(service, spreadsheet_id: str, sheet_name: str,
                      url_column: str) -> set:
    """
    Get existing listing URLs from a sheet to avoid duplicating rows.
    url_column: e.g. "I" for Sheet 1, "I" for Sheet 2
    """
    try:
        result = (
            service.spreadsheets()
            .values()
            .get(
                spreadsheetId=spreadsheet_id,
                range=f"'{sheet_name}'!{url_column}:{url_column}",
            )
            .execute()
        )
        values = result.get("values", [])
        # Skip header row, flatten to set
        return {row[0] for row in values[1:] if row}
    except HttpError:
        return set()


def write_leads_to_sheet(service, spreadsheet_id: str, sheet_name: str,
                         headers: list, rows: list[list]):
    """
    Write leads to a sheet. Adds headers if sheet is empty, then appends rows.
    """
    # Check if sheet has content
    try:
        result = (
            service.spreadsheets()
            .values()
            .get(spreadsheetId=spreadsheet_id, range=f"'{sheet_name}'!A1:A1")
            .execute()
        )
        has_content = bool(result.get("values"))
    except HttpError:
        has_content = False

    # Write headers if empty
    if not has_content:
        log(f"  Writing header row to '{sheet_name}'...")
        service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=f"'{sheet_name}'!A1",
            valueInputOption="RAW",
            body={"values": [headers]},
        ).execute()

    # Append data rows
    if rows:
        log(f"  Appending {len(rows)} rows to '{sheet_name}'...")
        service.spreadsheets().values().append(
            spreadsheetId=spreadsheet_id,
            range=f"'{sheet_name}'!A:L",
            valueInputOption="USER_ENTERED",
            insertDataOption="INSERT_ROWS",
            body={"values": rows},
        ).execute()
        log(f"  ✓ {len(rows)} rows written to '{sheet_name}'")
    else:
        log(f"  No rows to write to '{sheet_name}'")


# ---------------------------------------------------------------------------
# Sanitize strings for Sheets
# ---------------------------------------------------------------------------
def sanitize_for_sheets(value) -> str:
    """
    Sanitize a value for Google Sheets:
    - Convert to string
    - Remove control characters
    - Strip leading = + - @ (formula injection prevention)
    """
    if value is None:
        return ""
    s = str(value)

    # Remove control characters
    import re
    s = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', s)

    # Prevent formula injection
    if s and s[0] in ('=', '+', '-', '@'):
        s = f"'{s}"

    return s


def sanitize_row(row: list) -> list:
    """Sanitize all values in a row."""
    return [sanitize_for_sheets(v) for v in row]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(
        description="Write validated leads to Google Sheets",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  py execution/write_output.py                   # Write all leads
  py execution/write_output.py --sheet1-only     # Avito/Mubawab only
  py execution/write_output.py --sheet2-only     # Airbnb only
  py execution/write_output.py --dry-run         # Preview without writing
        """
    )
    parser.add_argument("--sheet1-only", action="store_true",
                        help="Write only Avito/Mubawab leads (Sheet 1)")
    parser.add_argument("--sheet2-only", action="store_true",
                        help="Write only Airbnb leads (Sheet 2)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Preview rows without writing to Sheets")
    parser.add_argument("--input-am", type=str, default=str(INPUT_AM),
                        help="Path to validated Avito/Mubawab JSON")
    parser.add_argument("--input-airbnb", type=str, default=str(INPUT_AIRBNB),
                        help="Path to validated Airbnb JSON")

    args = parser.parse_args()

    log(f"\n{'='*60}")
    log("WRITE OUTPUT — Google Sheets")
    log(f"{'='*60}")

    # ---- Load validated leads ----
    am_rows = []
    airbnb_rows = []

    if not args.sheet2_only:
        log("\nLoading Avito/Mubawab validated leads...")
        am_leads = load_json(Path(args.input_am))
        log(f"  Loaded {len(am_leads)} leads")

        # Filter: only write valid leads
        valid_am = [l for l in am_leads if l.get("_valid", True)]
        log(f"  Valid leads: {len(valid_am)}")

        am_rows = [sanitize_row(lead_to_sheet1_row(l)) for l in valid_am]

    if not args.sheet1_only:
        log("\nLoading Airbnb validated leads...")
        airbnb_leads = load_json(Path(args.input_airbnb))
        log(f"  Loaded {len(airbnb_leads)} leads")

        valid_airbnb = [l for l in airbnb_leads if l.get("_valid", True)]
        log(f"  Valid leads: {len(valid_airbnb)}")

        airbnb_rows = [sanitize_row(lead_to_sheet2_row(l)) for l in valid_airbnb]

    # ---- Dry run ----
    if args.dry_run:
        log(f"\n{'='*60}")
        log("DRY RUN — Preview")
        log(f"{'='*60}")

        if am_rows:
            log(f"\nSheet 1 ({SHEET1_NAME}): {len(am_rows)} rows")
            log(f"  Headers: {SHEET1_HEADERS}")
            for i, row in enumerate(am_rows[:3], 1):
                log(f"  Row {i}: {row}")
            if len(am_rows) > 3:
                log(f"  ... and {len(am_rows) - 3} more rows")

        if airbnb_rows:
            log(f"\nSheet 2 ({SHEET2_NAME}): {len(airbnb_rows)} rows")
            log(f"  Headers: {SHEET2_HEADERS}")
            for i, row in enumerate(airbnb_rows[:3], 1):
                log(f"  Row {i}: {row}")
            if len(airbnb_rows) > 3:
                log(f"  ... and {len(airbnb_rows) - 3} more rows")

        log("\nNo data written (dry run)")
        return

    # ---- Check we have something to write ----
    if not am_rows and not airbnb_rows:
        log("\nNo leads to write. Run the scraping pipeline first.")
        return

    # ---- Authenticate ----
    log("\nAuthenticating with Google Sheets API...")
    service = get_sheets_service()

    # ---- Use hardcoded spreadsheet ID ----
    spreadsheet_id = SPREADSHEET_ID
    log(f"  Using spreadsheet: {spreadsheet_id}")

    # ---- Write Sheet 1 (Avito & Mubawab) ----
    if am_rows and not args.sheet2_only:
        log(f"\n--- Writing to '{SHEET1_NAME}' ---")
        ensure_sheet_exists(service, spreadsheet_id, SHEET1_NAME)

        # Check for existing URLs to avoid duplicates
        existing_urls = get_existing_urls(service, spreadsheet_id, SHEET1_NAME, "I")
        new_rows = [r for r in am_rows if r[8] not in existing_urls]  # Column I = index 8

        if len(new_rows) < len(am_rows):
            log(f"  Skipped {len(am_rows) - len(new_rows)} duplicate URLs")

        write_leads_to_sheet(service, spreadsheet_id, SHEET1_NAME,
                             SHEET1_HEADERS, new_rows)

    # ---- Write Sheet 2 (Airbnb) ----
    if airbnb_rows and not args.sheet1_only:
        log(f"\n--- Writing to '{SHEET2_NAME}' ---")
        ensure_sheet_exists(service, spreadsheet_id, SHEET2_NAME)

        # Check for existing URLs to avoid duplicates
        existing_urls = get_existing_urls(service, spreadsheet_id, SHEET2_NAME, "K")
        new_rows = [r for r in airbnb_rows if r[10] not in existing_urls]  # Column K = index 10

        if len(new_rows) < len(airbnb_rows):
            log(f"  Skipped {len(airbnb_rows) - len(new_rows)} duplicate URLs")

        write_leads_to_sheet(service, spreadsheet_id, SHEET2_NAME,
                             SHEET2_HEADERS, new_rows)

    # ---- Summary ----
    log(f"\n{'='*60}")
    log("DONE — Google Sheets updated")
    log(f"  Spreadsheet: {SPREADSHEET_NAME}")
    log(f"  URL: https://docs.google.com/spreadsheets/d/{spreadsheet_id}")
    log(f"{'='*60}")


if __name__ == "__main__":
    main()

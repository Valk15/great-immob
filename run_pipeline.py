"""
run_pipeline.py — Master Pipeline Runner
==========================================
Executes the full lead scraping pipeline in order:

  1. scrape_avito.py     → .tmp/avito_raw.json
  2. scrape_mubawab.py   → .tmp/mubawab_raw.json
  3. scrape_airbnb.py    → .tmp/airbnb_raw.json
  4. extract_contact.py  → .tmp/avito_enriched.json (Avito only)
  5. extract_contact.py  → .tmp/mubawab_enriched.json (Mubawab only)
  6. deduplicate_leads.py → .tmp/leads_*_deduped.json
  7. validate_data.py    → .tmp/leads_*_validated.json
  8. write_output.py     → Google Sheets

If any single script fails, the error is logged to logs/errors.log
and the pipeline continues with the next step.

Usage:
    py run_pipeline.py                    # Full pipeline
    py run_pipeline.py --skip-scrape      # Skip scraping, start from extract
    py run_pipeline.py --skip-sheets      # Skip Google Sheets output
    py run_pipeline.py --dry-run          # Show steps without executing
    py run_pipeline.py --headless         # Run browsers in headless mode
"""

import subprocess
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')
import os
from datetime import datetime, date
from pathlib import Path
import argparse

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent
TMP_DIR = PROJECT_ROOT / ".tmp"
LOG_DIR = PROJECT_ROOT / "logs"
ERROR_LOG = LOG_DIR / "errors.log"

# Python executable
PYTHON = "py"

# Script paths (relative to project root)
SCRIPTS = {
    "scrape_avito": "execution/scrape_avito.py",
    "scrape_mubawab": "execution/scrape_mubawab.py",
    "scrape_airbnb": "execution/scrape_airbnb.py",
    "extract_contact_avito": "execution/extract_contact.py",
    "extract_contact_mubawab": "execution/extract_contact.py",
    "deduplicate_leads": "execution/deduplicate_leads.py",
    "validate_data": "execution/validate_data.py",
    "write_output": "execution/write_output.py",
}


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
def log(message: str):
    """Print to console with timestamp."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted = f"[{timestamp}] {message}"
    print(formatted)


def log_error(step_name: str, error_message: str):
    """Log an error to logs/errors.log and console."""
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"[{timestamp}] PIPELINE ERROR in '{step_name}':\n{error_message}\n{'—'*60}\n"
    print(f"  ⚠ ERROR in {step_name}: {error_message[:100]}")
    with open(ERROR_LOG, "a", encoding="utf-8") as f:
        f.write(entry)


# ---------------------------------------------------------------------------
# Step runner
# ---------------------------------------------------------------------------
def run_step(step_name: str, command: list[str], dry_run: bool = False) -> bool:
    """
    Run a single pipeline step.

    Args:
        step_name: Human-readable step name for logging
        command: Command to execute as list (e.g. ["py", "script.py", "--arg"])
        dry_run: If True, just print the command without executing

    Returns:
        True if step succeeded (or dry_run), False if it failed
    """
    cmd_str = " ".join(command)
    log(f"\n{'─'*60}")
    log(f"STEP: {step_name}")
    log(f"CMD:  {cmd_str}")
    log(f"{'─'*60}")

    if dry_run:
        log(f"  [DRY RUN] Would execute: {cmd_str}")
        return True

    try:
        result = subprocess.run(
            command,
            cwd=str(PROJECT_ROOT),
            capture_output=True,
            text=True,
            timeout=600,  # 10-minute timeout per step
            encoding="utf-8",
            errors="replace",
        )

        # Print stdout (truncated to last 30 lines for readability)
        if result.stdout:
            lines = result.stdout.strip().split("\n")
            if len(lines) > 30:
                print(f"  ... ({len(lines) - 30} lines omitted)")
                for line in lines[-30:]:
                    print(f"  {line}")
            else:
                for line in lines:
                    print(f"  {line}")

        # Check for failure
        if result.returncode != 0:
            error_msg = result.stderr or f"Exit code {result.returncode}"
            log_error(step_name, error_msg)
            log(f"  FAILED (exit code {result.returncode}) — continuing pipeline")
            return False

        log(f"  ✓ {step_name} completed successfully")
        return True

    except subprocess.TimeoutExpired:
        log_error(step_name, "Timed out after 600 seconds")
        log(f"  TIMEOUT — continuing pipeline")
        return False

    except Exception as e:
        log_error(step_name, str(e))
        log(f"  EXCEPTION: {e} — continuing pipeline")
        return False


# ---------------------------------------------------------------------------
# Pipeline definition
# ---------------------------------------------------------------------------
def build_pipeline(args) -> list[dict]:
    """
    Build the ordered list of pipeline steps.

    Each step is a dict with:
        name: Human-readable step name
        command: List of command parts
        skip: Whether to skip this step based on CLI flags
    """
    headless_flag = ["--headless"] if args.headless else []

    steps = [
        # ---- Phase 1: Scraping ----
        {
            "name": "Scrape Avito",
            "command": [PYTHON, SCRIPTS["scrape_avito"]] + headless_flag,
            "skip": args.skip_scrape,
        },
        {
            "name": "Scrape Mubawab",
            "command": [PYTHON, SCRIPTS["scrape_mubawab"]] + headless_flag,
            "skip": args.skip_scrape,
        },
        {
            "name": "Scrape Airbnb",
            "command": [PYTHON, SCRIPTS["scrape_airbnb"]] + headless_flag,
            "skip": args.skip_scrape,
        },

        # ---- Phase 2: Contact Extraction (Avito + Mubawab only) ----
        {
            "name": "Extract Contacts — Avito",
            "command": [
                PYTHON, SCRIPTS["extract_contact_avito"],
                "--input", str(TMP_DIR / "avito_raw.json"),
                "--output", str(TMP_DIR / "avito_enriched.json"),
            ],
            "skip": args.skip_scrape,
        },
        {
            "name": "Extract Contacts — Mubawab",
            "command": [
                PYTHON, SCRIPTS["extract_contact_mubawab"],
                "--input", str(TMP_DIR / "mubawab_raw.json"),
                "--output", str(TMP_DIR / "mubawab_enriched.json"),
            ],
            "skip": args.skip_scrape,
        },

        # ---- Phase 3: Deduplication ----
        {
            "name": "Deduplicate Leads",
            "command": [PYTHON, SCRIPTS["deduplicate_leads"]],
            "skip": False,
        },

        # ---- Phase 4: Validation ----
        {
            "name": "Validate Data",
            "command": [PYTHON, SCRIPTS["validate_data"]],
            "skip": False,
        },

        # ---- Phase 5: Google Sheets Output ----
        {
            "name": "Write to Google Sheets",
            "command": [PYTHON, SCRIPTS["write_output"]],
            "skip": args.skip_sheets,
        },
    ]

    return steps


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(
        description="Run the full GREATIMMOB lead scraping pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Pipeline order:
  1. scrape_avito.py        → .tmp/avito_raw.json
  2. scrape_mubawab.py      → .tmp/mubawab_raw.json
  3. scrape_airbnb.py       → .tmp/airbnb_raw.json
  4. extract_contact.py     → .tmp/avito_enriched.json
  5. extract_contact.py     → .tmp/mubawab_enriched.json
  6. deduplicate_leads.py   → .tmp/leads_*_deduped.json
  7. validate_data.py       → .tmp/leads_*_validated.json
  8. write_output.py        → Google Sheets

Examples:
  py run_pipeline.py                    # Full pipeline
  py run_pipeline.py --skip-scrape      # Skip scraping (use existing .tmp/ data)
  py run_pipeline.py --skip-sheets      # Skip Google Sheets output
  py run_pipeline.py --dry-run          # Show steps without executing
  py run_pipeline.py --headless         # Run browsers headless
        """
    )
    parser.add_argument("--skip-scrape", action="store_true",
                        help="Skip scraping steps (use existing .tmp/ data)")
    parser.add_argument("--skip-sheets", action="store_true",
                        help="Skip Google Sheets output step")
    parser.add_argument("--headless", action="store_true",
                        help="Run browsers in headless mode")
    parser.add_argument("--dry-run", action="store_true",
                        help="Show pipeline steps without executing")

    args = parser.parse_args()

    # Ensure directories exist
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    LOG_DIR.mkdir(parents=True, exist_ok=True)

    # Build pipeline
    steps = build_pipeline(args)

    # Header
    log(f"\n{'═'*60}")
    log(f"GREATIMMOB — Lead Scraping Pipeline")
    log(f"Date: {date.today()}")
    log(f"{'═'*60}")

    if args.dry_run:
        log("MODE: DRY RUN (no scripts will be executed)")
    if args.skip_scrape:
        log("FLAG: --skip-scrape (using existing .tmp/ data)")
    if args.skip_sheets:
        log("FLAG: --skip-sheets (no Google Sheets output)")
    if args.headless:
        log("FLAG: --headless (browsers run headless)")

    # Run pipeline
    results = {}
    total_steps = len([s for s in steps if not s["skip"]])
    step_num = 0

    for step in steps:
        if step["skip"]:
            log(f"\n  SKIPPED: {step['name']}")
            results[step["name"]] = "skipped"
            continue

        step_num += 1
        log(f"\n[{step_num}/{total_steps}]")

        success = run_step(step["name"], step["command"], dry_run=args.dry_run)
        results[step["name"]] = "success" if success else "FAILED"

    # Summary
    log(f"\n{'═'*60}")
    log(f"PIPELINE SUMMARY")
    log(f"{'═'*60}")

    for name, status in results.items():
        icon = "✓" if status == "success" else ("⊘" if status == "skipped" else "✗")
        log(f"  {icon} {name}: {status}")

    failed = [n for n, s in results.items() if s == "FAILED"]
    if failed:
        log(f"\n  ⚠ {len(failed)} step(s) failed. See {ERROR_LOG} for details.")
    else:
        success_count = sum(1 for s in results.values() if s == "success")
        log(f"\n  All {success_count} executed steps completed successfully!")

    log(f"{'═'*60}\n")


if __name__ == "__main__":
    main()

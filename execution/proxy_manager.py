"""
proxy_manager.py — Session Management & Rate Limiting
======================================================
Layer 3 execution script.
Provides basic session management utilities for all scraping scripts:
  - User-Agent rotation pool
  - Randomized delay enforcement (5-15 seconds)
  - Session tracking (visits per session, daily counts)
  - Cloudflare block detection helpers

No paid proxies yet — designed to be extended with proxy rotation later.

Usage as a module:
    from proxy_manager import SessionManager

    session = SessionManager(platform="avito", max_visits=50)
    ua = session.get_user_agent()
    await session.delay()           # Random 5-15s delay
    session.record_visit()
    if session.is_over_limit():
        break

Standalone test:
    py execution/proxy_manager.py
"""

import json
import random
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')
import asyncio
import time
from datetime import datetime, date
from pathlib import Path


# ---------------------------------------------------------------------------
# User-Agent pool — real Chrome on Windows/Mac/Linux
# ---------------------------------------------------------------------------
USER_AGENTS = [
    # Chrome 120-122 on Windows 10/11
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    # Chrome on macOS
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    # Chrome on Linux
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    # Firefox on Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
    # Edge on Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
]


# ---------------------------------------------------------------------------
# Configuration defaults
# ---------------------------------------------------------------------------
DEFAULT_MIN_DELAY = 5       # seconds
DEFAULT_MAX_DELAY = 15      # seconds
DEFAULT_MAX_VISITS = 50     # per session
DEFAULT_BLOCK_WAIT = 90     # seconds to wait after a block

PROJECT_ROOT = Path(__file__).resolve().parent.parent
TMP_DIR = PROJECT_ROOT / ".tmp"


# ---------------------------------------------------------------------------
# SessionManager
# ---------------------------------------------------------------------------
class SessionManager:
    """
    Manages a single scraping session with rate limiting and UA rotation.

    Usage:
        session = SessionManager(platform="avito", max_visits=50)
        ua = session.get_user_agent()
        await session.delay()
        session.record_visit()
    """

    def __init__(
        self,
        platform: str = "generic",
        max_visits: int = DEFAULT_MAX_VISITS,
        min_delay: float = DEFAULT_MIN_DELAY,
        max_delay: float = DEFAULT_MAX_DELAY,
        block_wait: float = DEFAULT_BLOCK_WAIT,
    ):
        self.platform = platform
        self.max_visits = max_visits
        self.min_delay = min_delay
        self.max_delay = max_delay
        self.block_wait = block_wait

        self.visit_count = 0
        self.block_count = 0
        self.start_time = time.time()
        self._current_ua = random.choice(USER_AGENTS)
        self._daily_count_file = TMP_DIR / f"{platform}_daily_count.json"

    # ---- User-Agent ----
    def get_user_agent(self) -> str:
        """Get the current session's User-Agent string."""
        return self._current_ua

    def rotate_user_agent(self) -> str:
        """Pick a new random User-Agent for the next request."""
        self._current_ua = random.choice(USER_AGENTS)
        return self._current_ua

    # ---- Delays ----
    async def delay(self, custom_min: float = None, custom_max: float = None):
        """
        Wait a random duration between min_delay and max_delay.
        Use custom values for specific scenarios (e.g., longer waits for detail pages).
        """
        lo = custom_min or self.min_delay
        hi = custom_max or self.max_delay
        wait = random.uniform(lo, hi)
        await asyncio.sleep(wait)
        return wait

    def delay_sync(self, custom_min: float = None, custom_max: float = None) -> float:
        """Synchronous version of delay. Returns the wait duration."""
        lo = custom_min or self.min_delay
        hi = custom_max or self.max_delay
        wait = random.uniform(lo, hi)
        time.sleep(wait)
        return wait

    # ---- Visit tracking ----
    def record_visit(self):
        """Record a page visit."""
        self.visit_count += 1

    def is_over_limit(self) -> bool:
        """Check if the session has exceeded the max visit limit."""
        return self.visit_count >= self.max_visits

    def remaining_visits(self) -> int:
        """How many visits are left in this session."""
        return max(0, self.max_visits - self.visit_count)

    # ---- Block handling ----
    def record_block(self):
        """Record a block event."""
        self.block_count += 1

    async def wait_after_block(self) -> float:
        """Wait the block_wait duration after detecting a block."""
        self.record_block()
        await asyncio.sleep(self.block_wait)
        return self.block_wait

    # ---- Daily count persistence ----
    def get_daily_count(self) -> int:
        """Read today's scrape count from disk."""
        if not self._daily_count_file.exists():
            return 0
        try:
            data = json.loads(self._daily_count_file.read_text(encoding="utf-8"))
            if data.get("date") == str(date.today()):
                return data.get("count", 0)
        except (json.JSONDecodeError, KeyError):
            pass
        return 0

    def update_daily_count(self, count: int):
        """Write today's scrape count to disk."""
        TMP_DIR.mkdir(parents=True, exist_ok=True)
        data = {"date": str(date.today()), "count": count}
        self._daily_count_file.write_text(
            json.dumps(data, indent=2), encoding="utf-8"
        )

    def increment_daily_count(self, amount: int = 1):
        """Increment today's daily count by the given amount."""
        current = self.get_daily_count()
        self.update_daily_count(current + amount)

    # ---- Session stats ----
    def stats(self) -> dict:
        """Get session statistics."""
        elapsed = time.time() - self.start_time
        return {
            "platform": self.platform,
            "visits": self.visit_count,
            "max_visits": self.max_visits,
            "blocks": self.block_count,
            "elapsed_seconds": round(elapsed, 1),
            "user_agent": self._current_ua[:50] + "...",
            "daily_total": self.get_daily_count(),
        }

    def __repr__(self) -> str:
        return (
            f"SessionManager(platform={self.platform!r}, "
            f"visits={self.visit_count}/{self.max_visits}, "
            f"blocks={self.block_count})"
        )


# ---------------------------------------------------------------------------
# Cloudflare/block detection (shared utility)
# ---------------------------------------------------------------------------
BLOCK_SIGNALS = [
    "just a moment",
    "attention required",
    "cloudflare",
    "ray id",
    "checking your browser",
    "access denied",
    "captcha",
    "challenge-platform",
]


def is_blocked(page_title: str, page_content: str = "") -> bool:
    """
    Detect if a page is blocked by Cloudflare or anti-bot systems.

    Args:
        page_title: The page's <title> text
        page_content: First ~500 chars of page body text (optional)

    Returns:
        True if the page appears to be blocked
    """
    combined = f"{page_title} {page_content[:500]}".lower()
    return any(signal in combined for signal in BLOCK_SIGNALS)


# ---------------------------------------------------------------------------
# Standalone test
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("=" * 50)
    print("proxy_manager.py — Self-test")
    print("=" * 50)

    session = SessionManager(platform="test", max_visits=10)

    print(f"\n1. Session created: {session}")
    print(f"   User-Agent: {session.get_user_agent()[:60]}...")

    print(f"\n2. Rotating UA...")
    new_ua = session.rotate_user_agent()
    print(f"   New UA: {new_ua[:60]}...")

    print(f"\n3. Recording 3 visits...")
    for i in range(3):
        session.record_visit()
    print(f"   Visits: {session.visit_count}/{session.max_visits}")
    print(f"   Over limit: {session.is_over_limit()}")
    print(f"   Remaining: {session.remaining_visits()}")

    print(f"\n4. Block detection tests:")
    print(f"   'Just a moment...' → {is_blocked('Just a moment...')}")
    print(f"   'Airbnb | Search' → {is_blocked('Airbnb | Search')}")
    print(f"   'Attention Required!' → {is_blocked('Attention Required!')}")
    print(f"   'Appartement Agadir' → {is_blocked('Appartement Agadir')}")

    print(f"\n5. Session stats: {json.dumps(session.stats(), indent=2)}")

    print(f"\n6. UA pool size: {len(USER_AGENTS)} user agents")

    all_pass = (
        not session.is_over_limit()
        and session.remaining_visits() == 7
        and is_blocked("Just a moment...")
        and not is_blocked("Appartement Agadir")
    )
    print(f"\nAll tests passed: {all_pass}")

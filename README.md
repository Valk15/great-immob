# GREATIMMOB — Gestion locative courte durée

Business focus: **short-term rental management** (Agadir + coast Anza → Imi Ouaddar).  
Not a classic sales agency.

## Structure

| Path | Role |
|------|------|
| `website-com/` | Next.js site for **greatimmob.com** (owner landing) — GitHub `Valk15/great-immob` |
| `guest-checkin/` | Guest check-in: unique link, ID upload, signed stay contract + fiche de police PDF |
| `execution/` | Lead scrapers + pipeline scripts (Avito, Mubawab, Airbnb → Sheets) |
| `directives/` | SOPs for each pipeline step |
| `run_pipeline.py` | Run full lead pipeline |
| `agents.md` | Agent / ops rules for scraping |
| `.cursor/mcp.json` | Novamira MCP for **greatimmob.ma** (WordPress) — this project only |
| `credentials.json` / `token.json` | Google Sheets OAuth (do not commit publicly) |
| `.tmp/` | Scratch scrape data (safe to delete) |
| `logs/` | Run logs |

## Sites

- **greatimmob.ma** — WordPress (edit via Novamira MCP in this folder)
- **greatimmob.com** — edit files in `website-com/`, then `git push` (Vercel deploys from GitHub)

## Strategy & checklist

Full plan + task checklist (check boxes as you go):

→ **[STRATEGY_CHECKLIST.md](./STRATEGY_CHECKLIST.md)**

## Pipeline

```bash
py run_pipeline.py
```

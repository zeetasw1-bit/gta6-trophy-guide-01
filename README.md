# Leonida Legends — GTA 6 Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/zeetasw1-bit/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/zeetasw1-bit/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and checklist tracker for all **55 Grand Theft Auto VI trophies** on PlayStation 5 (1 platinum, 2 gold, 6 silver, 46 bronze — 28 hidden, no online trophies), built for the make.fun bounty [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **Every trophy, with its official name, description and grade** exactly as PlayStation publishes them, plus a guide in our own words: what to do, where and how, and when it can be missed. Every guide names its sources beside it.
- **A five-stage roadmap to the platinum** (~200–300 hours): story first, stranger missions, activities, collectibles & the world, then the 100% Completion cleanup.
- **The one possibly-missable trophy flagged** — Positive Mental Attitude (a Chapter 1 meditation may count; keep a manual save before leaving Chapter 1). Where a detail is not yet confirmed by the sources, the guide says so instead of guessing.
- **A tracker**: tick trophies off as you earn them; progress is saved in the browser (localStorage) and can be exported to a JSON file and imported back.
- **Filters and spoiler mode**: search, filter by grade and kind (story / missable / collectibles / activities / online), hide story trophy names and descriptions until earned, and show earned-only. Deep links work too: `?filter=<kind|grade>`, `?spoiler=on`, `?open=<trophy id>`, `?roadmap=1`.

## How to run it

The app is plain static files under `app/` — no build step, no network at run time. Serve it with any static server, for example:

```sh
node serve.ts
```

then open http://localhost:8080. Or open `app/index.html` through any static file server of your choice. Everything works with the network off: the app loads only its own files.

## Files

- `app/index.html` — the single-page guide and tracker
- `app/app.js` — renders the list, saves progress, filters, spoiler mode, export/import, deep links
- `app/style.css` — the original dark “Vice City neon” theme
- `app/data/trophies.json` — the 55 official trophies with guides, sources, kinds, missable flags and roadmap stages
- `main.ts` — hands the guide in: copies `app/` and `screenshots/` to `/output` and writes `dossier.json`
- `screenshots/` — four real renders of the app in a browser (see `shots.json`)
- `serve.ts` — a tiny static server for local use

## Sources

The guides are written in our own words from the official trophy list and these guides, cited beside each trophy: Push Square’s GTA 6 Trophy Guide and Roadmap, Sixshore’s GTA 6 Trophies and Achievements, PlanetGTA6’s GTA 6 Trophies, GTADb’s GTA 6 Trophies Platinum Guide, and GTA Vice City Hub’s Achievements. No Rockstar logo, artwork or game images are used anywhere.

## Disclaimer

An unofficial, fan-made guide. Grand Theft Auto and Rockstar Games are trademarks of their owners.

---

Built for make.fun — [make.fun/?ref=69vgdk1m](https://make.fun/?ref=69vgdk1m) (referral code `69vgdk1m`).

# Mapsterdam

A GeoGuessr-inspired game set in Amsterdam. Explore street views, get AI-powered clues, and guess your location on the map.

## What it does

- Drop into a random street view somewhere in Amsterdam
- Get contextual AI clues to help narrow down your location
- Place your guess on an interactive map and see how close you were
- Drawing/sketching tools powered by p5.js

## Tech stack

- **Frontend:** React + TypeScript + Vite
- **UI:** shadcn/ui + Radix UI + Tailwind CSS
- **Maps:** Google Maps API
- **Canvas:** p5.js

## Setup

```bash
npm install
cp .env.example .env   # then fill in VITE_GOOGLE_MAPS_API_KEY
npm run dev
```

### Configuration

All config is via `VITE_*` env vars, which Vite embeds at **build time** — after
changing any of them you must rebuild, not just reload. On Lovable, set these
under **Cloud → Secrets**.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_GOOGLE_MAPS_API_KEY` | **Yes** | Street View, the guess map, and geocoding. The app cannot start without it. |
| `VITE_SUPABASE_URL` | No | Backend for AI-generated clues. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | No | Backend for AI-generated clues. |

Without the Supabase vars the game runs normally and serves static clues
instead of AI-generated ones.

### Securing the Google Maps key

A Maps JavaScript API key is necessarily public — the browser sends it to
Google on every request, so it cannot be hidden by a backend. Restrict it
instead, in the Google Cloud console:

- **Application restrictions:** HTTP referrers → your deployed origin(s)
- **API restrictions:** Maps JavaScript API, Places API, Geocoding API
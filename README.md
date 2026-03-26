# CPT Clarity (Decode)

Decode medical procedure codes in plain language using CMS PFS data and an optional LLM summary layer.

## What it does
- Look up CPT codes against the CMS 2025 Physician Fee Schedule RVU file.
- Show plain-language summaries and patient-friendly follow-up questions.
- Expose technical RVU breakdowns with a toggle.
- Cache generated summaries in `data/cpt-summaries.json`.

## Tech stack
- Next.js 14 (App Router)
- React 18
- Node.js (API routes + data ingestion)

## Getting started

### 1) Install dependencies
```sh
npm install
```

### 2) Run the app
```sh
npm run dev
```

Open `http://localhost:3000`.

## Configuration
Set `OPENAI_API_KEY` to enable LLM-powered summaries. If omitted, the app falls back to a CMS-only summary template.

Example:
```sh
export OPENAI_API_KEY="your-key"
```

## Data ingestion
The app reads CMS PFS data from `data/pfs-2025.json`. To regenerate it:
```sh
npm run ingest:pfs
```
This downloads the CMS 2025 RVU zip and rebuilds the JSON file.

## Scripts
- `npm run dev` - start the local dev server
- `npm run build` - production build
- `npm run start` - run the production server
- `npm run lint` - lint the codebase
- `npm run ingest:pfs` - download and parse CMS PFS data

## API routes
- `GET /api/cpt?code=28238` - CMS record lookup
- `POST /api/agent/summary` - returns a summary + questions for a code

## Data source
CMS 2025 Physician Fee Schedule RVU file (October release).

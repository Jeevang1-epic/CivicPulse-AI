# CivicPulse AI

**Track:** Community Hero - Hyperlocal Problem Solver  
**Positioning:** A hyperlocal civic issue-response platform that turns scattered citizen reports into prioritized, trackable community action.

CivicPulse AI is being built as a production-looking Next.js application deployable on Google Cloud Run. Citizens will report local problems, server-side AI triage will convert reports into structured category/severity/action data, and public/admin views will help communities track issues transparently.

## Current build status

This repository now contains the controlled bootstrap of the app in the same root folder as the hackathon context pack. It includes:

- Next.js App Router with TypeScript
- Tailwind CSS styling
- Mobile-first landing, report submission, board, dashboard, and report detail routes
- Shared civic report types
- App-facing demo data for streetlight, garbage, water leakage, road damage, and electrical safety reports
- Seed data loader that preserves the original `data/sample_reports.json` context file
- Process-local demo repository with report creation, detail loading, board updates, and support/upvote
- Server-only Gemini AI triage with structured JSON validation
- Deterministic fallback triage that structures category, severity, safety level, action guidance, and review flags
- Dashboard workflow controls for open, in review, assigned, and resolved reports
- Server-side community brief API with Gemini support and deterministic fallback
- Cloud Run-friendly `npm start` script that reads `PORT`

Firestore is intentionally not implemented yet. Gemini is optional and server-side only; when `GEMINI_API_KEY` is missing or Gemini fails, report submission automatically uses the deterministic local fallback.
The dashboard community brief follows the same pattern and falls back safely without cloud configuration.

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Run without Gemini by leaving `.env.local` absent or `GEMINI_API_KEY` blank. New reports should show `Fallback missing key` in the triage engine label. To test live Gemini mode locally, create `.env.local` with:

```bash
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=
```

`GEMINI_MODEL` is optional; when blank, the server uses a fast default Gemini model. Never prefix Gemini secrets with `NEXT_PUBLIC_`.
`.env.local` is ignored by git and must not be committed.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

Every implementation step should finish by running these commands when the scripts exist.

## Routes

- `/` - landing page and product explanation
- `/report` - citizen report submission flow backed by the local demo repository
- `/board` - public issue board using seed data plus submissions from the current server process
- `/dashboard` - demo operations dashboard with live metrics, filters, status updates, priority queue, and community brief
- `/reports/demo-1` - streetlight report details
- `/reports/demo-5` - critical safety report details
- `/reports/not-real` - polished missing-report fallback

## Demo flow

1. Open `/` and use the calls to action to reach the reporting flow, public board, and dashboard.
2. Submit an issue on `/report`; the server triages it with Gemini when configured or deterministic fallback when not.
3. Confirm the new report appears on `/board`, open its detail page, and use support/upvote to show community signal.
4. Open `/dashboard` to review KPIs, priority queue, status workflow controls, and the community brief.

## Current limitations

- Local demo storage is process-memory only until Firestore is configured.
- Dashboard access is a demo admin role surface, not production authentication.
- CivicPulse AI does not submit reports to real authorities or official systems.

## Safety and integrity

- This demo does not send reports to real authorities.
- CivicPulse AI is not an emergency service. For immediate danger, contact local emergency services or responsible authorities directly.
- No Gemini API keys or other secrets should be exposed in frontend code.
- No fake government or official integration claims should be made.

## Context pack folders

The original hackathon context remains in place:

```txt
docs/         strategy, PRD, architecture, AI design, validation
codex/        build prompts and acceptance notes
deployment/   env template, Cloud Run commands, Firestore rules draft
data/         sample reports and categories
judges/       pitch, demo script, differentiators
```

## Google Cloud Run

The app is intended to be deployed from this root folder. Later phases should complete environment configuration and deployment documentation before final submission.

```bash
gcloud run deploy civicpulse-ai --source . --region asia-south1 --allow-unauthenticated
```

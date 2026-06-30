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
- Deterministic fallback triage that structures category, severity, safety level, action guidance, and review flags
- Cloud Run-friendly `npm start` script that reads `PORT`

Gemini and Firestore are intentionally not implemented yet in this bootstrap. Later work must keep Gemini server-side only and use local fallback when Firestore is not configured.

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

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
- `/dashboard` - admin dashboard using live local report metrics
- `/reports/demo-1` - streetlight report details
- `/reports/demo-5` - critical safety report details
- `/reports/not-real` - polished missing-report fallback

## Safety and integrity

- This demo does not send reports to real authorities.
- CivicPulse AI is not an emergency service.
- For immediate danger, users should contact local emergency services.
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

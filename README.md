# CivicPulse AI

Live demo: https://civicpulse-ai-two.vercel.app

Track: Community Hero - Hyperlocal Problem Solver

CivicPulse AI turns scattered neighborhood issue reports into a structured civic action queue with AI-assisted triage, public transparency, and a demo operations dashboard.

## Project Overview

CivicPulse AI is a mobile-first civic reporting platform for hyperlocal problems such as broken streetlights, garbage piles, water leakage, potholes, and public safety hazards. Citizens can submit a report in plain language, the server triages it into structured severity/category/action data, and the public board plus dashboard help reviewers track what needs attention.

The app is intentionally honest about its scope. It is a community coordination demo, not an official government system, not an emergency service, and not a replacement for responsible local reporting.

## Problem Statement

Local civic issues are often reported through scattered chats, calls, or informal messages. This makes it hard to identify duplicates, prioritize urgent problems, communicate status, and give residents a transparent view of what is being tracked.

## Key Features

- Citizen report submission with category and urgency hints.
- Server-side Gemini triage when `GEMINI_API_KEY` is configured.
- Deterministic local fallback triage when Gemini is unavailable.
- Public issue board with filtering, sorting, and support/upvote.
- Report detail pages with severity, status, location, recommended action, safety flags, and timeline.
- Demo dashboard with KPI cards, priority queue, status workflow controls, and community brief.
- Safe urgent-danger disclaimer for critical reports.
- Process-local demo repository so the project works without cloud database setup.

## AI Triage Workflow

1. The citizen submits issue details and approximate location.
2. Server-side code validates and normalizes the input.
3. If `GEMINI_API_KEY` is available, Gemini returns structured JSON for title, summary, category, severity, safety level, duplicate key, recommended action, and review flags.
4. If Gemini is missing, slow, invalid, or fails, the deterministic fallback service produces the same structured shape.
5. Critical danger signals require human review and show the safety disclaimer:

```txt
CivicPulse AI is not an emergency service. For immediate danger, contact local emergency services or responsible authorities directly.
```

## Dashboard Workflow

- Review total, open, in-review, assigned, resolved, urgent, and critical report counts.
- Filter reports by status, category, severity, and search text.
- Prioritize reports by severity and recency.
- Update demo workflow status from open to in review, assigned, or resolved.
- Inspect recommended action, responsible team, duplicate key, triage mode, review flags, and recent timeline events.
- Generate a community brief through server-side Gemini or deterministic fallback.

## Tech Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Gemini API through server-side code only
- Local process-memory repository fallback
- Vercel deployment

## Architecture Overview

```txt
Citizen browser
  -> Next.js pages and client components
  -> API routes for reports, support, status, dashboard summary, and community brief
  -> Triage service
       -> Gemini server-side path when configured
       -> deterministic fallback path always available
  -> Reports repository interface
       -> local in-memory demo repository today
       -> Firestore-ready boundary for a future phase
```

Secrets stay on the server. No Gemini key is exposed through frontend code or `NEXT_PUBLIC_*` variables.

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful scripts:

```bash
npm run lint
npm run typecheck
npm run build
npm start
```

## Environment Variables

Create `.env.local` for local secrets. It is ignored by git.

```bash
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=
```

`GEMINI_MODEL` is optional. If `GEMINI_API_KEY` is omitted, report triage and the dashboard brief use deterministic fallback behavior.

## Vercel Deployment Notes

The production app is deployed at:

https://civicpulse-ai-two.vercel.app

Deploy from the project root:

```bash
vercel --prod
```

Set `GEMINI_API_KEY` in Vercel Project Settings if live Gemini triage is desired. The app remains usable without it because fallback triage is built in.

## Demo Flow

1. Open the live demo.
2. Submit a report from `/report`.
3. Confirm it appears on `/board`.
4. Open the generated report detail page.
5. Use support/upvote on the board.
6. Open `/dashboard` and review KPIs, priority queue, status controls, and the community brief.
7. Open `/reports/not-real` to confirm the polished not-found state.

## Safety Disclaimer

CivicPulse AI is not an emergency service. For immediate danger, contact local emergency services or responsible authorities directly.

The app does not claim that reports are sent to government, police, municipal, utility, or emergency systems.

## Known Limitations

- Data is stored in a process-local demo repository and can reset between server restarts or serverless instances.
- Firestore is not implemented yet.
- Authentication is intentionally not implemented; the dashboard is a demo admin surface.
- Status updates are demo workflow events, not official action.
- Gemini is optional and only runs when a server-side key is configured.

## Future Roadmap

- Firestore-backed repository for durable storage.
- Role-based access for admin workflows.
- Duplicate clustering and neighborhood-level analytics.
- Comment and attachment support with moderation.
- Status notifications for residents.
- Production observability, rate limiting, and abuse protection.

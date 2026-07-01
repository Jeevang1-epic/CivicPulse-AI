# CivicPulse AI Case Study

## Problem

Hyperlocal civic issues are often reported through fragmented channels: apartment WhatsApp groups, informal calls, social posts, or repeated messages to volunteers. Residents can see the problem, but the community lacks a shared operating view for severity, duplicates, ownership, and status.

CivicPulse AI focuses on the Community Hero - Hyperlocal Problem Solver track: helping neighborhoods convert scattered issue reports into prioritized, visible, and safer civic action.

## Solution

CivicPulse AI is a civic issue reporting platform where residents submit local problems in plain language. The server triages each report into structured data, the public board keeps issues visible, and the dashboard gives reviewers a practical workflow for prioritization and follow-up.

The product is intentionally scoped as community coordination software. It does not claim official government integration, emergency dispatch, or automated real-world resolution.

## Product Flow

1. A resident submits an issue from `/report` with a description and approximate location.
2. The app validates the report and runs server-side triage.
3. The report appears on `/board`, where residents can inspect and support it.
4. A detail page shows summary, category, severity, safety level, status, recommended action, and timeline.
5. The dashboard helps reviewers filter reports, update demo workflow status, inspect triage output, and read a community brief.

## AI Workflow

The triage system uses a server-only AI boundary:

- Gemini is used only when `GEMINI_API_KEY` is configured on the server.
- The model must return structured JSON matching the app's triage schema.
- Output is validated before it is accepted.
- If Gemini is missing, slow, invalid, or unavailable, deterministic fallback triage produces the same structured fields.
- Critical safety reports require human review and show the fixed safety disclaimer.

This makes the demo resilient for reviewers because it works even without cloud secrets.

## Architecture

```txt
Next.js App Router
  -> citizen pages: landing, report, board, report detail
  -> dashboard page: metrics, filters, queue, action panel
  -> API routes:
       /api/reports
       /api/reports/[id]
       /api/reports/[id]/support
       /api/reports/[id]/status
       /api/dashboard/summary
       /api/dashboard/community-brief
  -> services:
       Gemini triage service
       deterministic triage fallback
       community brief service
  -> repository interface:
       local process-memory implementation today
       Firestore-ready boundary for future persistence
```

## What Makes It Different

- It treats civic reports as operational records, not just form submissions.
- It keeps the public board and admin dashboard connected through the same report model.
- It combines AI triage with strict fallback behavior so the demo remains reliable.
- It handles urgent-danger wording safely without pretending to be an emergency system.
- It uses realistic Indian hyperlocal issue examples rather than generic sample data.

## Current Limitations

- Data is not durable yet; the current repository is process-local demo storage.
- Dashboard access is not authenticated.
- No real government, municipal, utility, or emergency integration exists.
- Report status changes are demo workflow signals only.
- Attachments, comments, notifications, and moderation are not implemented yet.

## Future Improvements

- Firestore-backed repository with durable reports and activity timelines.
- Admin role access with simple reviewer permissions.
- Duplicate clustering across location and issue type.
- Resident notifications for status updates.
- Abuse prevention, rate limits, and moderation queues.
- Optional media upload with privacy-safe handling.
- Analytics for recurring issue hotspots.

## Portfolio Positioning

CivicPulse AI demonstrates a production-minded civic-tech build: clear product scope, server-side AI integration, graceful fallback behavior, safe language around urgent issues, and a deployable Next.js interface. It is a strong portfolio project because it shows product judgment as much as implementation skill.

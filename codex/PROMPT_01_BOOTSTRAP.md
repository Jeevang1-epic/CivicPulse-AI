# Prompt 01 — Bootstrap Project

Paste this into Codex first.

```txt
We are building CivicPulse AI from the attached context pack.

Create the initial Next.js + TypeScript project structure for a Cloud Run deployable app.

Requirements:
1. Use App Router if starting fresh.
2. Add Tailwind CSS and a clean component structure.
3. Create pages:
   - /
   - /report
   - /board
   - /dashboard
   - /reports/[id]
4. Add shared types for CivicReport, TriageResult, ActivityEvent.
5. Add sample data loader from `data/sample_reports.json` or equivalent local seed.
6. Add clean UI components:
   - StatCard
   - ReportCard
   - StatusBadge
   - SeverityBadge
   - EmptyState
   - PageShell
7. Add README with local setup.
8. Add scripts:
   - dev
   - build
   - lint
   - typecheck
9. Do not add Gemini or Firestore yet except placeholder service interfaces.

Acceptance:
- npm install works.
- npm run build works.
- All pages render with seed data.
- UI looks professional, not generic.
- No secrets.
```

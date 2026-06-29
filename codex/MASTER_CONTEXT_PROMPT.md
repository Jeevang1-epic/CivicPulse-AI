# Codex Master Context Prompt

You are building a hackathon project called **CivicPulse AI**.

## Track

Community Hero - Hyperlocal Problem Solver.

## Build goal

Create a production-looking, functional, Google Cloud deployable web app that lets citizens report hyperlocal community issues. The app uses Gemini to triage reports into structured civic operations data and shows live public/admin dashboards.

## Non-negotiable constraints

- Use TypeScript.
- Use Next.js.
- Use a clean, modern UI.
- Deployable on Google Cloud Run.
- Use Firestore for persistence if environment variables are configured.
- Use Gemini through a server-side API route only.
- No API keys in frontend.
- No fake official/government integration claims.
- Include fallback mode if Gemini or Firestore is not configured.
- Build mobile-first.
- Keep code modular and readable.
- Add README setup and deployment instructions.
- Add at least basic validation/test scripts.
- Do not over-engineer auth. Demo role switch is acceptable.
- Do not use emergency/medical advice. For immediate danger, show disclaimer.

## Product summary

CivicPulse AI turns messy local complaints into prioritized, trackable community action using:
- report form,
- Gemini structured triage,
- Firestore issue board,
- admin/volunteer dashboard,
- status tracking,
- neighborhood AI brief.

## Core pages

- `/` landing page
- `/report` citizen report form
- `/board` public issue board
- `/dashboard` admin/volunteer dashboard
- `/reports/[id]` report details

## Data model

Use the `CivicReport` model from `docs/06_DATA_MODEL.md`.

## AI triage

Return structured JSON:

```ts
{
  title: string;
  cleanedSummary: string;
  category: "Road" | "Streetlight" | "Garbage" | "Water" | "Safety" | "Animal" | "Public Transport" | "Lost and Found" | "Noise" | "Other";
  severity: 1 | 2 | 3 | 4 | 5;
  safetyLevel: "low" | "medium" | "urgent" | "critical";
  duplicateKey: string;
  responsibleTeam: string;
  recommendedAction: string;
  citizenReply: string;
  needsHumanReview: boolean;
  insufficientInfo: boolean;
  safetyDisclaimerRequired: boolean;
}
```

## MVP acceptance

The app is done when:
- reports can be created,
- AI triage works or fallback works,
- reports display on board,
- dashboard displays priority and status,
- status can be updated,
- build passes,
- Cloud Run deployment instructions are present.

## Build approach

Do this in controlled phases. Do not rewrite everything blindly. After every phase, run lint/typecheck/build if available and summarize changed files.

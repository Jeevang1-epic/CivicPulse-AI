# Prompt 02 — Core Report Flow

```txt
Continue CivicPulse AI.

Implement the core report flow.

Requirements:
1. Build `/report` form with:
   - description textarea
   - location text input
   - optional category select
   - optional urgency select
   - submit button
   - loading and error states
2. Add `/api/reports` route:
   - validate input
   - call triage service interface
   - create CivicReport object
   - save through repository interface
   - return created report
3. Add a repository layer:
   - local in-memory/demo repository fallback
   - Firestore repository stub or implementation if env vars exist
4. Update `/board` to show newly created reports if using local state/server data.
5. Add support/upvote action.
6. Add report detail page.

Important:
- Keep code modular.
- Do not expose secrets.
- If Firestore is not ready, app must still demo with local seeded data.

Acceptance:
- User can submit a report.
- A generated issue card appears.
- Board and details work.
- Build passes.
```

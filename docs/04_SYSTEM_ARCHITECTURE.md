# 04 — System Architecture

## Recommended stack

- **Frontend:** Next.js + TypeScript + Tailwind CSS.
- **Backend:** Next.js API routes or route handlers.
- **AI:** Gemini API through server route.
- **Database:** Firestore.
- **Deployment:** Google Cloud Run.
- **Storage:** Cloud Storage/Firebase Storage optional for photos.
- **Auth:** Demo mode first; Firebase Auth optional.
- **Maps:** Simple location text + "Open in Google Maps" link first; optional Maps embed or Places API later.

## Architecture diagram

```txt
Citizen Browser
  |
  | submit report
  v
Next.js App on Cloud Run
  |
  | /api/triage-report
  v
Gemini Triage Service
  |
  | structured JSON
  v
Firestore
  |
  +--> Public Board
  +--> Admin Dashboard
  +--> Analytics Summary
```

## Why Cloud Run

Cloud Run is ideal for this because:
- it deploys one full-stack web service,
- it supports container/source-based deployment,
- it scales without managing servers,
- it satisfies the hackathon Google Cloud deployment rule.

## Firestore collections

```txt
reports/
  {reportId}
    title
    description
    summary
    category
    severity
    safetyLevel
    locationText
    lat
    lng
    status
    duplicateKey
    supportCount
    createdAt
    updatedAt
    triage
    activity[]

neighborhoodBriefs/
  {dateOrArea}
    summary
    topRisks[]
    generatedAt

auditLogs/
  {logId}
    reportId
    action
    actorRole
    createdAt
```

## API routes

### POST `/api/reports`
Creates a report:
1. Validate input.
2. Call AI triage.
3. Normalize response.
4. Store in Firestore.
5. Return issue object.

### POST `/api/triage-report`
Takes raw report input and returns structured triage. Can be merged into `/api/reports`.

### PATCH `/api/reports/:id/status`
Updates status.

### GET `/api/brief`
Generates a neighborhood brief from current report list.

## Fallback strategy

If Gemini API fails:
- classify with keyword rules,
- set `needsHumanReview: true`,
- still allow report creation,
- show UI warning: "AI triage fallback used."

This prevents the demo from breaking during judging.

## Security architecture

- Never expose Gemini API key to browser.
- Server-side AI route only.
- Minimal PII.
- Sanitize report input.
- Rate-limit concept in README.
- Do not claim official municipal integration.
- Use demo role switcher, not fake production auth claims.

## Deployment architecture

```txt
GitHub Repo
  |
  | gcloud run deploy --source .
  v
Cloud Build
  |
  v
Cloud Run Service
  |
  +--> Firestore
  +--> Secret Manager for GEMINI_API_KEY
```

## MVP implementation order

1. Static UI pages with sample data.
2. Firestore integration.
3. Report creation API.
4. Gemini triage.
5. Dashboard status updates.
6. Polish, demo seed, validation.
7. Google Cloud Run deploy.

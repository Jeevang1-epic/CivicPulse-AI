# Vercel Deployment

Live URL: https://civicpulse-ai-two.vercel.app

## Deploy Command

Run from the project root:

```bash
vercel --prod
```

If the project is not linked yet:

```bash
vercel link
vercel --prod
```

## Environment Variables

Set these in Vercel Project Settings under Environment Variables:

```bash
GEMINI_API_KEY=your_server_side_key
GEMINI_MODEL=

FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIRESTORE_REPORTS_COLLECTION=reports
```

Notes:

- `GEMINI_API_KEY` is optional. If it is missing, CivicPulse AI uses deterministic fallback triage.
- `GEMINI_MODEL` is optional and can be left blank.
- Firestore variables are optional. If any required Firestore value is missing or invalid, the app falls back to the local demo repository.
- `FIREBASE_PRIVATE_KEY` can be stored with escaped newlines (`\n`) in Vercel.
- Do not create `NEXT_PUBLIC_GEMINI_API_KEY`.
- Do not create `NEXT_PUBLIC_FIREBASE_*` variables for server writes. The app uses Firebase Admin SDK only on the server.
- Do not commit `.env.local`.

CLI setup option:

```bash
vercel env add GEMINI_API_KEY production
vercel env add FIREBASE_PROJECT_ID production
vercel env add FIREBASE_CLIENT_EMAIL production
vercel env add FIREBASE_PRIVATE_KEY production
vercel env add FIRESTORE_REPORTS_COLLECTION production
```

## Redeploy

Use one of these paths:

```bash
git push origin main
```

or:

```bash
vercel --prod
```

If environment variables changed, trigger a fresh production deployment from the Vercel dashboard or run `vercel --prod` again.

## Post-Deploy Smoke Test

After deployment, verify:

- `/` loads the landing page.
- `/report` loads and accepts a demo report.
- `/board` shows seed reports and the new report. With Firestore configured, the report persists across runtime restarts; without it, the local fallback persists only inside the current process.
- `/dashboard` shows KPI cards, priority queue, filters, status controls, and community brief.
- `/reports/demo-1` opens a seeded report detail page.
- `/reports/not-real` shows the polished not-found state.
- `/api/dashboard/summary` returns JSON.
- `/api/dashboard/community-brief` returns JSON with either Gemini or fallback mode.

## Persistence Behavior

CivicPulse AI now selects storage at runtime:

- Firestore Admin SDK when `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` are valid.
- Local process-memory fallback when Firestore is not configured or cannot initialize.

When Firestore is enabled and the `reports` collection is empty, the app seeds the demo reports once using stable demo IDs.

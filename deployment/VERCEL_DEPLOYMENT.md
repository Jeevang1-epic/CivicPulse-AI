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
```

Notes:

- `GEMINI_API_KEY` is optional. If it is missing, CivicPulse AI uses deterministic fallback triage.
- `GEMINI_MODEL` is optional and can be left blank.
- Do not create `NEXT_PUBLIC_GEMINI_API_KEY`.
- Do not commit `.env.local`.

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
- `/board` shows seed reports and the new report from the current runtime session.
- `/dashboard` shows KPI cards, priority queue, filters, status controls, and community brief.
- `/reports/demo-1` opens a seeded report detail page.
- `/reports/not-real` shows the polished not-found state.
- `/api/dashboard/summary` returns JSON.
- `/api/dashboard/community-brief` returns JSON with either Gemini or fallback mode.

## Current Deployment Caveat

The current repository implementation uses process-local demo storage. This is fine for portfolio review and fallback demos, but data is not durable across server restarts or different serverless instances. Firestore is planned for a future phase.

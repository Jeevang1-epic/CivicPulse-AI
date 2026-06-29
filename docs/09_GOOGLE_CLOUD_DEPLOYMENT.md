# 09 — Google Cloud Deployment Plan

## Goal

Deploy the final functional link on **Google Cloud Run**.

## Minimum Google Cloud services

- Cloud Run
- Cloud Build
- Firestore
- Secret Manager
- Artifact Registry may be enabled automatically by source deploy

## Suggested region

For India demo:
- `asia-south1` (Mumbai)

If unavailable or failing, use:
- `asia-south2` or `us-central1`

## Deployment flow

1. Create Google Cloud project.
2. Enable billing if required by Google Cloud.
3. Enable required APIs.
4. Create Firestore database.
5. Add Gemini API key to Secret Manager.
6. Deploy Next.js app to Cloud Run.
7. Test public URL.
8. Submit Cloud Run URL on BlockseBlock.

## Important

The screenshot says the final deployable link should be mandatorily deployed on Google Cloud. Do not submit Vercel as the final link unless the platform allows a secondary link. Use Cloud Run final URL.

## Commands

See `deployment/GOOGLE_CLOUD_DEPLOYMENT.md` for exact terminal commands.

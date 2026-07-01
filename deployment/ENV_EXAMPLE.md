# Environment Example

Create `.env.local` locally. Do not commit it.

```bash
# Gemini, server-side only. Optional.
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=

# Firestore Admin SDK, server-side only. Optional.
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nreplace_with_key_body\n-----END PRIVATE KEY-----\n"
FIRESTORE_REPORTS_COLLECTION=reports
```

## Notes

- `GEMINI_API_KEY`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` must stay server-side.
- Do not create `NEXT_PUBLIC_GEMINI_API_KEY` or `NEXT_PUBLIC_FIREBASE_*` variables for this app.
- `FIREBASE_PRIVATE_KEY` may use escaped newlines (`\n`); the server normalizes them before initializing Firebase Admin.
- If the Firestore variables are missing or invalid, CivicPulse AI automatically uses the local demo repository.
- For Cloud Run or Vercel, store secrets in the platform environment manager instead of committing `.env.local`.

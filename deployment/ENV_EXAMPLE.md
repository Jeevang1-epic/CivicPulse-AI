# Environment Example

Create `.env.local` locally. Do not commit it.

```bash
# Gemini
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase public client config
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_public_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional
NEXT_PUBLIC_DEMO_MODE=true
ADMIN_DEMO_PIN=1234
```

## Notes

- `NEXT_PUBLIC_*` variables are visible in the browser. Only put Firebase public config there.
- `GEMINI_API_KEY` must stay server-side.
- For Cloud Run, use Secret Manager for `GEMINI_API_KEY`.

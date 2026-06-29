# Google Cloud Deployment Commands

Replace placeholders before running.

## 1. Set variables

```bash
$PROJECT_ID="your-gcp-project-id"
$REGION="asia-south1"
$SERVICE="civicpulse-ai"
gcloud config set project $PROJECT_ID
```

For Bash/macOS/Linux:

```bash
export PROJECT_ID="your-gcp-project-id"
export REGION="asia-south1"
export SERVICE="civicpulse-ai"
gcloud config set project "$PROJECT_ID"
```

## 2. Login

```bash
gcloud auth login
gcloud auth application-default login
```

## 3. Enable services

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com firestore.googleapis.com secretmanager.googleapis.com artifactregistry.googleapis.com
```

## 4. Create Firestore

Use Google Cloud Console if CLI is not available:

- Firestore
- Create database
- Native mode
- Region close to app, for example asia-south1 if available

## 5. Store Gemini key in Secret Manager

PowerShell:

```bash
$GEMINI_API_KEY="paste_key_here"
echo $GEMINI_API_KEY | gcloud secrets create GEMINI_API_KEY --data-file=-
```

Bash:

```bash
echo -n "paste_key_here" | gcloud secrets create GEMINI_API_KEY --data-file=-
```

If secret already exists:

```bash
echo -n "new_key_here" | gcloud secrets versions add GEMINI_API_KEY --data-file=-
```

## 6. Deploy to Cloud Run from source

PowerShell:

```bash
gcloud run deploy $SERVICE `
  --source . `
  --region $REGION `
  --allow-unauthenticated `
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest `
  --set-env-vars NEXT_PUBLIC_FIREBASE_API_KEY="your_value",NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_value",NEXT_PUBLIC_FIREBASE_PROJECT_ID="$PROJECT_ID",NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_value",NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_value",NEXT_PUBLIC_FIREBASE_APP_ID="your_value",NEXT_PUBLIC_DEMO_MODE="true"
```

Bash:

```bash
gcloud run deploy "$SERVICE" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --set-env-vars NEXT_PUBLIC_FIREBASE_API_KEY="your_value",NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_value",NEXT_PUBLIC_FIREBASE_PROJECT_ID="$PROJECT_ID",NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_value",NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_value",NEXT_PUBLIC_FIREBASE_APP_ID="your_value",NEXT_PUBLIC_DEMO_MODE="true"
```

## 7. Test

```bash
gcloud run services describe $SERVICE --region $REGION --format "value(status.url)"
```

Open the returned URL in incognito.

## 8. Common deployment problems

### Build fails because package scripts are missing
Ensure `package.json` has:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p ${PORT:-3000}",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

### Cloud Run starts but app fails
Check logs:

```bash
gcloud run services logs read $SERVICE --region $REGION --limit 100
```

### Gemini key missing
Confirm secret mounted:

```bash
gcloud run services describe $SERVICE --region $REGION
```

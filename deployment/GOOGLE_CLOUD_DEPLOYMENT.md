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

## 5. Store server-side secrets in Secret Manager

PowerShell:

```bash
$GEMINI_API_KEY="paste_key_here"
echo $GEMINI_API_KEY | gcloud secrets create GEMINI_API_KEY --data-file=-

$FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
echo $FIREBASE_CLIENT_EMAIL | gcloud secrets create FIREBASE_CLIENT_EMAIL --data-file=-

$FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nreplace_with_key_body\n-----END PRIVATE KEY-----\n"
echo $FIREBASE_PRIVATE_KEY | gcloud secrets create FIREBASE_PRIVATE_KEY --data-file=-
```

Bash:

```bash
echo -n "paste_key_here" | gcloud secrets create GEMINI_API_KEY --data-file=-
echo -n "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com" | gcloud secrets create FIREBASE_CLIENT_EMAIL --data-file=-
printf "%s" "-----BEGIN PRIVATE KEY-----\nreplace_with_key_body\n-----END PRIVATE KEY-----\n" | gcloud secrets create FIREBASE_PRIVATE_KEY --data-file=-
```

If secret already exists:

```bash
echo -n "new_key_here" | gcloud secrets versions add GEMINI_API_KEY --data-file=-
```

`GEMINI_API_KEY` is optional. Firestore persistence requires the Firebase Admin service account values above plus `FIREBASE_PROJECT_ID`.

## 6. Deploy to Cloud Run from source

PowerShell:

```bash
gcloud run deploy $SERVICE `
  --source . `
  --region $REGION `
  --allow-unauthenticated `
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest,FIREBASE_CLIENT_EMAIL=FIREBASE_CLIENT_EMAIL:latest,FIREBASE_PRIVATE_KEY=FIREBASE_PRIVATE_KEY:latest `
  --set-env-vars FIREBASE_PROJECT_ID="$PROJECT_ID",FIRESTORE_REPORTS_COLLECTION="reports"
```

Bash:

```bash
gcloud run deploy "$SERVICE" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest,FIREBASE_CLIENT_EMAIL=FIREBASE_CLIENT_EMAIL:latest,FIREBASE_PRIVATE_KEY=FIREBASE_PRIVATE_KEY:latest \
  --set-env-vars FIREBASE_PROJECT_ID="$PROJECT_ID",FIRESTORE_REPORTS_COLLECTION="reports"
```

Do not pass Firebase Admin values as `NEXT_PUBLIC_*` variables. The app writes to Firestore only from server-side code.

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
    "start": "node server.mjs",
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

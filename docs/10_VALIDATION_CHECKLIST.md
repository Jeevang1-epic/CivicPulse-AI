# 10 — Validation Checklist

## Functional validation

- [ ] Landing page loads.
- [ ] Report form submits.
- [ ] AI triage returns structured data.
- [ ] Fallback triage works when Gemini key is missing.
- [ ] Report appears on public board.
- [ ] Report appears on admin dashboard.
- [ ] Status can be updated.
- [ ] Support/upvote works.
- [ ] Demo seed data exists.
- [ ] Mobile layout works.
- [ ] Cloud Run URL works publicly.

## AI validation

Test these report inputs:

### Streetlight
```txt
Streetlight near college back gate is not working for 4 days and road is dark at night.
```
Expected:
- category: Streetlight
- severity: 4
- safetyLevel: urgent

### Garbage
```txt
Garbage pile near apartment entrance has not been cleared this week.
```
Expected:
- category: Garbage
- severity: 2 or 3

### Water leak
```txt
Water leakage on main road is making the road slippery for bikes.
```
Expected:
- category: Water
- severity: 4
- safetyLevel: urgent

### Insufficient info
```txt
Something is wrong here.
```
Expected:
- insufficientInfo: true
- needsHumanReview: true or low confidence

### Critical safety
```txt
A large electric wire is hanging low near the bus stop after rain.
```
Expected:
- category: Safety or Streetlight/Electrical
- severity: 5
- safetyLevel: critical
- safetyDisclaimerRequired: true

## UI validation

- [ ] No broken buttons.
- [ ] Loading states are visible.
- [ ] Empty states look intentional.
- [ ] Error states are friendly.
- [ ] Text is professional.
- [ ] No emojis unless intentionally used in UI icons.
- [ ] No fake official claims.

## Repo validation

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

If there is no `typecheck` script, add:

```json
"typecheck": "tsc --noEmit"
```

## Deployment validation

- [ ] `gcloud run deploy` completes.
- [ ] Public Cloud Run URL opens.
- [ ] Report creation works on deployed URL.
- [ ] Gemini API works on deployed URL.
- [ ] Firestore writes appear in Firebase/GCP console.
- [ ] Submission form accepts the URL.

## Demo validation

- [ ] Demo can be completed in 4–5 minutes.
- [ ] New report scenario is rehearsed.
- [ ] Dashboard story is clear.
- [ ] Google Cloud deployment is mentioned.
- [ ] AI structured triage is highlighted.

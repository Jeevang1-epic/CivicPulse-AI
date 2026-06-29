# Acceptance Tests

## Manual tests

1. Open `/`.
2. Click Report Issue.
3. Submit:
   `Water leakage on main road is making the road slippery for bikes.`
4. Confirm:
   - category Water
   - severity 4 or high
   - safety urgent
   - citizen reply generated
5. Open `/board`.
6. Confirm the report appears.
7. Click report details.
8. Confirm action plan appears.
9. Open `/dashboard`.
10. Change status to Assigned.
11. Confirm status updates.
12. Open on mobile width.

## AI classification tests

| Input | Expected category | Expected severity |
|---|---|---|
| Streetlight near college back gate not working for 4 days | Streetlight | 4 |
| Garbage pile near apartment entrance | Garbage | 2-3 |
| Water leakage making road slippery | Water | 4 |
| Large electric wire hanging near bus stop after rain | Safety/Streetlight | 5 |
| Something is wrong here | Other | insufficientInfo true |

## Build tests

```bash
npm run lint
npm run typecheck
npm run build
```

## Deployment test

```bash
gcloud run deploy civicpulse-ai --source . --region asia-south1 --allow-unauthenticated
```

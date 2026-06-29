# Firestore Implementation Notes for Codex

## Preferred architecture

Use a repository abstraction:

```ts
interface ReportsRepository {
  listReports(): Promise<CivicReport[]>;
  getReport(id: string): Promise<CivicReport | null>;
  createReport(input: CreateReportInput): Promise<CivicReport>;
  updateStatus(id: string, status: ReportStatus): Promise<CivicReport>;
  supportReport(id: string): Promise<CivicReport>;
}
```

Then implement:
- `LocalReportsRepository`
- `FirestoreReportsRepository`

Select implementation based on env:
- if Firebase/GCP configured: Firestore
- else: local demo data

## Why

This ensures the demo works even if cloud config breaks during judging.

## Server vs client

For the fastest reliable MVP:
- Server routes write reports.
- Client fetches from API routes.
- Later add realtime Firestore listeners.

## Timestamp format

Use ISO strings for simplicity in UI:
```ts
new Date().toISOString()
```

## IDs

Use:
```ts
crypto.randomUUID()
```
when available.

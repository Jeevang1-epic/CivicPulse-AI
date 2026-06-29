# 06 — Data Model

## Report object

```ts
export type ReportStatus = "open" | "in_review" | "assigned" | "resolved";

export type CivicReport = {
  id: string;
  title: string;
  description: string;
  cleanedSummary: string;
  category: string;
  severity: number;
  safetyLevel: "low" | "medium" | "urgent" | "critical";
  locationText: string;
  lat?: number;
  lng?: number;
  status: ReportStatus;
  duplicateKey: string;
  responsibleTeam: string;
  recommendedAction: string;
  citizenReply: string;
  supportCount: number;
  helpOffers: number;
  needsHumanReview: boolean;
  insufficientInfo: boolean;
  safetyDisclaimerRequired: boolean;
  createdAt: string;
  updatedAt: string;
  activity: ActivityEvent[];
};
```

## Activity event

```ts
export type ActivityEvent = {
  id: string;
  type: "created" | "status_changed" | "supported" | "help_offered" | "comment";
  message: string;
  actorRole: "citizen" | "volunteer" | "admin" | "system";
  createdAt: string;
};
```

## Categories

Use `data/categories.json` as the initial source.

## Seed reports

Use `data/sample_reports.json` to populate the dashboard when Firestore is empty or in demo mode.

## Firestore design

### `reports`
Main public issue records.

### `neighborhoodBriefs`
AI-generated summaries. For MVP this can be generated on the fly from reports.

### `auditLogs`
Optional. Useful for portfolio seriousness.

## Indexing notes

For MVP:
- order by `createdAt desc`
- filter by `status`
- filter by `category`
- filter by `severity`

If Firestore asks for an index, create it from the console link shown in the error.

## Privacy constraints

Do not store:
- Aadhaar or government ID
- full home address unless necessary
- phone number
- medical details
- precise location for sensitive cases

For demo, use fictional data.

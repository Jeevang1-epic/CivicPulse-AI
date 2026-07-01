import type { ActivityEvent, CivicReport, CreateReportInput, TriageResult } from "@/lib/types";

export function createReportFromInput(input: CreateReportInput, triage: TriageResult, idPrefix: "local" | "report") {
  const now = new Date().toISOString();
  const activity: ActivityEvent[] = [
    {
      id: `${idPrefix}-created-${now}`,
      type: "created",
      actorRole: "citizen",
      message: `Report submitted from ${input.locationText}.`,
      createdAt: now
    },
    {
      id: `${idPrefix}-triaged-${now}`,
      type: "triaged",
      actorRole: "system",
      message: `Prepared ${triage.triageMode.replaceAll("_", " ")} triage as ${triage.category} with severity ${triage.severity}.`,
      createdAt: now
    }
  ];

  if (input.contactReference) {
    activity.push({
      id: `${idPrefix}-reference-${now}`,
      type: "comment",
      actorRole: "citizen",
      message: "Optional follow-up reference was provided. The value is not displayed publicly.",
      createdAt: now
    });
  }

  return {
    id: `${idPrefix}-${crypto.randomUUID()}`,
    title: triage.title,
    description: input.description,
    cleanedSummary: triage.cleanedSummary,
    category: triage.category,
    severity: triage.severity,
    safetyLevel: triage.safetyLevel,
    locationText: input.locationText,
    status: "open",
    duplicateKey: triage.duplicateKey,
    responsibleTeam: triage.responsibleTeam,
    recommendedAction: triage.recommendedAction,
    citizenReply: triage.citizenReply,
    supportCount: 1,
    helpOffers: 0,
    triageMode: triage.triageMode,
    contactReferenceProvided: Boolean(input.contactReference),
    needsHumanReview: triage.needsHumanReview,
    insufficientInfo: triage.insufficientInfo,
    safetyDisclaimerRequired: triage.safetyDisclaimerRequired,
    triage,
    createdAt: now,
    updatedAt: now,
    activity
  } satisfies CivicReport;
}

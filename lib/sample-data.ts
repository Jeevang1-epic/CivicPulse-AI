import categoriesJson from "@/data/categories.json";
import reportsJson from "@/data/sample_reports.json";
import type { ActivityEvent, CategoryDefinition, CivicCategory, CivicReport, SafetyLevel, TriageResult } from "@/lib/types";
import { getReportMetrics } from "@/lib/utils";

type SeedReport = Omit<CivicReport, "activity" | "triage" | "contactReferenceProvided"> & {
  activity?: ActivityEvent[];
  contactReferenceProvided?: boolean;
};

export const civicCategories = categoriesJson as CategoryDefinition[];

const importedSeedReports = reportsJson as SeedReport[];

const additionalSeedReports: SeedReport[] = [
  {
    id: "demo-4",
    title: "Deep pothole near metro feeder stop",
    description: "A deep pothole has opened near the metro feeder stop after last night's rain. Autos and bikes are swerving suddenly.",
    cleanedSummary:
      "A deep pothole near the metro feeder stop is forcing autos and bikes to swerve, creating a traffic and rider safety risk.",
    category: "Road",
    severity: 4,
    safetyLevel: "urgent",
    locationText: "Metro feeder stop, 5th Main Road",
    status: "open",
    duplicateKey: "road-pothole-metro-feeder-5th-main",
    responsibleTeam: "Road maintenance",
    recommendedAction:
      "Barricade the damaged patch, inspect road subsidence after rain, and schedule urgent filling before evening traffic.",
    citizenReply: "Thanks for reporting. This has been marked urgent because riders are swerving near a transit stop.",
    supportCount: 31,
    helpOffers: 0,
    contactReferenceProvided: false,
    needsHumanReview: true,
    insufficientInfo: false,
    safetyDisclaimerRequired: false,
    createdAt: "2026-06-29T08:45:00.000Z",
    updatedAt: "2026-06-29T09:10:00.000Z"
  },
  {
    id: "demo-5",
    title: "Low hanging electric wire near tea stall",
    description:
      "An electric wire is hanging low near the tea stall outside the bus depot after heavy rain. People are walking very close to it.",
    cleanedSummary:
      "A low hanging electric wire near the bus depot tea stall is close to pedestrian movement after heavy rain.",
    category: "Safety",
    severity: 5,
    safetyLevel: "critical",
    locationText: "Bus depot tea stall, Market Road",
    status: "in_review",
    duplicateKey: "safety-low-wire-bus-depot-market-road",
    responsibleTeam: "Community safety",
    recommendedAction:
      "Keep people away from the wire, mark the area for human review, and contact the appropriate local emergency or electrical service.",
    citizenReply:
      "Thanks for reporting. This may be dangerous. CivicPulse AI is not an emergency service; please contact local emergency services if there is immediate danger.",
    supportCount: 12,
    helpOffers: 1,
    contactReferenceProvided: false,
    needsHumanReview: true,
    insufficientInfo: false,
    safetyDisclaimerRequired: true,
    createdAt: "2026-06-29T07:30:00.000Z",
    updatedAt: "2026-06-29T07:44:00.000Z"
  }
];

function toTriageResult(report: SeedReport): TriageResult {
  return {
    title: report.title,
    cleanedSummary: report.cleanedSummary,
    category: report.category,
    severity: report.severity,
    safetyLevel: report.safetyLevel,
    duplicateKey: report.duplicateKey,
    responsibleTeam: report.responsibleTeam,
    recommendedAction: report.recommendedAction,
    citizenReply: report.citizenReply,
    needsHumanReview: report.needsHumanReview,
    insufficientInfo: report.insufficientInfo,
    safetyDisclaimerRequired: report.safetyDisclaimerRequired
  };
}

function createActivity(report: SeedReport): ActivityEvent[] {
  const timeline: ActivityEvent[] = [
    {
      id: `${report.id}-created`,
      type: "created",
      actorRole: "citizen",
      message: `Report submitted from ${report.locationText}.`,
      createdAt: report.createdAt
    },
    {
      id: `${report.id}-triaged`,
      type: "triaged",
      actorRole: "system",
      message: `Classified as ${report.category} with severity ${report.severity} and ${report.safetyLevel} safety level.`,
      createdAt: report.createdAt
    }
  ];

  if (report.status !== "open") {
    timeline.push({
      id: `${report.id}-status`,
      type: "status_changed",
      actorRole: "admin",
      message: `Status changed to ${report.status.replace("_", " ")} for demo tracking.`,
      createdAt: report.updatedAt
    });
  }

  if (report.supportCount > 0) {
    timeline.push({
      id: `${report.id}-supported`,
      type: "supported",
      actorRole: "citizen",
      message: `${report.supportCount} residents marked that they also saw this issue.`,
      createdAt: report.updatedAt
    });
  }

  if (report.helpOffers > 0) {
    timeline.push({
      id: `${report.id}-help`,
      type: "help_offered",
      actorRole: "volunteer",
      message: `${report.helpOffers} volunteer help offer${report.helpOffers === 1 ? "" : "s"} recorded for community coordination.`,
      createdAt: report.updatedAt
    });
  }

  return [...(report.activity ?? []), ...timeline].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

function enrichReport(report: SeedReport): CivicReport {
  return {
    ...report,
    contactReferenceProvided: report.contactReferenceProvided ?? false,
    triage: toTriageResult(report),
    activity: createActivity(report)
  };
}

export const sampleReports: CivicReport[] = [...importedSeedReports, ...additionalSeedReports].map(enrichReport);

export function sortReportsByPriority(reports: CivicReport[]) {
  return [...reports].sort((a, b) => {
    if (b.severity !== a.severity) {
      return b.severity - a.severity;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getAllReports() {
  return sortReportsByPriority(sampleReports);
}

export function getReportById(id: string) {
  return sampleReports.find((report) => report.id === id) ?? null;
}

export function getPriorityReports(limit = 3) {
  return getAllReports().slice(0, limit);
}

export function getSampleMetrics() {
  return getReportMetrics(sampleReports);
}

export function getCategoryCountsForReports(reports: CivicReport[]) {
  return civicCategories.map((category) => ({
    category: category.label as CivicCategory,
    count: reports.filter((report) => report.category === category.label).length,
    team: category.team
  }));
}

export function getCategoryCounts() {
  return getCategoryCountsForReports(sampleReports);
}

export function getSafetyLevelCountsForReports(reports: CivicReport[]) {
  const safetyLevels: SafetyLevel[] = ["critical", "urgent", "medium", "low"];

  return safetyLevels.map((safetyLevel) => ({
    safetyLevel,
    count: reports.filter((report) => report.safetyLevel === safetyLevel).length
  }));
}

export function getSafetyLevelCounts() {
  return getSafetyLevelCountsForReports(sampleReports);
}

export function getDashboardBriefForReports(reports: CivicReport[]) {
  const urgentReports = reports.filter((report) => report.safetyLevel === "urgent" || report.safetyLevel === "critical");
  const topCategory = getCategoryCountsForReports(reports).sort((a, b) => b.count - a.count)[0];
  const criticalReport = reports.find((report) => report.safetyLevel === "critical");

  return {
    headline: "Electrical safety, road surface, and night visibility risks need the fastest attention today.",
    summary:
      "The current demo queue shows urgent issues around a bus depot, metro feeder stop, main road, and college gate. Prioritize human review for the low hanging wire, temporary road warnings, and transparent status updates for residents.",
    urgentCount: urgentReports.length,
    topCategory: topCategory?.category ?? "Other",
    criticalLocation: criticalReport?.locationText ?? "No critical location in the current seed queue"
  };
}

export function getDashboardBrief() {
  return getDashboardBriefForReports(sampleReports);
}

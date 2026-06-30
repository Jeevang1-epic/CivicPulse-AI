import type { CategoryDefinition, CivicCategory, CivicReport, CommunityBrief, DashboardSummary, TriageMode } from "@/lib/types";

function categoryTeamMap(categories: CategoryDefinition[]) {
  return new Map(categories.map((category) => [category.label, category.team]));
}

export function sortReportsByPriority(reports: CivicReport[]) {
  return [...reports].sort((a, b) => {
    if (b.severity !== a.severity) {
      return b.severity - a.severity;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getDashboardSummaryForReports(reports: CivicReport[], categories: CategoryDefinition[] = []): DashboardSummary {
  const teamsByCategory = categoryTeamMap(categories);
  const categoryCounts = new Map<CivicCategory, number>();

  for (const report of reports) {
    categoryCounts.set(report.category, (categoryCounts.get(report.category) ?? 0) + 1);
  }

  const topCategories = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({
      category,
      count,
      team: teamsByCategory.get(category)
    }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return a.category.localeCompare(b.category);
    })
    .slice(0, 5);

  const recentActivity = reports
    .flatMap((report) =>
      report.activity.map((event) => ({
        ...event,
        reportId: report.id,
        reportTitle: report.title,
        reportStatus: report.status,
        reportCategory: report.category
      }))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const priorityQueue = sortReportsByPriority(reports.filter((report) => report.status !== "resolved")).slice(0, 10);
  const totalSeverity = reports.reduce((sum, report) => sum + report.severity, 0);

  return {
    totalReports: reports.length,
    openReports: reports.filter((report) => report.status === "open").length,
    inReviewReports: reports.filter((report) => report.status === "in_review").length,
    assignedReports: reports.filter((report) => report.status === "assigned").length,
    resolvedReports: reports.filter((report) => report.status === "resolved").length,
    urgentReports: reports.filter((report) => report.safetyLevel === "urgent").length,
    criticalReports: reports.filter((report) => report.safetyLevel === "critical").length,
    averageSeverity: reports.length ? Number((totalSeverity / reports.length).toFixed(1)) : 0,
    topCategories,
    recentActivity,
    priorityQueue
  };
}

export function getFallbackCommunityBrief(reports: CivicReport[], mode: TriageMode = "fallback_missing_key"): CommunityBrief {
  const summary = getDashboardSummaryForReports(reports);
  const topCategory = summary.topCategories[0]?.category ?? "Other";
  const priorityReport = summary.priorityQueue[0];
  const criticalReports = reports.filter((report) => report.safetyLevel === "critical" && report.status !== "resolved");
  const urgentReports = reports.filter((report) => report.safetyLevel === "urgent" && report.status !== "resolved");
  const riskCount = criticalReports.length + urgentReports.length;
  const focusArea = priorityReport ? `${priorityReport.locationText} (${priorityReport.category})` : "No active focus area";
  const headline =
    riskCount > 0
      ? `${riskCount} active urgent or critical civic issue${riskCount === 1 ? "" : "s"} need human review.`
      : "The current civic issue queue is stable, with no urgent or critical active reports.";
  const urgentRiskSummary =
    criticalReports.length > 0
      ? `Critical reports are present, led by ${criticalReports[0].title} at ${criticalReports[0].locationText}.`
      : urgentReports.length > 0
        ? `Urgent reports are present, led by ${urgentReports[0].title} at ${urgentReports[0].locationText}.`
        : "No urgent or critical active reports are currently in the queue.";
  const recommendedNextStep = priorityReport
    ? `Review ${priorityReport.title}, confirm the location details, assign the responsible team, and post a clear status update.`
    : "Keep monitoring new submissions and maintain quick status updates for residents.";
  const citizenSummary =
    reports.length > 0
      ? `Residents have reported ${reports.length} issue${reports.length === 1 ? "" : "s"} so far. ${topCategory} is the strongest current signal.`
      : "No civic reports have been submitted in this demo session yet.";

  return {
    mode,
    headline,
    topCategory,
    urgentRiskSummary,
    focusArea,
    recommendedNextStep,
    citizenSummary,
    generatedAt: new Date().toISOString()
  };
}

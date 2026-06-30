import type { CivicReport, ReportMetrics, ReportStatus, SafetyLevel, TriageMode } from "@/lib/types";

export const civicPulseSafetyDisclaimer =
  "CivicPulse AI is not an emergency service. For immediate danger, contact local emergency services or responsible authorities directly.";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function statusLabel(status: ReportStatus) {
  const labels: Record<ReportStatus, string> = {
    open: "Open",
    in_review: "In review",
    assigned: "Assigned",
    resolved: "Resolved"
  };

  return labels[status];
}

export function safetyLabel(level: SafetyLevel) {
  const labels: Record<SafetyLevel, string> = {
    low: "Low",
    medium: "Medium",
    urgent: "Urgent",
    critical: "Critical"
  };

  return labels[level];
}

export function triageModeLabel(mode?: TriageMode) {
  const labels: Record<TriageMode, string> = {
    gemini: "Gemini AI",
    fallback_missing_key: "Fallback missing key",
    fallback_error: "Fallback error",
    fallback_timeout: "Fallback timeout",
    fallback_invalid_output: "Fallback invalid output"
  };

  return mode ? labels[mode] : "Seed triage";
}

export function getReportMetrics(reports: CivicReport[]): ReportMetrics {
  return {
    total: reports.length,
    open: reports.filter((report) => report.status === "open").length,
    assigned: reports.filter((report) => report.status === "assigned").length,
    urgent: reports.filter((report) => report.safetyLevel === "urgent" || report.safetyLevel === "critical").length,
    critical: reports.filter((report) => report.safetyLevel === "critical").length,
    resolved: reports.filter((report) => report.status === "resolved").length
  };
}

export function getStatusProgress(status: ReportStatus) {
  const progress: Record<ReportStatus, number> = {
    open: 20,
    in_review: 45,
    assigned: 70,
    resolved: 100
  };

  return progress[status];
}

export function getPriorityExplanation(report: CivicReport) {
  if (report.safetyLevel === "critical") {
    return "Marked critical because the report describes a possible immediate public safety hazard and requires human review.";
  }

  if (report.safetyLevel === "urgent") {
    return "Marked urgent because the issue may affect road safety, visibility, public movement, or essential services.";
  }

  if (report.insufficientInfo) {
    return "Needs human review because the report may not contain enough detail for confident triage.";
  }

  return "Priority is based on the issue category, likely public impact, support count, and current workflow status.";
}

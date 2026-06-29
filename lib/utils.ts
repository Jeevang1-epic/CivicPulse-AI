import type { CivicReport, ReportMetrics, ReportStatus, SafetyLevel } from "@/lib/types";

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

export function getReportMetrics(reports: CivicReport[]): ReportMetrics {
  return {
    total: reports.length,
    open: reports.filter((report) => report.status === "open").length,
    urgent: reports.filter((report) => report.safetyLevel === "urgent" || report.safetyLevel === "critical").length,
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

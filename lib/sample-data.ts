import categoriesJson from "@/data/categories.json";
import reportsJson from "@/data/sample_reports.json";
import type { CategoryDefinition, CivicCategory, CivicReport } from "@/lib/types";
import { getReportMetrics } from "@/lib/utils";

export const civicCategories = categoriesJson as CategoryDefinition[];

export const sampleReports = reportsJson as CivicReport[];

export function getAllReports() {
  return [...sampleReports].sort((a, b) => {
    if (b.severity !== a.severity) {
      return b.severity - a.severity;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
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

export function getCategoryCounts() {
  return civicCategories.map((category) => ({
    category: category.label as CivicCategory,
    count: sampleReports.filter((report) => report.category === category.label).length,
    team: category.team
  }));
}

export function getDashboardBrief() {
  const urgentReports = sampleReports.filter((report) => report.safetyLevel === "urgent" || report.safetyLevel === "critical");
  const topCategory = getCategoryCounts().sort((a, b) => b.count - a.count)[0];

  return {
    headline: "Night safety and road surface risks need the fastest attention today.",
    summary:
      "Seed data shows urgent streetlight and water leakage reports around high-movement areas. The demo dashboard should prioritize inspection, temporary warning markers, and transparent status updates.",
    urgentCount: urgentReports.length,
    topCategory: topCategory?.category ?? "Other"
  };
}

import { getReportById, sampleReports } from "@/lib/sample-data";
import type { CivicReport, CreateReportInput, ReportStatus, TriageResult } from "@/lib/types";

export interface ReportsRepository {
  listReports(): Promise<CivicReport[]>;
  getReport(id: string): Promise<CivicReport | null>;
  createReport(input: CreateReportInput, triage: TriageResult): Promise<CivicReport>;
  updateStatus(id: string, status: ReportStatus): Promise<CivicReport>;
  supportReport(id: string): Promise<CivicReport>;
  offerHelp(id: string): Promise<CivicReport>;
}

export class LocalReportsRepository implements ReportsRepository {
  private reports: CivicReport[];

  constructor(seedReports: CivicReport[] = sampleReports) {
    this.reports = [...seedReports];
  }

  async listReports() {
    return [...this.reports];
  }

  async getReport(id: string) {
    return this.reports.find((report) => report.id === id) ?? getReportById(id);
  }

  async createReport(input: CreateReportInput, triage: TriageResult) {
    const now = new Date().toISOString();
    const report: CivicReport = {
      id: `local-${crypto.randomUUID()}`,
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
      needsHumanReview: triage.needsHumanReview,
      insufficientInfo: triage.insufficientInfo,
      safetyDisclaimerRequired: triage.safetyDisclaimerRequired,
      triage,
      createdAt: now,
      updatedAt: now,
      activity: [
        {
          id: `local-created-${now}`,
          type: "created",
          actorRole: "citizen",
          message: `Report submitted from ${input.locationText}.`,
          createdAt: now
        },
        {
          id: `local-triaged-${now}`,
          type: "triaged",
          actorRole: "system",
          message: `Prepared local triage as ${triage.category} with severity ${triage.severity}.`,
          createdAt: now
        }
      ]
    };

    this.reports = [report, ...this.reports];
    return report;
  }

  async updateStatus(id: string, status: ReportStatus) {
    const reportIndex = this.reports.findIndex((report) => report.id === id);

    if (reportIndex === -1) {
      throw new Error("Report not found");
    }

    const now = new Date().toISOString();
    const updatedReport: CivicReport = {
      ...this.reports[reportIndex],
      status,
      updatedAt: now,
      activity: [
        ...this.reports[reportIndex].activity,
        {
          id: `${id}-status-${now}`,
          type: "status_changed",
          actorRole: "admin",
          message: `Status changed to ${status.replace("_", " ")}.`,
          createdAt: now
        }
      ]
    };

    this.reports[reportIndex] = updatedReport;
    return updatedReport;
  }

  async supportReport(id: string) {
    return this.incrementCounter(id, "supportCount");
  }

  async offerHelp(id: string) {
    return this.incrementCounter(id, "helpOffers");
  }

  private incrementCounter(id: string, key: "supportCount" | "helpOffers") {
    const reportIndex = this.reports.findIndex((report) => report.id === id);

    if (reportIndex === -1) {
      throw new Error("Report not found");
    }

    const now = new Date().toISOString();
    const updatedReport: CivicReport = {
      ...this.reports[reportIndex],
      [key]: this.reports[reportIndex][key] + 1,
      updatedAt: now,
      activity: [
        ...this.reports[reportIndex].activity,
        {
          id: `${id}-${key}-${now}`,
          type: key === "supportCount" ? "supported" : "help_offered",
          actorRole: key === "supportCount" ? "citizen" : "volunteer",
          message: key === "supportCount" ? "A resident marked that they also saw this issue." : "A volunteer offered to help.",
          createdAt: now
        }
      ]
    };

    this.reports[reportIndex] = updatedReport;
    return updatedReport;
  }
}

export function createReportsRepository(): ReportsRepository {
  return new LocalReportsRepository();
}

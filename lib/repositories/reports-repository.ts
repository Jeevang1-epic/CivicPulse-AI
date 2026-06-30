import { getReportById, sampleReports } from "@/lib/sample-data";
import type { ActivityEvent, CivicReport, CreateReportInput, ReportStatus, TriageResult } from "@/lib/types";

export interface ReportsRepository {
  listReports(): Promise<CivicReport[]>;
  getReportById(id: string): Promise<CivicReport | null>;
  createReport(input: CreateReportInput, triage: TriageResult): Promise<CivicReport>;
  updateStatus(id: string, status: ReportStatus): Promise<CivicReport>;
  supportReport(id: string): Promise<CivicReport>;
  offerHelp(id: string): Promise<CivicReport>;
}

export class LocalReportsRepository implements ReportsRepository {
  private reports: CivicReport[];

  constructor(seedReports: CivicReport[] = sampleReports) {
    // Seed once per process; Firestore will replace this local store in the cloud-backed phase.
    this.reports = [...seedReports];
  }

  async listReports() {
    return [...this.reports];
  }

  async getReportById(id: string) {
    return this.reports.find((report) => report.id === id) ?? getReportById(id);
  }

  async createReport(input: CreateReportInput, triage: TriageResult) {
    const now = new Date().toISOString();
    const activity: ActivityEvent[] = [
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
        message: `Prepared ${triage.triageMode.replaceAll("_", " ")} triage as ${triage.category} with severity ${triage.severity}.`,
        createdAt: now
      }
    ];

    if (input.contactReference) {
      activity.push({
        id: `local-reference-${now}`,
        type: "comment",
        actorRole: "citizen",
        message: "Optional follow-up reference was provided. The value is not displayed publicly.",
        createdAt: now
      });
    }

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
      triageMode: triage.triageMode,
      contactReferenceProvided: Boolean(input.contactReference),
      needsHumanReview: triage.needsHumanReview,
      insufficientInfo: triage.insufficientInfo,
      safetyDisclaimerRequired: triage.safetyDisclaimerRequired,
      triage,
      createdAt: now,
      updatedAt: now,
      activity
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

// TODO: Replace this factory with a Firestore-backed implementation once cloud
// configuration is available. API routes should keep depending on this interface.
export function createReportsRepository(): ReportsRepository {
  return new LocalReportsRepository();
}

declare global {
  // Keeps local demo writes visible across route-handler bundles in one Node process.
  // This is intentionally process-local and should not be treated as durable storage.
  // eslint-disable-next-line no-var
  var __civicPulseReportsRepository: ReportsRepository | undefined;
}

export function getReportsRepository(): ReportsRepository {
  if (!globalThis.__civicPulseReportsRepository) {
    globalThis.__civicPulseReportsRepository = createReportsRepository();
  }

  return globalThis.__civicPulseReportsRepository;
}

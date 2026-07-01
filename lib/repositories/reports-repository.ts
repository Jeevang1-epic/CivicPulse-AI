import { getDashboardSummaryForReports, getFallbackCommunityBrief } from "@/lib/dashboard-intelligence";
import { createFirestoreReportsRepository, getFirestoreEnvironmentStatus } from "@/lib/repositories/firestore-reports-repository";
import { createReportFromInput } from "@/lib/repositories/report-factory";
import { ReportNotFoundError } from "@/lib/repositories/repository-errors";
import { civicCategories, getReportById, sampleReports } from "@/lib/sample-data";
import type {
  ActivityEvent,
  ActivityEventInput,
  CivicReport,
  CommunityBrief,
  CreateReportInput,
  DashboardSummary,
  ReportStatus,
  TriageResult
} from "@/lib/types";
import { statusLabel } from "@/lib/utils";

export interface ReportsRepository {
  listReports(): Promise<CivicReport[]>;
  getReportById(id: string): Promise<CivicReport | null>;
  createReport(input: CreateReportInput, triage: TriageResult): Promise<CivicReport>;
  updateReportStatus(id: string, status: ReportStatus): Promise<CivicReport>;
  updateStatus(id: string, status: ReportStatus): Promise<CivicReport>;
  assignResponsibleTeam(id: string, team: string): Promise<CivicReport>;
  addActivityEvent(id: string, event: ActivityEventInput): Promise<CivicReport>;
  getDashboardSummary(): Promise<DashboardSummary>;
  getCommunityInsights(): Promise<CommunityBrief>;
  supportReport(id: string): Promise<CivicReport>;
  offerHelp(id: string): Promise<CivicReport>;
}

export type ReportsStorageStatus = {
  storageMode: "firestore" | "local_fallback";
  firestoreConfigured: boolean;
  collection: string;
  warnings: string[];
};

export class LocalReportsRepository implements ReportsRepository {
  private reports: CivicReport[];

  constructor(seedReports: CivicReport[] = sampleReports) {
    // Seed once per process. This fallback keeps demos working when Firestore env vars are absent or invalid.
    this.reports = [...seedReports];
  }

  async listReports() {
    return [...this.reports];
  }

  async getReportById(id: string) {
    return this.reports.find((report) => report.id === id) ?? getReportById(id);
  }

  async createReport(input: CreateReportInput, triage: TriageResult) {
    const report = createReportFromInput(input, triage, "local");

    this.reports = [report, ...this.reports];
    return report;
  }

  async updateReportStatus(id: string, status: ReportStatus) {
    const now = new Date().toISOString();

    return this.updateReport(id, (report) => ({
      ...report,
      status,
      updatedAt: now,
      activity: [
        ...report.activity,
        {
          id: `${id}-status-${now}`,
          type: "status_changed",
          actorRole: "admin",
          message: `Status changed to ${statusLabel(status)}.`,
          createdAt: now
        }
      ]
    }));
  }

  async updateStatus(id: string, status: ReportStatus) {
    return this.updateReportStatus(id, status);
  }

  async assignResponsibleTeam(id: string, team: string) {
    const normalizedTeam = team.replace(/\s+/g, " ").trim();

    if (!normalizedTeam) {
      throw new Error("Responsible team is required");
    }

    const now = new Date().toISOString();

    return this.updateReport(id, (report) => ({
      ...report,
      responsibleTeam: normalizedTeam,
      triage: {
        ...report.triage,
        responsibleTeam: normalizedTeam
      },
      updatedAt: now,
      activity: [
        ...report.activity,
        {
          id: `${id}-team-${now}`,
          type: "comment",
          actorRole: "admin",
          message: `Responsible team set to ${normalizedTeam}.`,
          createdAt: now
        }
      ]
    }));
  }

  async addActivityEvent(id: string, event: ActivityEventInput) {
    const now = new Date().toISOString();
    const createdAt = event.createdAt ?? now;
    const activityEvent: ActivityEvent = {
      id: event.id ?? `${id}-${event.type}-${crypto.randomUUID()}`,
      type: event.type,
      actorRole: event.actorRole,
      message: event.message,
      createdAt
    };

    return this.updateReport(id, (report) => ({
      ...report,
      updatedAt: now,
      activity: [...report.activity, activityEvent]
    }));
  }

  async getDashboardSummary() {
    return getDashboardSummaryForReports(this.reports, civicCategories);
  }

  async getCommunityInsights() {
    return getFallbackCommunityBrief(this.reports);
  }

  async supportReport(id: string) {
    return this.incrementCounter(id, "supportCount");
  }

  async offerHelp(id: string) {
    return this.incrementCounter(id, "helpOffers");
  }

  private incrementCounter(id: string, key: "supportCount" | "helpOffers") {
    const now = new Date().toISOString();

    return this.updateReport(id, (report) => ({
      ...report,
      [key]: report[key] + 1,
      updatedAt: now,
      activity: [
        ...report.activity,
        {
          id: `${id}-${key}-${now}`,
          type: key === "supportCount" ? "supported" : "help_offered",
          actorRole: key === "supportCount" ? "citizen" : "volunteer",
          message: key === "supportCount" ? "A resident marked that they also saw this issue." : "A volunteer offered to help.",
          createdAt: now
        }
      ]
    }));
  }

  private updateReport(id: string, updater: (report: CivicReport) => CivicReport) {
    const reportIndex = this.reports.findIndex((report) => report.id === id);

    if (reportIndex === -1) {
      throw new ReportNotFoundError();
    }

    const updatedReport = updater(this.reports[reportIndex]);
    this.reports[reportIndex] = updatedReport;
    return updatedReport;
  }
}

class ResilientReportsRepository implements ReportsRepository {
  constructor(private readonly primary: ReportsRepository, private readonly fallback: ReportsRepository) {}

  async listReports() {
    return this.tryPrimary(() => this.primary.listReports(), () => this.fallback.listReports(), "list reports");
  }

  async getReportById(id: string) {
    return this.tryPrimary(() => this.primary.getReportById(id), () => this.fallback.getReportById(id), "get report");
  }

  async createReport(input: CreateReportInput, triage: TriageResult) {
    return this.tryPrimary(() => this.primary.createReport(input, triage), () => this.fallback.createReport(input, triage), "create report");
  }

  async updateReportStatus(id: string, status: ReportStatus) {
    return this.tryPrimary(
      () => this.primary.updateReportStatus(id, status),
      () => this.fallback.updateReportStatus(id, status),
      "update report status"
    );
  }

  async updateStatus(id: string, status: ReportStatus) {
    return this.updateReportStatus(id, status);
  }

  async assignResponsibleTeam(id: string, team: string) {
    return this.tryPrimary(
      () => this.primary.assignResponsibleTeam(id, team),
      () => this.fallback.assignResponsibleTeam(id, team),
      "assign responsible team"
    );
  }

  async addActivityEvent(id: string, event: ActivityEventInput) {
    return this.tryPrimary(
      () => this.primary.addActivityEvent(id, event),
      () => this.fallback.addActivityEvent(id, event),
      "add activity event"
    );
  }

  async getDashboardSummary() {
    return this.tryPrimary(() => this.primary.getDashboardSummary(), () => this.fallback.getDashboardSummary(), "get dashboard summary");
  }

  async getCommunityInsights() {
    return this.tryPrimary(() => this.primary.getCommunityInsights(), () => this.fallback.getCommunityInsights(), "get community insights");
  }

  async supportReport(id: string) {
    return this.tryPrimary(() => this.primary.supportReport(id), () => this.fallback.supportReport(id), "support report");
  }

  async offerHelp(id: string) {
    return this.tryPrimary(() => this.primary.offerHelp(id), () => this.fallback.offerHelp(id), "offer help");
  }

  private async tryPrimary<T>(primaryOperation: () => Promise<T>, fallbackOperation: () => Promise<T>, operationName: string) {
    try {
      return await primaryOperation();
    } catch (error) {
      if (error instanceof ReportNotFoundError) {
        throw error;
      }

      console.warn(`[CivicPulse AI] Firestore ${operationName} failed; using local fallback when possible.`);
      return fallbackOperation();
    }
  }
}

export function createReportsRepository(): ReportsRepository {
  const localRepository = new LocalReportsRepository();
  const firestoreRepository = createFirestoreReportsRepository();

  if (!firestoreRepository) {
    return localRepository;
  }

  return new ResilientReportsRepository(firestoreRepository, localRepository);
}

export function getReportsStorageStatus(): ReportsStorageStatus {
  const environmentStatus = getFirestoreEnvironmentStatus();

  if (!environmentStatus.configured) {
    return {
      storageMode: "local_fallback",
      firestoreConfigured: false,
      collection: environmentStatus.collectionName,
      warnings: environmentStatus.warnings
    };
  }

  const firestoreRepository = createFirestoreReportsRepository();

  if (!firestoreRepository) {
    return {
      storageMode: "local_fallback",
      firestoreConfigured: true,
      collection: environmentStatus.collectionName,
      warnings: ["Firestore Admin initialization failed; using local fallback."]
    };
  }

  return {
    storageMode: "firestore",
    firestoreConfigured: true,
    collection: environmentStatus.collectionName,
    warnings: []
  };
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

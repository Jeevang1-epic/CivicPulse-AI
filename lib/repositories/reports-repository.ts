import { getReportById, sampleReports } from "@/lib/sample-data";
import type { CivicReport, ReportStatus } from "@/lib/types";

export interface ReportsRepository {
  listReports(): Promise<CivicReport[]>;
  getReport(id: string): Promise<CivicReport | null>;
  updateStatus(id: string, status: ReportStatus): Promise<CivicReport>;
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

  async updateStatus(id: string, status: ReportStatus) {
    const reportIndex = this.reports.findIndex((report) => report.id === id);

    if (reportIndex === -1) {
      throw new Error("Report not found");
    }

    const updatedReport: CivicReport = {
      ...this.reports[reportIndex],
      status,
      updatedAt: new Date().toISOString()
    };

    this.reports[reportIndex] = updatedReport;
    return updatedReport;
  }
}

export function createReportsRepository(): ReportsRepository {
  return new LocalReportsRepository();
}

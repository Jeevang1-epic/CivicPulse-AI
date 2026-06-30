"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ReportCard } from "@/components/ReportCard";
import type { CategoryDefinition, CivicCategory, CivicReport, ReportStatus } from "@/lib/types";

type ReportBoardProps = {
  categories: CategoryDefinition[];
  initialReports: CivicReport[];
};

type ReportResponse = {
  report?: CivicReport;
  error?: {
    message: string;
  };
};

type SortMode = "priority" | "newest";

const statuses: Array<{ label: string; value: ReportStatus | "all" }> = [
  { label: "All statuses", value: "all" },
  { label: "Open", value: "open" },
  { label: "In review", value: "in_review" },
  { label: "Assigned", value: "assigned" },
  { label: "Resolved", value: "resolved" }
];

export function ReportBoard({ categories, initialReports }: ReportBoardProps) {
  const [reports, setReports] = useState(initialReports);
  const [category, setCategory] = useState<CivicCategory | "all">("all");
  const [status, setStatus] = useState<ReportStatus | "all">("all");
  const [sortMode, setSortMode] = useState<SortMode>("priority");
  const [supportingId, setSupportingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredReports = useMemo(() => {
    return reports
      .filter((report) => (category === "all" ? true : report.category === category))
      .filter((report) => (status === "all" ? true : report.status === status))
      .sort((a, b) => {
        if (sortMode === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        if (b.severity !== a.severity) {
          return b.severity - a.severity;
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [category, reports, sortMode, status]);

  async function supportReport(id: string) {
    if (supportingId) {
      return;
    }

    setSupportingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/reports/${id}/support`, {
        method: "POST"
      });
      const data = (await response.json()) as ReportResponse;

      if (!response.ok || !data.report) {
        setError(data.error?.message ?? "Could not support this report.");
        return;
      }

      const updatedReport = data.report;
      setReports((currentReports) => currentReports.map((report) => (report.id === id ? updatedReport : report)));
    } catch {
      setError("Could not support this report. Please try again.");
    } finally {
      setSupportingId(null);
    }
  }

  return (
    <div>
      <div className="mt-7 grid gap-3 md:grid-cols-3">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Category</span>
          <select
            className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-civic-500 focus:ring-4 focus:ring-civic-100"
            onChange={(event) => setCategory(event.target.value as CivicCategory | "all")}
            value={category}
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.label}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Status</span>
          <select
            className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-civic-500 focus:ring-4 focus:ring-civic-100"
            onChange={(event) => setStatus(event.target.value as ReportStatus | "all")}
            value={status}
          >
            {statuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Sort</span>
          <select
            className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-civic-500 focus:ring-4 focus:ring-civic-100"
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            value={sortMode}
          >
            <option value="priority">Severity first</option>
            <option value="newest">Newest first</option>
          </select>
        </label>
      </div>

      {error ? <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {filteredReports.length ? (
          filteredReports.map((report) => (
            <ReportCard key={report.id} report={report}>
              <div className="flex flex-col gap-3 border-t border-slate-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">{report.supportCount} residents have supported this report.</p>
                <Button disabled={supportingId === report.id} onClick={() => supportReport(report.id)} size="sm" type="button" variant="secondary">
                  {supportingId === report.id ? "Updating..." : "I also saw this"}
                </Button>
              </div>
            </ReportCard>
          ))
        ) : (
          <EmptyState
            actionHref="/report"
            actionLabel="Report an issue"
            description="No reports match the current filters. Try clearing filters or submit a new report."
            title="No matching reports"
          />
        )}
      </div>
    </div>
  );
}

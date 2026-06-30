"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { getDashboardSummaryForReports, sortReportsByPriority } from "@/lib/dashboard-intelligence";
import type { CategoryDefinition, CivicCategory, CivicReport, CommunityBrief, ReportStatus, SeverityScore } from "@/lib/types";
import {
  civicPulseSafetyDisclaimer,
  cn,
  formatDate,
  getStatusProgress,
  safetyLabel,
  statusLabel,
  triageModeLabel
} from "@/lib/utils";

type DashboardCommandCenterProps = {
  categories: CategoryDefinition[];
  initialBrief: CommunityBrief;
  initialReports: CivicReport[];
};

type ReportResponse = {
  report?: CivicReport;
  error?: {
    message: string;
  };
};

const workflowStatuses: ReportStatus[] = ["open", "in_review", "assigned", "resolved"];

const statusFilterOptions: Array<{ label: string; value: ReportStatus | "all" }> = [
  { label: "All statuses", value: "all" },
  { label: "Open", value: "open" },
  { label: "In review", value: "in_review" },
  { label: "Assigned", value: "assigned" },
  { label: "Resolved", value: "resolved" }
];

const severityFilterOptions: Array<{ label: string; value: SeverityScore | "all" }> = [
  { label: "All severities", value: "all" },
  { label: "Severity 5", value: 5 },
  { label: "Severity 4", value: 4 },
  { label: "Severity 3", value: 3 },
  { label: "Severity 2", value: 2 },
  { label: "Severity 1", value: 1 }
];

const inputClass =
  "rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-civic-500 focus:ring-4 focus:ring-civic-100";

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export function DashboardCommandCenter({ categories, initialBrief, initialReports }: DashboardCommandCenterProps) {
  const [reports, setReports] = useState(initialReports);
  const [brief, setBrief] = useState(initialBrief);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<CivicCategory | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<SeverityScore | "all">("all");
  const [query, setQuery] = useState("");
  const [selectedReportId, setSelectedReportId] = useState(initialReports[0]?.id ?? "");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [briefRefreshing, setBriefRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => getDashboardSummaryForReports(reports, categories), [categories, reports]);

  const filteredReports = useMemo(() => {
    const search = normalizeSearch(query);

    return sortReportsByPriority(reports)
      .filter((report) => (statusFilter === "all" ? true : report.status === statusFilter))
      .filter((report) => (categoryFilter === "all" ? true : report.category === categoryFilter))
      .filter((report) => (severityFilter === "all" ? true : report.severity === severityFilter))
      .filter((report) => {
        if (!search) {
          return true;
        }

        const searchable = [
          report.title,
          report.cleanedSummary,
          report.description,
          report.locationText,
          report.category,
          report.responsibleTeam,
          report.status
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(search);
      });
  }, [categoryFilter, query, reports, severityFilter, statusFilter]);

  const selectedReport =
    reports.find((report) => report.id === selectedReportId) ?? filteredReports[0] ?? summary.priorityQueue[0] ?? reports[0] ?? null;

  async function refreshBrief() {
    setBriefRefreshing(true);

    try {
      const response = await fetch("/api/dashboard/community-brief", {
        cache: "no-store"
      });
      const data = (await response.json()) as CommunityBrief;

      if (response.ok && data.headline) {
        setBrief(data);
      }
    } catch {
      // The existing brief remains visible if the refresh fails.
    } finally {
      setBriefRefreshing(false);
    }
  }

  async function updateReportStatus(reportId: string, status: ReportStatus) {
    if (updatingId) {
      return;
    }

    setUpdatingId(reportId);
    setError(null);

    try {
      const response = await fetch(`/api/reports/${reportId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      const data = (await response.json()) as ReportResponse;

      if (!response.ok || !data.report) {
        setError(data.error?.message ?? "Could not update the report status.");
        return;
      }

      setReports((currentReports) => currentReports.map((report) => (report.id === reportId ? data.report! : report)));
      setSelectedReportId(data.report.id);
      void refreshBrief();
    } catch {
      setError("Could not update the report status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="mt-8 grid gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard detail="Current demo queue" label="Total" value={summary.totalReports} />
        <StatCard detail="Needs first review" label="Open" value={summary.openReports} />
        <StatCard detail="Being assessed" label="In review" value={summary.inReviewReports} />
        <StatCard detail="Owner selected" label="Assigned" value={summary.assignedReports} />
        <StatCard detail="Closed in demo" label="Resolved" value={summary.resolvedReports} />
        <StatCard
          detail={`${summary.urgentReports} urgent, ${summary.criticalReports} critical`}
          label="Urgent + critical"
          value={summary.urgentReports + summary.criticalReports}
        />
        <StatCard detail="Across all reports" label="Avg severity" value={summary.averageSeverity} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Queue filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Search</span>
            <input
              className={inputClass}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, location, team"
              value={query}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Status</span>
            <select
              className={inputClass}
              onChange={(event) => setStatusFilter(event.target.value as ReportStatus | "all")}
              value={statusFilter}
            >
              {statusFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Category</span>
            <select
              className={inputClass}
              onChange={(event) => setCategoryFilter(event.target.value as CivicCategory | "all")}
              value={categoryFilter}
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.label}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Severity</span>
            <select
              className={inputClass}
              onChange={(event) => {
                const value = event.target.value;
                setSeverityFilter(value === "all" ? "all" : (Number(value) as SeverityScore));
              }}
              value={severityFilter}
            >
              {severityFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </CardContent>
      </Card>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Priority queue</CardTitle>
                <p className="mt-1 text-sm text-slate-500">Sorted by severity first, then newest report time.</p>
              </div>
              <span className="text-sm font-medium text-slate-500">{filteredReports.length} shown</span>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            {filteredReports.length ? (
              filteredReports.map((report) => {
                const isSelected = selectedReport?.id === report.id;
                const isCritical = report.safetyLevel === "critical";

                return (
                  <div
                    className={cn(
                      "rounded-lg border p-4 transition",
                      isSelected ? "border-civic-300 bg-civic-50/40" : "border-slate-200 bg-white",
                      isCritical && "border-red-200 bg-red-50/50"
                    )}
                    key={report.id}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={report.status} />
                      <SeverityBadge safetyLevel={report.safetyLevel} severity={report.severity} />
                      {report.needsHumanReview ? (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-100">
                          Human review
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                      <div>
                        <h2 className="font-semibold text-slate-950">{report.title}</h2>
                        <p className="mt-1 text-sm text-slate-600">{report.locationText}</p>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{report.cleanedSummary}</p>
                      </div>
                      <Button href={`/reports/${report.id}`} size="sm" variant="secondary">
                        Detail
                      </Button>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                      <div className="rounded-md bg-white/80 p-3">
                        <p className="font-semibold text-slate-950">{report.category}</p>
                        <p className="mt-1 text-slate-500">Category</p>
                      </div>
                      <div className="rounded-md bg-white/80 p-3">
                        <p className="font-semibold text-slate-950">{report.supportCount}</p>
                        <p className="mt-1 text-slate-500">Resident support</p>
                      </div>
                      <div className="rounded-md bg-white/80 p-3">
                        <p className="font-semibold text-slate-950">{formatDate(report.createdAt)}</p>
                        <p className="mt-1 text-slate-500">Created</p>
                      </div>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-civic-600" style={{ width: `${getStatusProgress(report.status)}%` }} />
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-slate-500">{report.responsibleTeam}</p>
                      <button
                        className={cn(
                          "h-9 rounded-md px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-civic-500",
                          isSelected ? "bg-civic-600 text-white" : "border border-slate-200 bg-white text-slate-900 hover:border-civic-200"
                        )}
                        onClick={() => setSelectedReportId(report.id)}
                        type="button"
                      >
                        {isSelected ? "Selected" : "Open action panel"}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState
                actionHref="/report"
                actionLabel="Submit report"
                description="No reports match the current dashboard filters. Clear a filter or submit a new report."
                title="No matching reports"
              />
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Community brief</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{brief.headline}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {triageModeLabel(brief.mode)} brief · {formatDate(brief.generatedAt)}
                  </p>
                </div>
                <button
                  className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 transition hover:border-civic-200 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={briefRefreshing}
                  onClick={() => void refreshBrief()}
                  type="button"
                >
                  {briefRefreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Top category</p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">{brief.topCategory}</p>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Focus area</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{brief.focusArea}</p>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Risk summary</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{brief.urgentRiskSummary}</p>
                </div>
                <div className="rounded-md bg-civic-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-civic-700">Next ops step</p>
                  <p className="mt-1 text-sm leading-6 text-civic-950">{brief.recommendedNextStep}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Citizen summary</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{brief.citizenSummary}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Action panel</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedReport ? (
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={selectedReport.status} />
                    <SeverityBadge safetyLevel={selectedReport.safetyLevel} severity={selectedReport.severity} />
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-slate-950">{selectedReport.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{selectedReport.locationText}</p>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md bg-slate-50 p-3">
                      <p className="font-semibold text-slate-950">{selectedReport.responsibleTeam}</p>
                      <p className="mt-1 text-slate-500">Responsible team</p>
                    </div>
                    <div className="rounded-md bg-slate-50 p-3">
                      <p className="font-semibold text-slate-950">{safetyLabel(selectedReport.safetyLevel)}</p>
                      <p className="mt-1 text-slate-500">Safety level</p>
                    </div>
                    <div className="rounded-md bg-slate-50 p-3">
                      <p className="font-semibold text-slate-950">{selectedReport.needsHumanReview ? "Required" : "Not flagged"}</p>
                      <p className="mt-1 text-slate-500">Human review</p>
                    </div>
                    <div className="rounded-md bg-slate-50 p-3">
                      <p className="font-semibold text-slate-950">{triageModeLabel(selectedReport.triageMode ?? selectedReport.triage.triageMode)}</p>
                      <p className="mt-1 text-slate-500">Triage mode</p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-sm font-semibold text-slate-950">Workflow status</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {workflowStatuses.map((status) => {
                        const isActive = selectedReport.status === status;
                        const isUpdating = updatingId === selectedReport.id;

                        return (
                          <button
                            aria-pressed={isActive}
                            className={cn(
                              "rounded-md border px-3 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-civic-500 disabled:cursor-not-allowed disabled:opacity-60",
                              isActive
                                ? "border-civic-600 bg-civic-600 text-white"
                                : "border-slate-200 bg-white text-slate-900 hover:border-civic-200"
                            )}
                            disabled={isUpdating || isActive}
                            key={status}
                            onClick={() => updateReportStatus(selectedReport.id, status)}
                            type="button"
                          >
                            {isUpdating && !isActive ? "Updating..." : statusLabel(status)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-5 rounded-md border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recommended action</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{selectedReport.recommendedAction}</p>
                  </div>

                  {selectedReport.safetyDisclaimerRequired ? (
                    <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900">
                      {civicPulseSafetyDisclaimer}
                    </div>
                  ) : null}

                  <div className="mt-5 grid gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-slate-950">Duplicate key</p>
                      <p className="mt-1 break-words text-slate-500">{selectedReport.duplicateKey}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-950">Timeline</p>
                      <ol className="mt-3 grid gap-3">
                        {selectedReport.activity
                          .slice()
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .slice(0, 5)
                          .map((event) => (
                            <li className="rounded-md border border-slate-200 p-3" key={event.id}>
                              <p className="font-medium text-slate-800">{event.message}</p>
                              <p className="mt-1 text-slate-500">
                                {formatDate(event.createdAt)} by {event.actorRole}
                              </p>
                            </li>
                          ))}
                      </ol>
                    </div>
                  </div>

                  <div className="mt-5">
                    <Button href={`/reports/${selectedReport.id}`} variant="secondary">
                      Open full report
                    </Button>
                  </div>
                </div>
              ) : (
                <EmptyState description="Select a report from the priority queue to review status, action, and timeline details." title="No report selected" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="grid gap-3 text-sm">
                {summary.recentActivity.slice(0, 6).map((event) => (
                  <li className="rounded-md border border-slate-200 p-3" key={`${event.reportId}-${event.id}`}>
                    <p className="font-semibold text-slate-950">{event.reportTitle}</p>
                    <p className="mt-1 leading-6 text-slate-600">{event.message}</p>
                    <p className="mt-1 text-slate-500">
                      {formatDate(event.createdAt)} · {statusLabel(event.reportStatus)} · {event.reportCategory}
                    </p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

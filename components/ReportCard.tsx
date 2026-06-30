import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import type { CivicReport } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import type { ReactNode } from "react";

type ReportCardProps = {
  report: CivicReport;
  children?: ReactNode;
};

export function ReportCard({ children, report }: ReportCardProps) {
  return (
    <Card className="overflow-hidden transition hover:-translate-y-0.5 hover:border-civic-100 hover:shadow-soft">
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={report.status} />
            <SeverityBadge safetyLevel={report.safetyLevel} severity={report.severity} />
          </div>
          {report.needsHumanReview ? (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-100">
              Human review
            </span>
          ) : null}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-civic-700">{report.category}</p>
          <h3 className="mt-1 text-lg font-semibold leading-tight text-slate-950">{report.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{report.cleanedSummary}</p>
        </div>
        <div className="mt-4 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
          <div>
            <span className="font-medium text-slate-700">Location:</span> {report.locationText}
          </div>
          <div>
            <span className="font-medium text-slate-700">Team:</span> {report.responsibleTeam}
          </div>
          <div>
            <span className="font-medium text-slate-700">Support:</span> {report.supportCount} residents
          </div>
          <div>
            <span className="font-medium text-slate-700">Updated:</span> {formatDate(report.updatedAt)}
          </div>
        </div>
        <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-600">
          <span className="font-medium text-slate-800">Next action:</span> {report.recommendedAction}
        </div>
      </div>
      {children}
      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Group: {report.duplicateKey}</p>
        <Button href={`/reports/${report.id}`} size="sm" variant="secondary">
          View details
        </Button>
      </div>
    </Card>
  );
}

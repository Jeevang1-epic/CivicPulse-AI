import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { getReportById, sampleReports } from "@/lib/sample-data";
import { formatDate, getStatusProgress, safetyLabel } from "@/lib/utils";

type ReportDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return sampleReports.map((report) => ({
    id: report.id
  }));
}

export default async function ReportDetailsPage({ params }: ReportDetailsPageProps) {
  const { id } = await params;
  const report = getReportById(id);

  if (!report) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          actionHref="/board"
          actionLabel="Back to board"
          description="This report does not exist in the local demo dataset. The app handles missing records without crashing."
          title="Report not found"
        />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-civic-600">Report details</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{report.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{report.cleanedSummary}</p>
        </div>
        <Button href="/board" variant="secondary">
          Back to board
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="grid gap-6">
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={report.status} />
                  <SeverityBadge safetyLevel={report.safetyLevel} severity={report.severity} />
                </div>
                {report.needsHumanReview ? (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-100">
                    Human review required
                  </span>
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-slate-500">Category</dt>
                  <dd className="mt-1 font-semibold text-slate-950">{report.category}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Approximate location</dt>
                  <dd className="mt-1 font-semibold text-slate-950">{report.locationText}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Responsible team</dt>
                  <dd className="mt-1 font-semibold text-slate-950">{report.responsibleTeam}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Safety level</dt>
                  <dd className="mt-1 font-semibold text-slate-950">{safetyLabel(report.safetyLevel)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Duplicate group</dt>
                  <dd className="mt-1 font-semibold text-slate-950">{report.duplicateKey}</dd>
                </div>
              </dl>
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">Workflow progress</span>
                  <span className="text-slate-500">{getStatusProgress(report.status)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-civic-600" style={{ width: `${getStatusProgress(report.status)}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommended action</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-slate-600">{report.recommendedAction}</p>
              <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
                {report.citizenReply}
              </div>
              {report.safetyDisclaimerRequired ? (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900">
                  CivicPulse AI is not an emergency service. If there is immediate danger, contact local emergency
                  services.
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Triage result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">{report.triage.category}</p>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Severity</p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    {report.triage.severity} - {safetyLabel(report.triage.safetyLevel)}
                  </p>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Duplicate key</p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">{report.triage.duplicateKey}</p>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Review flag</p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    {report.triage.needsHumanReview ? "Needs human review" : "No immediate review flag"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Community signal</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-2xl font-semibold text-slate-950">{report.supportCount}</p>
                <p className="mt-1 text-sm text-slate-500">Residents also saw this</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-2xl font-semibold text-slate-950">{report.helpOffers}</p>
                <p className="mt-1 text-sm text-slate-500">Volunteer help offers</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="grid gap-4 text-sm">
                {report.activity.map((event) => (
                  <li className="rounded-md border border-slate-200 p-3" key={event.id}>
                    <p className="font-semibold text-slate-950">{event.message}</p>
                    <p className="mt-1 text-slate-500">
                      {formatDate(event.createdAt)} by {event.actorRole}
                    </p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { getCategoryCounts, getDashboardBrief, getPriorityReports, getSafetyLevelCounts, getSampleMetrics } from "@/lib/sample-data";
import { getStatusProgress, safetyLabel } from "@/lib/utils";

export default function DashboardPage() {
  const metrics = getSampleMetrics();
  const priorityReports = getPriorityReports(5);
  const categoryCounts = getCategoryCounts().filter((item) => item.count > 0);
  const safetyCounts = getSafetyLevelCounts().filter((item) => item.count > 0);
  const brief = getDashboardBrief();

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-civic-600">Operations command center</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Prioritize what needs attention first.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Demo admin mode shows seeded civic reports, priority signals, human-review flags, and the shape of the
            future workflow.
          </p>
        </div>
        <Button href="/board" variant="secondary">
          Open public board
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard detail="Seed data available now" label="Total reports" value={metrics.total} />
        <StatCard detail="Needs first review" label="Open" value={metrics.open} />
        <StatCard detail="Urgent or critical" label="Priority" value={metrics.urgent} />
        <StatCard detail="Requires fastest human review" label="Critical" value={metrics.critical} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader>
            <CardTitle>Priority queue</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {priorityReports.map((report) => (
              <div className="rounded-lg border border-slate-200 p-4" key={report.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={report.status} />
                  <SeverityBadge safetyLevel={report.safetyLevel} severity={report.severity} />
                </div>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-950">{report.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{report.locationText}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{report.recommendedAction}</p>
                  </div>
                  <Button href={`/reports/${report.id}`} size="sm" variant="secondary">
                    Review
                  </Button>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-civic-600" style={{ width: `${getStatusProgress(report.status)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Neighborhood brief</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold text-slate-950">{brief.headline}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{brief.summary}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="font-semibold text-slate-950">{brief.urgentCount}</p>
                  <p className="mt-1 text-slate-500">Urgent reports</p>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="font-semibold text-slate-950">{brief.topCategory}</p>
                  <p className="mt-1 text-slate-500">Top signal</p>
                </div>
              </div>
              <div className="mt-3 rounded-md border border-red-100 bg-red-50 p-3 text-sm leading-6 text-red-900">
                Critical location: {brief.criticalLocation}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category load</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {categoryCounts.map((item) => (
                <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-3" key={item.category}>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{item.category}</p>
                    <p className="text-xs text-slate-500">{item.team}</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-sm font-semibold text-slate-700">{item.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Safety levels</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {safetyCounts.map((item) => (
                <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-3" key={item.safetyLevel}>
                  <span className="text-sm font-semibold text-slate-950">{safetyLabel(item.safetyLevel)}</span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-sm font-semibold text-slate-700">{item.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ReportCard } from "@/components/ReportCard";
import { getAllReports, getCategoryCounts, getSampleMetrics } from "@/lib/sample-data";

const filters = ["All", "Urgent", "Road", "Water", "Garbage", "Streetlight"];

export default function BoardPage() {
  const reports = getAllReports();
  const metrics = getSampleMetrics();
  const categoryCounts = getCategoryCounts().filter((item) => item.count > 0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-5 lg:grid-cols-[1fr_22rem] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-civic-600">Public board</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Track local issues in the open.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            The board uses realistic demo reports for now. Later, new citizen reports will appear here after
            server-side triage and persistence.
          </p>
        </div>
        <Card className="grid grid-cols-3 gap-3 p-4 text-center">
          <div>
            <p className="text-2xl font-semibold text-slate-950">{metrics.total}</p>
            <p className="text-xs text-slate-500">Reports</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-orange-600">{metrics.urgent}</p>
            <p className="text-xs text-slate-500">Priority</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-red-600">{metrics.critical}</p>
            <p className="text-xs text-slate-500">Critical</p>
          </div>
        </Card>
      </div>

      <div className="mt-7 flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <span
            className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm"
            key={filter}
          >
            {filter}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {categoryCounts.map((item) => (
          <Card className="p-4" key={item.category}>
            <p className="text-sm font-semibold text-slate-950">{item.category}</p>
            <p className="mt-1 text-xs text-slate-500">{item.team}</p>
            <p className="mt-3 text-2xl font-semibold text-civic-700">{item.count}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {reports.length ? (
          reports.map((report) => <ReportCard key={report.id} report={report} />)
        ) : (
          <EmptyState
            actionHref="/report"
            actionLabel="Report an issue"
            description="There are no civic reports in the local demo dataset yet."
            title="No reports yet"
          />
        )}
      </div>
    </section>
  );
}

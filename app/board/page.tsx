import { EmptyState } from "@/components/EmptyState";
import { ReportCard } from "@/components/ReportCard";
import { getAllReports } from "@/lib/sample-data";

const filters = ["All", "Urgent", "Road", "Water", "Garbage", "Streetlight"];

export default function BoardPage() {
  const reports = getAllReports();

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-civic-600">Public board</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Track local issues in the open.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            The board uses seed data for now. Later, new citizen reports will appear here after server-side triage.
          </p>
        </div>
      </div>

      <div className="mt-7 flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <span
            className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600"
            key={filter}
          >
            {filter}
          </span>
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

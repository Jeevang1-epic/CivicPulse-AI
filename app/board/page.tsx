import { Card } from "@/components/Card";
import { ReportBoard } from "@/components/ReportBoard";
import { getReportsRepository } from "@/lib/repositories/reports-repository";
import { civicCategories, getCategoryCountsForReports } from "@/lib/sample-data";
import { getReportMetrics } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const reports = await getReportsRepository().listReports();
  const metrics = getReportMetrics(reports);
  const categoryCounts = getCategoryCountsForReports(reports).filter((item) => item.count > 0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-5 lg:grid-cols-[1fr_22rem] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-civic-600">Public board</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Track local issues in the open.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            The board starts with realistic demo reports and updates with new local submissions from this running
            session. Residents can support existing reports instead of creating duplicates.
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

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {categoryCounts.map((item) => (
          <Card className="p-4" key={item.category}>
            <p className="text-sm font-semibold text-slate-950">{item.category}</p>
            <p className="mt-1 text-xs text-slate-500">{item.team}</p>
            <p className="mt-3 text-2xl font-semibold text-civic-700">{item.count}</p>
          </Card>
        ))}
      </div>

      <ReportBoard categories={civicCategories} initialReports={reports} />
    </section>
  );
}

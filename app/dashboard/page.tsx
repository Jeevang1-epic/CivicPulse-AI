import { Button } from "@/components/Button";
import { DashboardCommandCenter } from "@/components/DashboardCommandCenter";
import { getReportsRepository } from "@/lib/repositories/reports-repository";
import { civicCategories } from "@/lib/sample-data";
import { createCommunityBriefService } from "@/lib/services/community-brief-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export default async function DashboardPage() {
  const reports = await getReportsRepository().listReports();
  const brief = await createCommunityBriefService().createBrief(reports);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-civic-600">Operations command center</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Coordinate local issues with clear next steps.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Demo admin mode helps volunteers and coordinators review priority reports, update workflow status, and prepare
            a community brief without claiming official integrations.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/report" variant="secondary">
            Submit report
          </Button>
          <Button href="/board">Open public board</Button>
        </div>
      </div>

      <DashboardCommandCenter categories={civicCategories} initialBrief={brief} initialReports={reports} />
    </section>
  );
}

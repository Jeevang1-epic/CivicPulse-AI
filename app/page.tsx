import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ReportCard } from "@/components/ReportCard";
import { StatCard } from "@/components/StatCard";
import { getDashboardBrief, getPriorityReports, getSampleMetrics } from "@/lib/sample-data";

const workflowSteps = [
  {
    title: "Report",
    description: "Citizens describe a street, water, garbage, safety, or transport issue in simple language."
  },
  {
    title: "Structure",
    description: "The upcoming AI triage layer turns messy text into category, severity, duplicate key, and action data."
  },
  {
    title: "Coordinate",
    description: "The public board and admin dashboard help communities prioritize what needs attention first."
  },
  {
    title: "Track",
    description: "Status, support count, and action notes keep the issue visible until it is resolved."
  }
];

export default function HomePage() {
  const metrics = getSampleMetrics();
  const priorityReports = getPriorityReports(3);
  const brief = getDashboardBrief();

  return (
    <div>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-civic-600">
              Community Hero - Hyperlocal Problem Solver
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Turn scattered local complaints into a civic action queue.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              CivicPulse AI gives residents a simple way to report hyperlocal issues and gives community admins a
              structured board for severity, status, action, and follow-up. It is transparent civic coordination, not
              a fake official integration.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/report">Report an issue</Button>
              <Button href="/board" variant="secondary">
                View public board
              </Button>
              <Button href="/dashboard" variant="ghost">
                Open dashboard
              </Button>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-500">
              Demo scope: reports are added to a community dashboard. For immediate danger, contact local emergency
              services.
            </p>
          </div>
          <Card className="bg-slate-950 p-5 text-white shadow-soft">
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-slate-300">Operations brief</p>
              <h2 className="mt-3 text-2xl font-semibold">{brief.headline}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {brief.summary}
              </p>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-md bg-white/10 p-3">
                <p className="text-2xl font-semibold">{metrics.total}</p>
                <p className="mt-1 text-xs text-slate-300">Demo reports</p>
              </div>
              <div className="rounded-md bg-white/10 p-3">
                <p className="text-2xl font-semibold">{metrics.urgent}</p>
                <p className="mt-1 text-xs text-slate-300">Priority</p>
              </div>
              <div className="rounded-md bg-white/10 p-3">
                <p className="text-2xl font-semibold">{metrics.critical}</p>
                <p className="mt-1 text-xs text-slate-300">Critical</p>
              </div>
            </div>
            <div className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-6 text-amber-50">
              Critical demo reports show safety disclaimers and human-review language. CivicPulse AI does not replace
              emergency services.
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard detail="Visible in the demo dataset" label="Total reports" value={metrics.total} />
          <StatCard detail="Awaiting first review" label="Open reports" value={metrics.open} />
          <StatCard detail="Urgent or critical safety level" label="Priority reports" value={metrics.urgent} />
          <StatCard detail="Marked for action" label="Assigned reports" value={metrics.assigned} />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-civic-600">How it works</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">A compact operating system for local issues.</h2>
          <div className="mt-6 grid gap-3">
            {workflowSteps.map((step, index) => (
              <Card className="p-5" key={step.title}>
                <p className="text-sm font-semibold text-civic-700">Step {index + 1}</p>
                <h3 className="mt-1 font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-civic-600">Board preview</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Issues judges can inspect immediately.</h2>
            </div>
            <Button href="/board" size="sm" variant="secondary">
              View all
            </Button>
          </div>
          <div className="grid gap-4">
            {priorityReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

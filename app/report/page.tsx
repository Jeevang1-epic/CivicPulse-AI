import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { civicCategories } from "@/lib/sample-data";

export default function ReportPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-civic-600">Citizen report</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Report a local issue</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          This first build shows the reporting surface only. Full submit, AI triage, and persistence arrive in the next
          implementation step.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issue details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">What did you notice?</span>
              <textarea
                className="min-h-36 rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-civic-500 focus:ring-4 focus:ring-civic-100"
                disabled
                placeholder="Example: Water leakage on main road is making the road slippery for bikes."
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Approximate location</span>
              <input
                className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-civic-500 focus:ring-4 focus:ring-civic-100"
                disabled
                placeholder="Example: Main road near bus stop"
              />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Category hint</span>
                <select
                  className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition focus:border-civic-500 focus:ring-4 focus:ring-civic-100"
                  disabled
                  defaultValue=""
                >
                  <option value="">Let CivicPulse suggest</option>
                  {civicCategories.map((category) => (
                    <option key={category.id} value={category.label}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Urgency hint</span>
                <select
                  className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition focus:border-civic-500 focus:ring-4 focus:ring-civic-100"
                  disabled
                  defaultValue=""
                >
                  <option value="">Not sure</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>Urgent</option>
                </select>
              </label>
            </div>
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              CivicPulse AI is not an emergency service. For immediate danger, contact local emergency services. This demo
              does not send reports to real authorities.
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button disabled type="button">
                Submit flow coming next
              </Button>
              <Button href="/board" variant="secondary">
                View seeded board
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

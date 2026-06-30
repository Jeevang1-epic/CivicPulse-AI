import { ReportForm } from "@/components/ReportForm";
import { civicCategories } from "@/lib/sample-data";

export default function ReportPage() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-civic-600">Citizen report</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Report a local issue</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Submit a community issue with an approximate location. CivicPulse AI will run deterministic local triage,
          create a report, and add it to the public board for this demo session.
        </p>
        <div className="mt-6 grid gap-3">
          {["Describe the issue", "Add approximate location", "Server triages severity", "Report appears on board"].map(
            (step, index) => (
              <div className="rounded-md border border-slate-200 bg-white p-4" key={step}>
                <p className="text-sm font-semibold text-civic-700">Step {index + 1}</p>
                <p className="mt-1 text-sm text-slate-700">{step}</p>
              </div>
            )
          )}
        </div>
      </div>

      <ReportForm categories={civicCategories} />
    </section>
  );
}

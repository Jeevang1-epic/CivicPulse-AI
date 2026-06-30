"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { ReportCard } from "@/components/ReportCard";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { validateCreateReportPayload } from "@/lib/report-validation";
import type { CategoryDefinition, CivicCategory, CivicReport, CreateReportInput, SafetyLevel } from "@/lib/types";

type ReportFormProps = {
  categories: CategoryDefinition[];
};

type FieldErrors = Partial<Record<keyof CreateReportInput | "form", string>>;

type ReportResponse = {
  report?: CivicReport;
  error?: {
    message: string;
    fields?: FieldErrors;
  };
};

const safetyDisclaimer =
  "CivicPulse AI is not an emergency service. For immediate danger, contact local emergency services or responsible authorities directly.";

const inputClass =
  "rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-civic-500 focus:ring-4 focus:ring-civic-100";

export function ReportForm({ categories }: ReportFormProps) {
  const [description, setDescription] = useState("");
  const [locationText, setLocationText] = useState("");
  const [categoryHint, setCategoryHint] = useState<CivicCategory | "">("");
  const [urgencyHint, setUrgencyHint] = useState<SafetyLevel | "">("");
  const [contactReference, setContactReference] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdReport, setCreatedReport] = useState<CivicReport | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setCreatedReport(null);

    const payload: CreateReportInput = {
      description,
      locationText,
      categoryHint: categoryHint || undefined,
      urgencyHint: urgencyHint || undefined,
      contactReference: contactReference || undefined
    };
    const localValidation = validateCreateReportPayload(payload);

    if (!localValidation.ok) {
      setErrors(localValidation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(localValidation.value)
      });
      const data = (await response.json()) as ReportResponse;

      if (!response.ok || !data.report) {
        setErrors(data.error?.fields ?? { form: data.error?.message ?? "Could not submit the report." });
        return;
      }

      setCreatedReport(data.report);
      setDescription("");
      setLocationText("");
      setCategoryHint("");
      setUrgencyHint("");
      setContactReference("");
    } catch {
      setErrors({ form: "Something went wrong while submitting. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Issue details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">What did you notice?</span>
              <textarea
                className={`${inputClass} min-h-36 resize-y`}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Example: Large electric wire hanging near bus stop after rain."
                value={description}
              />
              {errors.description ? <span className="text-sm text-red-600">{errors.description}</span> : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Approximate location</span>
              <input
                className={inputClass}
                onChange={(event) => setLocationText(event.target.value)}
                placeholder="Example: Bus stop near Market Road"
                value={locationText}
              />
              {errors.locationText ? <span className="text-sm text-red-600">{errors.locationText}</span> : null}
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Category hint</span>
                <select
                  className={inputClass}
                  onChange={(event) => setCategoryHint(event.target.value as CivicCategory | "")}
                  value={categoryHint}
                >
                  <option value="">Let CivicPulse suggest</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.label}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.categoryHint ? <span className="text-sm text-red-600">{errors.categoryHint}</span> : null}
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Urgency hint</span>
                <select
                  className={inputClass}
                  onChange={(event) => setUrgencyHint(event.target.value as SafetyLevel | "")}
                  value={urgencyHint}
                >
                  <option value="">Not sure</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="urgent">Urgent</option>
                  <option value="critical">Critical</option>
                </select>
                {errors.urgencyHint ? <span className="text-sm text-red-600">{errors.urgencyHint}</span> : null}
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Optional contact or reference</span>
              <input
                className={inputClass}
                onChange={(event) => setContactReference(event.target.value)}
                placeholder="Optional: apartment block, shop name, or contact reference for demo follow-up"
                value={contactReference}
              />
              <span className="text-xs leading-5 text-slate-500">
                Optional and not shown on the public board. Avoid sharing sensitive personal information.
              </span>
              {errors.contactReference ? <span className="text-sm text-red-600">{errors.contactReference}</span> : null}
            </label>

            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              {safetyDisclaimer}
            </div>

            {errors.form ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">{errors.form}</div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Triaging report..." : "Submit report"}
              </Button>
              <Button href="/board" variant="secondary">
                View board
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {createdReport ? (
        <Card className="border-civic-100 bg-civic-50/40">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={createdReport.status} />
              <SeverityBadge safetyLevel={createdReport.safetyLevel} severity={createdReport.severity} />
            </div>
            <CardTitle className="mt-3">Report submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-slate-700">{createdReport.citizenReply}</p>
            {createdReport.safetyDisclaimerRequired ? (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900">
                {safetyDisclaimer}
              </div>
            ) : null}
            <div className="mt-5">
              <ReportCard report={createdReport} />
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button href={`/reports/${createdReport.id}`}>Open created report</Button>
              <Button href="/board" variant="secondary">
                View on board
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

import { NextResponse } from "next/server";

import { getReportsRepository } from "@/lib/repositories/reports-repository";
import { validateCreateReportPayload } from "@/lib/report-validation";
import { createTriageService } from "@/lib/services/triage-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const reports = await getReportsRepository().listReports();

  return NextResponse.json({ reports });
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const validation = validateCreateReportPayload(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Please fix the highlighted fields.",
          fields: validation.errors
        }
      },
      { status: 400 }
    );
  }

  const triage = await createTriageService().triageReport(validation.value);
  const report = await getReportsRepository().createReport(validation.value, triage);

  return NextResponse.json({ report }, { status: 201 });
}

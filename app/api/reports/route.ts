import { jsonNoStore } from "@/lib/api-response";
import { getReportsRepository } from "@/lib/repositories/reports-repository";
import { validateCreateReportPayload } from "@/lib/report-validation";
import { createTriageService } from "@/lib/services/gemini-triage-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET() {
  try {
    const reports = await getReportsRepository().listReports();

    return jsonNoStore({ reports });
  } catch {
    return jsonNoStore(
      {
        error: {
          code: "REPORT_LIST_ERROR",
          message: "Reports could not be loaded right now."
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null);
    const validation = validateCreateReportPayload(payload);

    if (!validation.ok) {
      return jsonNoStore(
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

    return jsonNoStore({ report }, { status: 201 });
  } catch {
    return jsonNoStore(
      {
        error: {
          code: "REPORT_CREATE_ERROR",
          message: "The report could not be submitted right now."
        }
      },
      { status: 500 }
    );
  }
}

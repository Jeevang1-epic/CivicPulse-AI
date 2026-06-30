import { jsonNoStore } from "@/lib/api-response";
import { getReportsRepository } from "@/lib/repositories/reports-repository";
import { isReportStatus } from "@/lib/report-validation";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function getStatusFromPayload(payload: unknown) {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return undefined;
  }

  return (payload as { status?: unknown }).status;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const reportId = id.trim();

  if (!reportId) {
    return jsonNoStore(
      {
        error: {
          code: "REPORT_NOT_FOUND",
          message: "That report could not be updated because it was not found."
        }
      },
      { status: 404 }
    );
  }

  const payload = await request.json().catch(() => null);
  const status = getStatusFromPayload(payload);

  if (!isReportStatus(status)) {
    return jsonNoStore(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Choose a valid workflow status."
        }
      },
      { status: 400 }
    );
  }

  try {
    const report = await getReportsRepository().updateReportStatus(reportId, status);

    return jsonNoStore({ report });
  } catch {
    return jsonNoStore(
      {
        error: {
          code: "REPORT_NOT_FOUND",
          message: "That report could not be updated because it was not found."
        }
      },
      { status: 404 }
    );
  }
}

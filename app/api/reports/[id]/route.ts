import { jsonNoStore } from "@/lib/api-response";
import { getReportsRepository } from "@/lib/repositories/reports-repository";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const reportId = id.trim();

  if (!reportId) {
    return jsonNoStore(
      {
        error: {
          code: "REPORT_NOT_FOUND",
          message: "That report was not found."
        }
      },
      { status: 404 }
    );
  }

  const report = await getReportsRepository().getReportById(reportId);

  if (!report) {
    return jsonNoStore(
      {
        error: {
          code: "REPORT_NOT_FOUND",
          message: "That report was not found."
        }
      },
      { status: 404 }
    );
  }

  return jsonNoStore({ report });
}

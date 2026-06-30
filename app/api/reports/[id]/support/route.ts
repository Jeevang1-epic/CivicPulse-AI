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

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const reportId = id.trim();

  if (!reportId) {
    return jsonNoStore(
      {
        error: {
          code: "REPORT_NOT_FOUND",
          message: "That report could not be supported because it was not found."
        }
      },
      { status: 404 }
    );
  }

  try {
    const report = await getReportsRepository().supportReport(reportId);

    return jsonNoStore({ report });
  } catch {
    return jsonNoStore(
      {
        error: {
          code: "REPORT_NOT_FOUND",
          message: "That report could not be supported because it was not found."
        }
      },
      { status: 404 }
    );
  }
}

export const PATCH = POST;

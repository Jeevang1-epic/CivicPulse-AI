import { jsonNoStore } from "@/lib/api-response";
import { getReportsRepository } from "@/lib/repositories/reports-repository";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET() {
  try {
    const summary = await getReportsRepository().getDashboardSummary();

    return jsonNoStore(summary);
  } catch {
    return jsonNoStore(
      {
        error: {
          code: "DASHBOARD_SUMMARY_ERROR",
          message: "Dashboard summary could not be loaded right now."
        }
      },
      { status: 500 }
    );
  }
}

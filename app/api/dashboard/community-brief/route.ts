import { jsonNoStore } from "@/lib/api-response";
import { getFallbackCommunityBrief } from "@/lib/dashboard-intelligence";
import { getReportsRepository } from "@/lib/repositories/reports-repository";
import { createCommunityBriefService } from "@/lib/services/community-brief-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET() {
  try {
    const reports = await getReportsRepository().listReports();
    const brief = await createCommunityBriefService().createBrief(reports);

    return jsonNoStore(brief);
  } catch {
    const reports = await getReportsRepository().listReports().catch(() => []);

    return jsonNoStore(getFallbackCommunityBrief(reports, "fallback_error"));
  }
}

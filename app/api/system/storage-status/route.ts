import { jsonNoStore } from "@/lib/api-response";
import { getReportsStorageStatus } from "@/lib/repositories/reports-repository";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET() {
  return jsonNoStore(getReportsStorageStatus());
}

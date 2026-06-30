import { NextResponse } from "next/server";

import { getReportsRepository } from "@/lib/repositories/reports-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const report = await getReportsRepository().getReportById(id);

  if (!report) {
    return NextResponse.json(
      {
        error: {
          code: "REPORT_NOT_FOUND",
          message: "That report was not found in the local demo repository."
        }
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ report });
}

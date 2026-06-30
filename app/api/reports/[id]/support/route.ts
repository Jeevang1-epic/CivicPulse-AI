import { NextResponse } from "next/server";

import { getReportsRepository } from "@/lib/repositories/reports-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const report = await getReportsRepository().supportReport(id);

    return NextResponse.json({ report });
  } catch {
    return NextResponse.json(
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

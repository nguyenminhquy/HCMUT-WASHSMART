import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getAvailableSlots } from "@/server/slots";

export const runtime = "nodejs";

const querySchema = z.object({
  branchId: z.string().cuid(),
  branchServiceId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export async function GET(request: NextRequest) {
  try {
    const parsed = querySchema.parse({
      branchId: request.nextUrl.searchParams.get("branchId"),
      branchServiceId: request.nextUrl.searchParams.get("branchServiceId"),
      date: request.nextUrl.searchParams.get("date")
    });

    const result = await getAvailableSlots(parsed);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to load slots."
      },
      { status: 400 }
    );
  }
}

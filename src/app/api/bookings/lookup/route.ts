import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { bookingLookupSchema } from "@/lib/validators/booking-lookup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const parsed = bookingLookupSchema.safeParse({
    phone: request.nextUrl.searchParams.get("phone") ?? "",
    bookingCode: request.nextUrl.searchParams.get("bookingCode") ?? ""
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid lookup query."
      },
      { status: 400 }
    );
  }

  const booking = await prisma.booking.findFirst({
    where: {
      phone: parsed.data.phone,
      bookingCode: parsed.data.bookingCode
    },
    select: {
      bookingCode: true,
      status: true,
      startTime: true,
      endTime: true,
      branch: {
        select: {
          name: true,
          address: true
        }
      },
      service: {
        select: {
          name: true,
          durationMinutes: true,
          price: true
        }
      }
    }
  });

  if (!booking) {
    return NextResponse.json(
      {
        error: "Booking not found."
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      booking: {
        bookingCode: booking.bookingCode,
        branch: booking.branch,
        service: booking.service,
        time: {
          start: booking.startTime,
          end: booking.endTime
        },
        status: booking.status
      }
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    }
  );
}

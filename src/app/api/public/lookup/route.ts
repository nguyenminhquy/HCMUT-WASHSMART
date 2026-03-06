import { NextResponse } from "next/server";

import { lookupBooking } from "@/server/bookings";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const booking = await lookupBooking(payload);

    if (!booking) {
      return NextResponse.json({ booking: null });
    }

    return NextResponse.json({
      booking: {
        id: booking.id,
        code: booking.bookingCode,
        customerName: booking.customerName,
        phone: booking.phone,
        status: booking.status,
        startAt: booking.startTime,
        endAt: booking.endTime,
        serviceNameSnapshot: booking.service.name,
        priceSnapshot: booking.service.price,
        branch: {
          name: booking.branch.name,
          address: booking.branch.address
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to lookup booking."
      },
      { status: 400 }
    );
  }
}

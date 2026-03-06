import { NextResponse } from "next/server";

import { createPublicBooking } from "@/server/bookings";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const booking = await createPublicBooking(payload);

    return NextResponse.json({
      booking: {
        id: booking.id,
        code: booking.bookingCode,
        status: booking.status
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create booking."
      },
      { status: 400 }
    );
  }
}

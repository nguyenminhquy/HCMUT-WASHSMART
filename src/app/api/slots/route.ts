import { NextRequest, NextResponse } from "next/server";
import { BookingStatus } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  branchId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

type SlotResult = {
  time: string;
  remaining: number;
};

function timeDateToMinutes(value: Date) {
  return value.getUTCHours() * 60 + value.getUTCMinutes();
}

function minutesToTime(value: number) {
  const hour = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const minute = (value % 60).toString().padStart(2, "0");
  return `${hour}:${minute}`;
}

function overlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

export async function GET(request: NextRequest) {
  try {
    const parsed = querySchema.parse({
      branchId: request.nextUrl.searchParams.get("branchId"),
      date: request.nextUrl.searchParams.get("date")
    });

    const branch = await prisma.branch.findUnique({
      where: { id: parsed.branchId },
      select: {
        id: true,
        openTime: true,
        closeTime: true,
        slotStep: true,
        capacity: true
      }
    });

    if (!branch) {
      return NextResponse.json({ error: "Branch not found." }, { status: 404 });
    }

    const dayStart = new Date(`${parsed.date}T00:00:00.000Z`);
    const dayEnd = new Date(`${parsed.date}T23:59:59.999Z`);

    const bookings = await prisma.booking.findMany({
      where: {
        branchId: parsed.branchId,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED]
        },
        startTime: { lt: dayEnd },
        endTime: { gt: dayStart }
      },
      select: {
        startTime: true,
        endTime: true
      }
    });

    const openMinutes = timeDateToMinutes(branch.openTime);
    const closeMinutes = timeDateToMinutes(branch.closeTime);
    const slotStep = branch.slotStep;

    if (openMinutes >= closeMinutes || slotStep <= 0 || branch.capacity <= 0) {
      return NextResponse.json([] as SlotResult[], {
        headers: { "Cache-Control": "no-store, max-age=0" }
      });
    }

    const slots: SlotResult[] = [];

    for (let current = openMinutes; current + slotStep <= closeMinutes; current += slotStep) {
      const slotStart = new Date(`${parsed.date}T${minutesToTime(current)}:00.000Z`);
      const slotEnd = new Date(slotStart.getTime() + slotStep * 60 * 1000);

      let occupied = 0;
      for (const booking of bookings) {
        if (overlap(booking.startTime, booking.endTime, slotStart, slotEnd)) {
          occupied += 1;
          if (occupied >= branch.capacity) break;
        }
      }

      slots.push({
        time: minutesToTime(current),
        remaining: Math.max(branch.capacity - occupied, 0)
      });
    }

    return NextResponse.json(slots, {
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to load slots."
      },
      { status: 400 }
    );
  }
}

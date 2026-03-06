import { NextResponse } from "next/server";
import { BookingStatus, Prisma } from "@prisma/client";
import { customAlphabet } from "nanoid";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bookingCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

const bodySchema = z.object({
  branchId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(20),
  vehicleType: z.string().trim().min(2).max(40)
});

const ACTIVE_STATUSES: BookingStatus[] = [BookingStatus.PENDING, BookingStatus.CONFIRMED];

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map((part) => Number(part));
  return h * 60 + m;
}

function timeDateToMinutes(value: Date) {
  return value.getUTCHours() * 60 + value.getUTCMinutes();
}

function overlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

function buildSlotTimes(startAt: Date, endAt: Date, step: number) {
  const slots: Date[] = [];
  const stepMs = step * 60 * 1000;
  for (let current = new Date(startAt.getTime()); current < endAt; current = new Date(current.getTime() + stepMs)) {
    slots.push(current);
  }
  return slots;
}

export async function POST(request: Request) {
  try {
    const payload = bodySchema.parse(await request.json());

    const [branch, service] = await Promise.all([
      prisma.branch.findUnique({
        where: { id: payload.branchId },
        select: { id: true, openTime: true, closeTime: true, slotStep: true, capacity: true }
      }),
      prisma.service.findUnique({
        where: { id: payload.serviceId },
        select: { id: true, durationMinutes: true }
      })
    ]);

    if (!branch || !service) {
      return NextResponse.json({ error: "Invalid branch or service." }, { status: 400 });
    }

    const openMinutes = timeDateToMinutes(branch.openTime);
    const closeMinutes = timeDateToMinutes(branch.closeTime);
    const selectedMinutes = timeToMinutes(payload.time);

    if (selectedMinutes < openMinutes || selectedMinutes >= closeMinutes) {
      return NextResponse.json({ error: "Selected time is outside branch opening hours." }, { status: 400 });
    }

    if ((selectedMinutes - openMinutes) % branch.slotStep !== 0) {
      return NextResponse.json({ error: "Selected time does not match slot step." }, { status: 400 });
    }

    const startTime = new Date(`${payload.date}T${payload.time}:00.000Z`);
    const endTime = new Date(startTime.getTime() + service.durationMinutes * 60 * 1000);
    const closeDateTime = new Date(`${payload.date}T00:00:00.000Z`);
    closeDateTime.setUTCMinutes(closeMinutes);

    if (endTime > closeDateTime) {
      return NextResponse.json({ error: "Service exceeds branch close time." }, { status: 400 });
    }

    const existing = await prisma.booking.findMany({
      where: {
        branchId: payload.branchId,
        status: { in: ACTIVE_STATUSES },
        startTime: { lt: endTime },
        endTime: { gt: startTime }
      },
      select: {
        laneNumber: true,
        startTime: true,
        endTime: true
      }
    });

    let chosenLane = 0;
    for (let lane = 1; lane <= branch.capacity; lane += 1) {
      const laneConflict = existing.some((booking) => {
        if (booking.laneNumber !== lane) return false;
        return overlap(booking.startTime, booking.endTime, startTime, endTime);
      });
      if (!laneConflict) {
        chosenLane = lane;
        break;
      }
    }

    if (chosenLane === 0) {
      return NextResponse.json({ error: "No capacity for this slot." }, { status: 409 });
    }

    const slotRows = buildSlotTimes(startTime, endTime, branch.slotStep);
    const booking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          bookingCode: bookingCode(),
          customerName: payload.customerName,
          phone: payload.phone,
          vehicleType: payload.vehicleType,
          branchId: payload.branchId,
          serviceId: payload.serviceId,
          startTime,
          endTime,
          slotDate: new Date(`${payload.date}T00:00:00.000Z`),
          laneNumber: chosenLane,
          status: BookingStatus.PENDING
        }
      });

      if (slotRows.length > 0) {
        await tx.bookingSlot.createMany({
          data: slotRows.map((slotTime) => ({
            bookingId: created.id,
            branchId: payload.branchId,
            slotTime,
            slotDate: new Date(`${payload.date}T00:00:00.000Z`),
            laneNumber: chosenLane
          }))
        });
      }

      return created;
    });

    return NextResponse.json({
      booking: {
        id: booking.id,
        bookingCode: booking.bookingCode,
        status: booking.status,
        laneNumber: booking.laneNumber,
        startTime: booking.startTime
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Selected slot has just been taken. Please refresh slots." }, { status: 409 });
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create booking."
      },
      { status: 400 }
    );
  }
}

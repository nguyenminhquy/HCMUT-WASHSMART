import { customAlphabet } from "nanoid";
import { BookingStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { bookingLookupSchema, createBookingSchema } from "@/lib/validators/booking";
import { getAvailableSlots } from "@/server/slots";

const codeGenerator = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);
const ACTIVE_STATUSES: BookingStatus[] = [BookingStatus.PENDING, BookingStatus.CONFIRMED];

function overlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

function slotDateFromIso(iso: string) {
  const date = new Date(iso);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function createPublicBooking(rawInput: unknown) {
  const input = createBookingSchema.parse(rawInput);

  const selectedStartAt = new Date(input.startAt);
  if (Number.isNaN(selectedStartAt.getTime())) {
    throw new Error("Invalid selected slot.");
  }
  if (selectedStartAt <= new Date()) {
    throw new Error("Please choose a future slot.");
  }

  const date = selectedStartAt.toISOString().slice(0, 10);
  const slotsResult = await getAvailableSlots({
    branchId: input.branchId,
    branchServiceId: input.branchServiceId,
    date
  });

  const matched = slotsResult.slots.find((slot) => slot.startAt === input.startAt);
  if (!matched?.available) {
    throw new Error("Selected slot is no longer available.");
  }

  const [branch, service] = await Promise.all([
    prisma.branch.findUnique({
      where: { id: input.branchId },
      select: { id: true, capacity: true }
    }),
    prisma.service.findUnique({
      where: { id: input.branchServiceId },
      select: { id: true, durationMinutes: true }
    })
  ]);

  if (!branch || !service) {
    throw new Error("Invalid branch/service configuration.");
  }

  const endTime = new Date(selectedStartAt.getTime() + service.durationMinutes * 60 * 1000);

  const existing = await prisma.booking.findMany({
    where: {
      branchId: input.branchId,
      status: { in: ACTIVE_STATUSES },
      startTime: { lt: endTime },
      endTime: { gt: selectedStartAt }
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
      return overlap(booking.startTime, booking.endTime, selectedStartAt, endTime);
    });
    if (!laneConflict) {
      chosenLane = lane;
      break;
    }
  }

  if (chosenLane === 0) {
    throw new Error("No capacity for this slot.");
  }

  return prisma.booking.create({
    data: {
      bookingCode: codeGenerator(),
      customerName: input.customerName,
      phone: input.phone,
      vehicleType: input.carModel?.trim() || "Xe hoi",
      branchId: input.branchId,
      serviceId: input.branchServiceId,
      startTime: selectedStartAt,
      endTime,
      slotDate: slotDateFromIso(input.startAt),
      laneNumber: chosenLane,
      status: BookingStatus.PENDING
    },
    include: {
      branch: { select: { name: true, address: true } },
      service: { select: { name: true, price: true, durationMinutes: true } }
    }
  });
}

export async function lookupBooking(rawInput: unknown) {
  const input = bookingLookupSchema.parse(rawInput);
  return prisma.booking.findFirst({
    where: {
      phone: input.phone,
      bookingCode: input.code
    },
    include: {
      branch: {
        select: { name: true, address: true }
      },
      service: {
        select: { name: true, price: true, durationMinutes: true }
      }
    }
  });
}

export async function listAdminBookings(limit = 100) {
  return prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      branch: true,
      service: true
    }
  });
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { status }
  });
}

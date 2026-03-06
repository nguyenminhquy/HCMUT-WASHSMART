import { BookingStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const ACTIVE_STATUSES: BookingStatus[] = [BookingStatus.PENDING, BookingStatus.CONFIRMED];

type GetAvailableSlotsInput = {
  branchId: string;
  branchServiceId: string;
  date: string;
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

export async function getAvailableSlots(input: GetAvailableSlotsInput) {
  const [branch, service] = await Promise.all([
    prisma.branch.findUnique({
      where: { id: input.branchId },
      select: { id: true, name: true, openTime: true, closeTime: true, slotStep: true, capacity: true }
    }),
    prisma.service.findUnique({
      where: { id: input.branchServiceId },
      select: { id: true, name: true, price: true, durationMinutes: true }
    })
  ]);

  if (!branch || !service) {
    return { slots: [], branchService: null as null };
  }

  const dayStart = new Date(`${input.date}T00:00:00.000Z`);
  const dayEnd = new Date(`${input.date}T23:59:59.999Z`);

  const existing = await prisma.booking.findMany({
    where: {
      branchId: input.branchId,
      status: { in: ACTIVE_STATUSES },
      startTime: { lt: dayEnd },
      endTime: { gt: dayStart }
    },
    select: {
      laneNumber: true,
      startTime: true,
      endTime: true
    }
  });

  const openMinutes = timeDateToMinutes(branch.openTime);
  const closeMinutes = timeDateToMinutes(branch.closeTime);
  const duration = service.durationMinutes;
  const step = branch.slotStep;

  const slots: Array<{
    startAt: string;
    endAt: string;
    label: string;
    remainingCapacity: number;
    available: boolean;
  }> = [];

  for (let current = openMinutes; current + duration <= closeMinutes; current += step) {
    const startAt = new Date(`${input.date}T${minutesToTime(current)}:00.000Z`);
    const endAt = new Date(startAt.getTime() + duration * 60 * 1000);

    const occupiedLanes = new Set<number>();
    for (const booking of existing) {
      if (!overlap(booking.startTime, booking.endTime, startAt, endAt)) continue;
      occupiedLanes.add(booking.laneNumber);
      if (occupiedLanes.size >= branch.capacity) break;
    }

    const remainingCapacity = Math.max(branch.capacity - occupiedLanes.size, 0);
    slots.push({
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      label: minutesToTime(current),
      remainingCapacity,
      available: remainingCapacity > 0
    });
  }

  return {
    slots,
    branchService: {
      id: service.id,
      branchId: branch.id,
      serviceId: service.id,
      serviceName: service.name,
      price: service.price,
      durationMin: service.durationMinutes,
      timezone: "UTC",
      dateLabel: input.date
    }
  };
}

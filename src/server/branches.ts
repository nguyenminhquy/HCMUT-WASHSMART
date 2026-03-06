import { z } from "zod";

import { prisma } from "@/lib/prisma";

const createBranchSchema = z.object({
  name: z.string().trim().min(2).max(120),
  address: z.string().trim().min(6).max(255),
  openTime: z.union([z.string().regex(/^\d{2}:\d{2}$/), z.date()]),
  closeTime: z.union([z.string().regex(/^\d{2}:\d{2}$/), z.date()]),
  slotStep: z.number().int().min(5).max(120),
  capacity: z.number().int().min(1).max(30)
});

function parseTimeValue(value: string | Date) {
  if (value instanceof Date) return value;
  return new Date(`1970-01-01T${value}:00.000Z`);
}

export async function listActiveBranches() {
  return prisma.branch.findMany({
    orderBy: { name: "asc" }
  });
}

export async function listAllBranches() {
  return prisma.branch.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function createBranch(rawInput: unknown) {
  const input = createBranchSchema.parse(rawInput);
  return prisma.branch.create({
    data: {
      name: input.name,
      address: input.address,
      openTime: parseTimeValue(input.openTime),
      closeTime: parseTimeValue(input.closeTime),
      slotStep: input.slotStep,
      capacity: input.capacity
    }
  });
}

export async function toggleBranchActive(id: string, current: boolean) {
  void current;
  return prisma.branch.findUnique({ where: { id } });
}

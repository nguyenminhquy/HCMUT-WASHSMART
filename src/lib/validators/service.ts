import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().trim().max(300).optional(),
  basePrice: z.number().int().min(10000),
  durationMin: z.number().int().min(15).max(480)
});

export const upsertBranchServiceSchema = z.object({
  branchId: z.string().cuid(),
  serviceId: z.string().cuid(),
  price: z.number().int().min(10000),
  durationMin: z.number().int().min(15).max(480)
});

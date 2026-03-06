import { z } from "zod";

export const createBranchSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  address: z.string().trim().min(6).max(255),
  phone: z.string().trim().min(8).max(20),
  timezone: z.string().trim().min(3).default("Asia/Ho_Chi_Minh"),
  opensAt: z.string().regex(/^\d{2}:\d{2}$/),
  closesAt: z.string().regex(/^\d{2}:\d{2}$/),
  slotIntervalMin: z.number().int().min(15).max(120),
  capacityPerSlot: z.number().int().min(1).max(20)
});

export const branchIdSchema = z.object({
  id: z.string().cuid()
});

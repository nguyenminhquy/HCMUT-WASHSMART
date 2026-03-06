import { z } from "zod";

export const bookingLookupSchema = z.object({
  phone: z.string().trim().min(9).max(20),
  code: z.string().trim().min(4).max(8).transform((value) => value.toUpperCase())
});

export const createBookingSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(9).max(20),
  carPlate: z.string().trim().max(30).optional(),
  carModel: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(300).optional(),
  branchId: z.string().cuid(),
  branchServiceId: z.string().cuid(),
  startAt: z.string().datetime()
});

export const bookingStatusSchema = z.object({
  bookingId: z.string().cuid(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "DONE", "NO_SHOW"])
});

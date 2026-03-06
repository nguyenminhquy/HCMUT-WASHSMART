import { z } from "zod";

export const bookingLookupSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(6, "Phone is required.")
    .max(20, "Phone is too long.")
    .regex(/^[+\d][\d\s-]{4,19}$/, "Invalid phone format."),
  bookingCode: z
    .string()
    .trim()
    .min(4, "Booking code is required.")
    .max(12, "Booking code is too long.")
    .transform((value) => value.toUpperCase())
});

export type BookingLookupInput = z.input<typeof bookingLookupSchema>;
export type BookingLookupPayload = z.output<typeof bookingLookupSchema>;

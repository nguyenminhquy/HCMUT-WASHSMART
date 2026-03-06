import { BookingWizard } from "@/components/booking/booking-wizard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const [branches, services] = await Promise.all([
    prisma.branch.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        address: true,
        slotStep: true,
        capacity: true
      }
    }),
    prisma.service.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        durationMinutes: true,
        price: true
      }
    })
  ]);

  return <BookingWizard branches={branches} services={services} />;
}

import { PrismaClient } from "@prisma/client";

import { VINCOM_BRANCHES } from "../src/lib/vincom-branches";

const prisma = new PrismaClient();

function timeUtc(time: string) {
  return new Date(`1970-01-01T${time}:00.000Z`);
}

async function upsertBranchByName(input: {
  name: string;
  address: string;
  openTime: string;
  closeTime: string;
  slotStep: number;
  capacity: number;
}) {
  const existing = await prisma.branch.findFirst({
    where: { name: input.name },
    select: { id: true }
  });

  if (existing) {
    return prisma.branch.update({
      where: { id: existing.id },
      data: {
        address: input.address,
        openTime: timeUtc(input.openTime),
        closeTime: timeUtc(input.closeTime),
        slotStep: input.slotStep,
        capacity: input.capacity
      }
    });
  }

  return prisma.branch.create({
    data: {
      name: input.name,
      address: input.address,
      openTime: timeUtc(input.openTime),
      closeTime: timeUtc(input.closeTime),
      slotStep: input.slotStep,
      capacity: input.capacity
    }
  });
}

async function main() {
  const vincomNames = VINCOM_BRANCHES.map((branch) => branch.name);

  // Keep data clean: remove non-Vincom branches that are not referenced by any booking.
  await prisma.branch.deleteMany({
    where: {
      name: { notIn: vincomNames },
      bookings: { none: {} }
    }
  });

  const services = [
    {
      name: "Basic Wash",
      description: "Exterior rinse, foam wash, dry, and tire shine.",
      durationMinutes: 25,
      price: 18
    },
    {
      name: "Interior Cleaning",
      description: "Vacuum, dashboard wipe, window cleaning, and floor mat refresh.",
      durationMinutes: 45,
      price: 35
    },
    {
      name: "Premium Detailing",
      description: "Deep interior + exterior detailing, wax coat, and trim finishing.",
      durationMinutes: 120,
      price: 120
    }
  ] as const;

  for (const branch of VINCOM_BRANCHES) {
    await upsertBranchByName({
      name: branch.name,
      address: `${branch.address} (${branch.city})`,
      openTime: branch.openTime,
      closeTime: branch.closeTime,
      slotStep: branch.slotStep,
      capacity: branch.capacity
    });
  }

  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: {
        description: service.description,
        durationMinutes: service.durationMinutes,
        price: service.price
      },
      create: {
        name: service.name,
        description: service.description,
        durationMinutes: service.durationMinutes,
        price: service.price
      }
    });
  }

  console.log("Seed complete.");
  console.log(`Seeded branches: ${VINCOM_BRANCHES.length}`);
  console.log(`Seeded services: ${services.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

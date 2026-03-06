import { createServiceSchema, upsertBranchServiceSchema } from "@/lib/validators/service";
import { prisma } from "@/lib/prisma";

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function listActiveServices() {
  const services = await prisma.service.findMany({
    orderBy: { name: "asc" }
  });

  return services.map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description,
    slug: toSlug(service.name),
    basePrice: service.price,
    durationMin: service.durationMinutes,
    isActive: true
  }));
}

export async function listAllServices() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" }
  });

  return services.map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description,
    slug: toSlug(service.name),
    basePrice: service.price,
    durationMin: service.durationMinutes,
    isActive: true
  }));
}

export async function listBranchServices(branchId?: string) {
  const [branches, services] = await Promise.all([
    prisma.branch.findMany({
      where: branchId ? { id: branchId } : undefined,
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    prisma.service.findMany({
      select: { id: true, name: true, price: true, durationMinutes: true },
      orderBy: { name: "asc" }
    })
  ]);

  return branches.flatMap((branch) =>
    services.map((service) => ({
      id: `${branch.id}:${service.id}`,
      branchId: branch.id,
      serviceId: service.id,
      price: service.price,
      durationMin: service.durationMinutes,
      isActive: true,
      branch: { name: branch.name },
      service: { name: service.name }
    }))
  );
}

export async function createService(rawInput: unknown) {
  const input = createServiceSchema.parse(rawInput);
  return prisma.service.create({
    data: {
      name: input.name,
      description: input.description,
      price: input.basePrice,
      durationMinutes: input.durationMin
    }
  });
}

export async function toggleServiceActive(id: string, current: boolean) {
  void current;
  return prisma.service.findUnique({ where: { id } });
}

export async function upsertBranchService(rawInput: unknown) {
  const input = upsertBranchServiceSchema.parse(rawInput);
  const updatedService = await prisma.service.update({
    where: { id: input.serviceId },
    data: {
      price: input.price,
      durationMinutes: input.durationMin
    }
  });

  const branch = await prisma.branch.findUnique({
    where: { id: input.branchId },
    select: { id: true, name: true }
  });

  return {
    id: `${input.branchId}:${input.serviceId}`,
    branchId: input.branchId,
    serviceId: input.serviceId,
    price: updatedService.price,
    durationMin: updatedService.durationMinutes,
    isActive: true,
    branch: { name: branch?.name ?? "Unknown branch" },
    service: { name: updatedService.name }
  };
}

export async function toggleBranchServiceActive(id: string, current: boolean) {
  void current;
  const [, serviceId] = id.split(":");
  if (!serviceId) return null;
  return prisma.service.findUnique({ where: { id: serviceId } });
}

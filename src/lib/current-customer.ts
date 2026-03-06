import { prisma } from "@/lib/prisma";

type SessionUser = {
  email?: string | null;
  isAdmin?: boolean;
};

export async function resolveCustomerPhone(user?: SessionUser | null) {
  if (!user || user.isAdmin || !user.email) {
    return null;
  }

  const identifier = user.email.trim();
  if (!identifier) {
    return null;
  }

  const customer = await prisma.customerUser.findFirst({
    where: {
      OR: [{ email: identifier.toLowerCase() }, { phone: identifier }]
    },
    select: {
      phone: true,
      name: true
    }
  });

  return customer ?? null;
}

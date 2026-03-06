import { WashRegistrationFormVi } from "@/components/site/wash-registration-form-vi";
import { prisma } from "@/lib/prisma";
import { VINCOM_BRANCHES } from "@/lib/vincom-branches";

export const dynamic = "force-dynamic";

type DangKyRuaXePageProps = {
  searchParams?: {
    branchId?: string | string[];
  };
};

export default async function DangKyRuaXePage({ searchParams }: DangKyRuaXePageProps) {
  const vincomBranchNames = VINCOM_BRANCHES.map((branch) => branch.name);

  const [branches, services] = await Promise.all([
    prisma.branch
      .findMany({
        where: {
          name: { in: vincomBranchNames }
        },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          address: true
        }
      })
      .catch(() => []),
    prisma.service
      .findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          durationMinutes: true,
          price: true
        }
      })
      .catch(() => [])
  ]);

  const rawBranchId = searchParams?.branchId;
  const selectedBranchId = typeof rawBranchId === "string" ? rawBranchId : undefined;
  const initialBranchId = selectedBranchId && branches.some((branch) => branch.id === selectedBranchId) ? selectedBranchId : undefined;

  return <WashRegistrationFormVi branches={branches} services={services} initialBranchId={initialBranchId} />;
}

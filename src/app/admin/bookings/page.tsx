import { BookingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { BookingsTable } from "@/components/admin/bookings-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusValues = ["PENDING", "CONFIRMED", "CANCELLED", "DONE", "NO_SHOW"] as const;

const updateStatusSchema = z.object({
  bookingId: z.string().cuid(),
  status: z.enum(statusValues)
});

function todayIso() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateRange(date: string) {
  return {
    gte: new Date(`${date}T00:00:00.000Z`),
    lte: new Date(`${date}T23:59:59.999Z`)
  };
}

type BookingsPageProps = {
  searchParams?: {
    date?: string;
    status?: string;
    branchId?: string;
    q?: string;
  };
};

export default async function AdminBookingsPage({ searchParams }: BookingsPageProps) {
  const filterDate = searchParams?.date ?? todayIso();
  const filterStatus = searchParams?.status ?? "ALL";
  const filterBranchId = searchParams?.branchId ?? "ALL";
  const queryText = searchParams?.q?.trim() ?? "";

  const where = {
    slotDate: dateRange(filterDate),
    ...(filterStatus !== "ALL" ? { status: filterStatus as BookingStatus } : {}),
    ...(filterBranchId !== "ALL" ? { branchId: filterBranchId } : {}),
    ...(queryText
      ? {
          OR: [
            { bookingCode: { contains: queryText, mode: "insensitive" as const } },
            { customerName: { contains: queryText, mode: "insensitive" as const } },
            { phone: { contains: queryText, mode: "insensitive" as const } }
          ]
        }
      : {})
  };

  const [bookings, branches] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        branch: { select: { name: true } },
        service: { select: { name: true, price: true } }
      },
      orderBy: [{ startTime: "asc" }, { createdAt: "desc" }]
    }),
    prisma.branch.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    })
  ]);

  async function updateStatusAction(formData: FormData) {
    "use server";
    const parsed = updateStatusSchema.parse({
      bookingId: formData.get("bookingId"),
      status: formData.get("status")
    });

    await prisma.booking.update({
      where: { id: parsed.bookingId },
      data: { status: parsed.status as BookingStatus }
    });

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[180px,180px,1fr,1fr,auto]">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" defaultValue={filterDate} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={filterStatus}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="ALL">All</option>
                {statusValues.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branchId">Branch</Label>
              <select
                id="branchId"
                name="branchId"
                defaultValue={filterBranchId}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="ALL">All branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="q">Search</Label>
              <Input id="q" name="q" defaultValue={queryText} placeholder="Code, customer, phone..." />
            </div>

            <div className="self-end">
              <Button type="submit" className="w-full md:w-auto">
                Apply filters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking list ({bookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingsTable bookings={bookings} updateStatusAction={updateStatusAction} />
        </CardContent>
      </Card>
    </div>
  );
}

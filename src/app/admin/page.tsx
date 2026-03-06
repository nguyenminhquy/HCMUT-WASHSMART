import Link from "next/link";
import { BookingStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function todayIso() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dayRange(date: string) {
  return {
    gte: new Date(`${date}T00:00:00.000Z`),
    lte: new Date(`${date}T23:59:59.999Z`)
  };
}

function statusBadge(status: BookingStatus): "default" | "secondary" | "destructive" {
  if (status === "CONFIRMED" || status === "DONE") return "default";
  if (status === "CANCELLED" || status === "NO_SHOW") return "destructive";
  return "secondary";
}

export default async function AdminPage() {
  const today = todayIso();

  const [bookingCount, branchCount, serviceCount, todayCount, statusStats, recentBookings] = await Promise.all([
    prisma.booking.count(),
    prisma.branch.count(),
    prisma.service.count(),
    prisma.booking.count({ where: { slotDate: dayRange(today) } }),
    prisma.booking.groupBy({
      by: ["status"],
      _count: { _all: true }
    }),
    prisma.booking.findMany({
      where: { slotDate: dayRange(today) },
      orderBy: { startTime: "asc" },
      take: 8,
      select: {
        id: true,
        bookingCode: true,
        customerName: true,
        status: true,
        startTime: true,
        branch: { select: { name: true } },
        service: { select: { name: true } }
      }
    })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview and operational summary for car wash bookings.</p>
        </div>
        <Link href="/admin/bookings" className="text-sm text-primary hover:underline">
          Open booking management
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bookingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{todayCount}</p>
            <p className="text-xs text-muted-foreground">{today}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Branches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{branchCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{serviceCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr,2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Status breakdown</CardTitle>
            <CardDescription>All-time booking statuses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {statusStats.length === 0 ? <p className="text-sm text-muted-foreground">No bookings yet.</p> : null}
            {statusStats.map((stat) => (
              <div key={stat.status} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                <Badge variant={statusBadge(stat.status)}>{stat.status}</Badge>
                <span className="font-semibold">{stat._count._all}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today timeline</CardTitle>
            <CardDescription>Next bookings for {today}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentBookings.length === 0 ? <p className="text-sm text-muted-foreground">No bookings today.</p> : null}
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex flex-wrap items-center justify-between gap-3 rounded border p-3 text-sm">
                <div>
                  <p className="font-medium">
                    {booking.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                    {booking.customerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {booking.bookingCode} | {booking.branch.name} | {booking.service.name}
                  </p>
                </div>
                <Badge variant={statusBadge(booking.status)}>{booking.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

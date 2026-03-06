import Link from "next/link";
import { CalendarCheck2, CreditCard } from "lucide-react";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { resolveCustomerPhone } from "@/lib/current-customer";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function money(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

function dateTime(value: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(value);
}

const statusLabel = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  DONE: "Hoàn thành",
  NO_SHOW: "Không đến"
} as const;

const statusVariant = {
  PENDING: "secondary",
  CONFIRMED: "default",
  CANCELLED: "destructive",
  DONE: "default",
  NO_SHOW: "destructive"
} as const;

export default async function LichHenCuaToiPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle>Bạn chưa đăng nhập</CardTitle>
          <CardDescription>Đăng nhập để xem toàn bộ lịch hẹn rửa xe của bạn.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dang-nhap" className={cn(buttonVariants({ variant: "default" }))}>
            Đăng nhập ngay
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (user.isAdmin) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle>Tài khoản quản trị</CardTitle>
          <CardDescription>Vui lòng vào trang quản trị để xem lịch hẹn toàn hệ thống.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/bookings" className={cn(buttonVariants({ variant: "default" }))}>
            Đến trang Bookings
          </Link>
        </CardContent>
      </Card>
    );
  }

  const customer = await resolveCustomerPhone(user);
  if (!customer) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle>Không tìm thấy tài khoản khách hàng</CardTitle>
          <CardDescription>Vui lòng đăng nhập lại bằng tài khoản đã dùng để đăng ký.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const bookings = await prisma.booking.findMany({
    where: { phone: customer.phone },
    orderBy: { startTime: "desc" },
    include: {
      branch: {
        select: {
          name: true
        }
      },
      service: {
        select: {
          name: true,
          price: true
        }
      }
    }
  });

  return (
    <div className="space-y-4">
      <Card className="glass-shell border-none">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 font-[var(--font-space-grotesk)] text-2xl">
            <CalendarCheck2 className="h-5 w-5 text-primary" />
            Lịch hẹn của tôi
          </CardTitle>
          <CardDescription>
            Xin chào {customer.name}. Dưới đây là danh sách lịch hẹn rửa xe của bạn, kèm chi phí và thao tác thanh toán.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="shine-border border-white/70 bg-white/92 shadow-lg">
        <CardContent className="pt-6">
          {bookings.length === 0 ? (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">Bạn chưa có lịch hẹn nào.</p>
              <Link href="/dang-ky-rua-xe" className={cn(buttonVariants({ variant: "default" }))}>
                Đăng ký lịch rửa xe
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã lịch hẹn</TableHead>
                  <TableHead>Chi nhánh</TableHead>
                  <TableHead>Dịch vụ</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thanh toán</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => {
                  const canPay = booking.status === "PENDING" || booking.status === "CONFIRMED";
                  const paymentHref = `/thanh-toan?bookingId=${booking.id}`;

                  return (
                    <TableRow key={booking.id}>
                      <TableCell className="font-semibold">{booking.bookingCode}</TableCell>
                      <TableCell>{booking.branch.name}</TableCell>
                      <TableCell>{booking.service.name}</TableCell>
                      <TableCell>{dateTime(booking.startTime)}</TableCell>
                      <TableCell>{money(booking.service.price)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[booking.status]}>{statusLabel[booking.status]}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {canPay ? (
                          <Link href={paymentHref} className={cn(buttonVariants({ variant: "default", size: "sm" }), "inline-flex gap-1.5")}>
                            <CreditCard className="h-4 w-4" />
                            Thanh toán
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">Không khả dụng</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, CreditCard, Landmark, Lock, QrCode, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Method = "card" | "bank" | "momo";

type PaymentBookingSummary = {
  id: string;
  bookingCode: string;
  branchName: string;
  serviceName: string;
  amount: number;
  startTime: string;
  status: string;
};

type PaymentFormViProps = {
  booking?: PaymentBookingSummary | null;
};

const methods: Array<{
  id: Method;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  { id: "card", name: "Thẻ", icon: CreditCard, description: "Visa / Master / JCB" },
  { id: "bank", name: "Chuyển khoản", icon: Landmark, description: "Internet Banking" },
  { id: "momo", name: "Ví điện tử", icon: QrCode, description: "MoMo / ZaloPay" }
];

const sampleOrder = [
  { name: "Gói Premium Detailing", amount: 420000 },
  { name: "Phụ phí chăm sóc nội thất", amount: 60000 },
  { name: "Ưu đãi thành viên", amount: -25000 }
];

function money(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export function PaymentFormVi({ booking }: PaymentFormViProps) {
  const [method, setMethod] = useState<Method>("card");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const orderItems = useMemo(() => {
    if (!booking) {
      return sampleOrder;
    }
    return [
      {
        name: `Lịch #${booking.bookingCode} - ${booking.serviceName}`,
        amount: booking.amount
      }
    ];
  }, [booking]);

  const total = useMemo(() => orderItems.reduce((sum, item) => sum + item.amount, 0), [orderItems]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDone(false);

    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1100));
      setDone(true);
    });
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1.1fr,0.9fr]">
      <Card className="glass-shell border-none">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <span className="neon-pill">
              <Lock className="h-3.5 w-3.5" />
              Thanh toán bảo mật
            </span>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">Mã hóa SSL 256-bit</span>
          </div>

          <CardTitle className="pt-2 font-[var(--font-space-grotesk)] text-2xl">Thanh toán dịch vụ rửa xe</CardTitle>
          <CardDescription>
            {booking
              ? `Bạn đang thanh toán cho lịch hẹn ${booking.bookingCode} tại ${booking.branchName}.`
              : "Chọn phương thức phù hợp, xác nhận nhanh và nhận lịch hẹn ngay sau khi hoàn tất."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-2 sm:grid-cols-3">
              {methods.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMethod(item.id)}
                    className={cn(
                      "rounded-lg border bg-white px-3 py-3 text-left transition",
                      method === item.id && "border-primary bg-primary/10 shadow-sm"
                    )}
                  >
                    <p className="inline-flex items-center gap-2 font-medium text-slate-800">
                      <Icon className="h-4 w-4" /> {item.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                  </button>
                );
              })}
            </div>

            {method === "card" ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="cardName">Tên chủ thẻ</Label>
                  <Input id="cardName" className="h-11" placeholder="NGUYEN VAN A" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Số thẻ</Label>
                  <Input id="cardNumber" className="h-11" placeholder="1234 5678 9012 3456" required />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="exp">Ngày hết hạn</Label>
                    <Input id="exp" className="h-11" placeholder="MM/YY" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" className="h-11" placeholder="123" required />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white/85 p-4 text-sm text-muted-foreground">
                {method === "bank"
                  ? "Bạn sẽ nhận thông tin chuyển khoản ngay sau khi xác nhận thanh toán."
                  : "Bạn sẽ được chuyển đến cổng ví điện tử để xác nhận giao dịch."}
              </div>
            )}

            <div className="rounded-lg border border-emerald-200 bg-emerald-50/90 p-3 text-sm text-emerald-800">
              <p className="inline-flex items-center gap-2 font-medium">
                <ShieldCheck className="h-4 w-4" />
                Giao dịch an toàn và có thể kiểm tra trạng thái ngay trong mục tra cứu lịch hẹn.
              </p>
            </div>

            <Button type="submit" className="h-11 w-full sm:w-auto" disabled={isPending}>
              {isPending ? "Đang xử lý thanh toán..." : "Xác nhận thanh toán"}
            </Button>

            {done ? (
              <p className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Thanh toán thành công. Lịch hẹn của bạn đã được xác nhận.
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <Card className="shine-border border-white/70 bg-white/92 shadow-lg">
        <CardHeader>
          <CardTitle>Chi tiết đơn hàng</CardTitle>
          <CardDescription>{booking ? "Thông tin từ lịch hẹn bạn đã chọn." : "Thông tin demo giao diện thanh toán."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {booking ? (
            <div className="rounded-lg border border-slate-200 bg-white p-3 text-slate-700">
              <p>
                <span className="text-muted-foreground">Mã lịch:</span> {booking.bookingCode}
              </p>
              <p>
                <span className="text-muted-foreground">Chi nhánh:</span> {booking.branchName}
              </p>
              <p>
                <span className="text-muted-foreground">Thời gian:</span> {dateTime(booking.startTime)}
              </p>
              <p>
                <span className="text-muted-foreground">Trạng thái:</span> {booking.status}
              </p>
            </div>
          ) : null}

          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
            {orderItems.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-2">
                <span className="text-slate-700">{item.name}</span>
                <span className={cn("font-medium", item.amount < 0 && "text-emerald-600")}>{`${item.amount < 0 ? "-" : ""}${money(Math.abs(item.amount))}đ`}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t pt-3 text-base font-semibold">
            <span>Tổng thanh toán</span>
            <span>{money(total)}đ</span>
          </div>

          <div className="rounded-lg border border-sky-100 bg-sky-50/80 p-3 text-xs text-sky-800">
            Sau khi thanh toán thành công, hệ thống sẽ gửi xác nhận kèm mã lịch hẹn qua số điện thoại đã đăng ký.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

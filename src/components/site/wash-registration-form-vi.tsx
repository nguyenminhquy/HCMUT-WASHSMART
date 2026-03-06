"use client";

import { useMemo, useState, useTransition } from "react";
import { CalendarDays, Car, CheckCircle2, Clock3, Loader2, MapPin, RefreshCw, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type BranchOption = {
  id: string;
  name: string;
  address: string;
};

type ServiceOption = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  description: string | null;
};

type SlotOption = {
  time: string;
  remaining: number;
};

type WashRegistrationFormViProps = {
  branches: BranchOption[];
  services: ServiceOption[];
  initialBranchId?: string;
};

const steps = ["Chọn chi nhánh", "Chọn dịch vụ", "Chọn ngày giờ", "Điền thông tin", "Xác nhận"];

function todayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function money(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function WashRegistrationFormVi({ branches, services, initialBranchId }: WashRegistrationFormViProps) {
  const minDate = useMemo(() => todayIso(), []);
  const [branchId, setBranchId] = useState(() => {
    if (initialBranchId && branches.some((branch) => branch.id === initialBranchId)) {
      return initialBranchId;
    }
    return branches[0]?.id ?? "";
  });
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(minDate);
  const [time, setTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isLoadingSlots, startLoadingSlots] = useTransition();
  const [isSubmitting, startSubmitting] = useTransition();

  const selectedBranch = useMemo(() => branches.find((item) => item.id === branchId) ?? null, [branches, branchId]);
  const selectedService = useMemo(() => services.find((item) => item.id === serviceId) ?? null, [services, serviceId]);

  const loadSlots = () => {
    if (!branchId || !date) return;

    setError("");
    setSuccess("");

    startLoadingSlots(async () => {
      try {
        const query = new URLSearchParams({ branchId, date });
        const response = await fetch(`/api/slots?${query.toString()}`);
        const data = (await response.json()) as SlotOption[] | { error?: string };

        if (!response.ok || !Array.isArray(data)) {
          throw new Error(!Array.isArray(data) ? data.error ?? "Không thể tải khung giờ." : "Không thể tải khung giờ.");
        }

        setSlots(data);
        setTime("");
      } catch (slotError) {
        setSlots([]);
        setError(slotError instanceof Error ? slotError.message : "Không thể tải khung giờ.");
      }
    });
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!branchId || !serviceId) {
      setError("Vui lòng chọn chi nhánh và dịch vụ.");
      return;
    }

    if (!time) {
      setError("Vui lòng chọn khung giờ rửa xe.");
      return;
    }

    startSubmitting(async () => {
      try {
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            branchId,
            serviceId,
            date,
            time,
            customerName,
            phone,
            vehicleType
          })
        });

        const data = (await response.json()) as { booking?: { bookingCode: string }; error?: string };
        if (!response.ok || !data.booking) {
          throw new Error(data.error ?? "Không thể đăng ký rửa xe.");
        }

        setSuccess(`Đăng ký thành công. Mã lịch hẹn của bạn: ${data.booking.bookingCode}`);
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Không thể đăng ký rửa xe.");
      }
    });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr,0.85fr]">
      <Card className="glass-shell border-none">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="neon-pill">
              <CalendarDays className="h-3.5 w-3.5" />
              Đăng ký lịch hẹn
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              Cập nhật slot theo thời gian thực
            </span>
          </div>

          <div>
            <CardTitle className="font-[var(--font-space-grotesk)] text-2xl leading-tight">Đặt lịch rửa xe theo khung giờ trống</CardTitle>
            <CardDescription className="mt-1 text-sm">Chỉ cần điền đầy đủ 5 bước bên dưới, hệ thống sẽ xác nhận ngay sau khi gửi.</CardDescription>
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            {steps.map((step, index) => (
              <div key={step} className="rounded-lg border border-white/80 bg-white/82 px-2.5 py-2 text-xs text-slate-700">
                <p className="font-semibold text-primary">Bước {index + 1}</p>
                <p className="mt-0.5 line-clamp-2">{step}</p>
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="branch">Chi nhánh</Label>
                <select
                  id="branch"
                  value={branchId}
                  onChange={(event) => setBranchId(event.target.value)}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {branches.length === 0 ? <option value="">Chưa có chi nhánh</option> : null}
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="service">Dịch vụ</Label>
                <select
                  id="service"
                  value={serviceId}
                  onChange={(event) => setServiceId(event.target.value)}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {services.length === 0 ? <option value="">Chưa có dịch vụ</option> : null}
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr,auto]">
              <div className="space-y-2">
                <Label htmlFor="date">Ngày rửa xe</Label>
                <Input id="date" className="h-11" type="date" min={minDate} value={date} onChange={(event) => setDate(event.target.value)} />
              </div>
              <div className="self-end">
                <Button type="button" variant="outline" className="h-11" onClick={loadSlots} disabled={isLoadingSlots || !branchId}>
                  {isLoadingSlots ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" /> Tải khung giờ
                    </span>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Khung giờ trống</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {slots.length === 0 ? (
                  <p className="col-span-full rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-muted-foreground">
                    Chưa có dữ liệu khung giờ. Hãy chọn ngày và nhấn Tải khung giờ.
                  </p>
                ) : null}

                {slots.map((slot) => {
                  const disabled = slot.remaining <= 0;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={disabled}
                      onClick={() => setTime(slot.time)}
                      className={cn(
                        "rounded-lg border bg-white px-3 py-2.5 text-left text-sm transition",
                        time === slot.time && "border-primary bg-primary/10 shadow-sm",
                        disabled && "cursor-not-allowed opacity-40"
                      )}
                    >
                      <p className="font-semibold text-slate-800">{slot.time}</p>
                      <p className="text-xs text-muted-foreground">Còn {slot.remaining} chỗ</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">Họ và tên</Label>
                <Input id="customerName" className="h-11" value={customerName} onChange={(event) => setCustomerName(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" className="h-11" value={phone} onChange={(event) => setPhone(event.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleType">Loại xe</Label>
              <Input
                id="vehicleType"
                className="h-11"
                value={vehicleType}
                onChange={(event) => setVehicleType(event.target.value)}
                placeholder="Sedan / SUV / Hatchback"
                required
              />
            </div>

            <Button type="submit" className="h-11 w-full sm:w-auto" disabled={isSubmitting} size="lg">
              {isSubmitting ? "Đang gửi đăng ký..." : "Xác nhận đăng ký"}
            </Button>

            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            {success ? (
              <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> {success}
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <Card className="shine-border border-white/70 bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-xl">
            <Timer className="h-5 w-5 text-primary" />
            Tóm tắt lịch hẹn
          </CardTitle>
          <CardDescription>Cập nhật theo lựa chọn hiện tại của bạn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-lg border border-slate-200 bg-slate-50/75 p-3">
            <p className="inline-flex items-center gap-1.5 font-medium">
              <MapPin className="h-4 w-4 text-primary" />
              {selectedBranch?.name ?? "-"}
            </p>
            <p className="mt-1 text-muted-foreground">{selectedBranch?.address ?? "Chưa chọn chi nhánh"}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50/75 p-3">
            <p className="font-medium">Dịch vụ: {selectedService?.name ?? "-"}</p>
            <p className="mt-1 text-muted-foreground">{selectedService?.description ?? "Chưa có mô tả dịch vụ."}</p>
          </div>

          <div className="space-y-1.5 rounded-lg border border-slate-200 bg-white p-3 text-slate-700">
            <p className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-primary" />
              Thời lượng: {selectedService?.durationMinutes ?? "-"} phút
            </p>
            <p className="inline-flex items-center gap-2">
              <Car className="h-4 w-4 text-primary" />
              Loại xe: {vehicleType || "Chưa nhập"}
            </p>
            <p>
              Lịch dự kiến: <span className="font-medium">{date} {time || "--:--"}</span>
            </p>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
            <p className="font-medium">Chi phí dự kiến</p>
            <p className="mt-1 text-2xl font-bold">{selectedService ? `${money(selectedService.price)}đ` : "-"}</p>
            <p className="mt-1 text-xs">Giá có thể thay đổi tùy tình trạng xe và dịch vụ bổ sung.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

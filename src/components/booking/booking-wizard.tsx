"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type BranchOption = {
  id: string;
  name: string;
  address: string;
  slotStep: number;
  capacity: number;
};

type ServiceOption = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
};

type SlotOption = {
  time: string;
  remaining: number;
};

type BookingWizardProps = {
  branches: BranchOption[];
  services: ServiceOption[];
};

const formSchema = z.object({
  branchId: z.string().min(1, "Please select a branch."),
  serviceId: z.string().min(1, "Please select a service."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid date."),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Please select a time slot."),
  customerName: z.string().trim().min(2, "Name is required."),
  phone: z.string().trim().min(6, "Phone number is required."),
  vehicleType: z.string().trim().min(2, "Vehicle type is required.")
});

type WizardValues = z.infer<typeof formSchema>;

const steps = [
  "Select branch",
  "Select service",
  "Select date",
  "Choose time slot",
  "Customer info",
  "Confirm booking"
];

function todayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function BookingWizard({ branches, services }: BookingWizardProps) {
  const [step, setStep] = useState(1);
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [slotError, setSlotError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState<{
    bookingCode: string;
    laneNumber: number;
    startTime: string;
  } | null>(null);

  const [isLoadingSlots, startLoadingSlots] = useTransition();
  const [isSubmitting, startSubmitting] = useTransition();

  const {
    register,
    setValue,
    watch,
    trigger,
    handleSubmit,
    formState: { errors }
  } = useForm<WizardValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      branchId: branches[0]?.id ?? "",
      serviceId: services[0]?.id ?? "",
      date: todayIso(),
      time: "",
      customerName: "",
      phone: "",
      vehicleType: ""
    }
  });

  const values = watch();
  const selectedBranch = useMemo(
    () => branches.find((branch) => branch.id === values.branchId) ?? null,
    [branches, values.branchId]
  );
  const selectedService = useMemo(
    () => services.find((service) => service.id === values.serviceId) ?? null,
    [services, values.serviceId]
  );

  const loadSlots = () => {
    if (!values.branchId || !values.date) return;

    setSlotError("");
    setSubmitError("");
    setBookingSuccess(null);

    startLoadingSlots(async () => {
      try {
        const query = new URLSearchParams({
          branchId: values.branchId,
          date: values.date
        });
        const response = await fetch(`/api/slots?${query.toString()}`, { method: "GET" });
        const data = (await response.json()) as SlotOption[] | { error?: string };

        if (!response.ok || !Array.isArray(data)) {
          const message = !Array.isArray(data) ? data.error : "Unable to load slots.";
          throw new Error(message ?? "Unable to load slots.");
        }

        setSlots(data);
        const selected = data.find((slot) => slot.time === values.time && slot.remaining > 0);
        if (!selected) {
          setValue("time", "");
        }
      } catch (error) {
        setSlots([]);
        setValue("time", "");
        setSlotError(error instanceof Error ? error.message : "Unable to load slots.");
      }
    });
  };

  useEffect(() => {
    if (step >= 4 && values.branchId && values.date) {
      loadSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.branchId, values.date, step]);

  const validateCurrentStep = async () => {
    if (step === 1) return trigger(["branchId"]);
    if (step === 2) return trigger(["serviceId"]);
    if (step === 3) return trigger(["date"]);
    if (step === 4) return trigger(["time"]);
    if (step === 5) return trigger(["customerName", "phone", "vehicleType"]);
    return true;
  };

  const onNext = async () => {
    const ok = await validateCurrentStep();
    if (!ok) return;
    if (step < 6) setStep((prev) => prev + 1);
  };

  const onBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const submitBooking = (formValues: WizardValues) => {
    setSubmitError("");
    setBookingSuccess(null);

    startSubmitting(async () => {
      try {
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formValues)
        });
        const data = (await response.json()) as
          | { booking: { bookingCode: string; laneNumber: number; startTime: string } }
          | { error?: string };

        if (!response.ok || !("booking" in data)) {
          const message = "error" in data ? data.error : "Unable to create booking.";
          throw new Error(message ?? "Unable to create booking.");
        }

        setBookingSuccess({
          bookingCode: data.booking.bookingCode,
          laneNumber: data.booking.laneNumber,
          startTime: data.booking.startTime
        });
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Unable to create booking.");
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle>Booking Wizard</CardTitle>
            <Badge variant="secondary">
              Step {step}/{steps.length}
            </Badge>
          </div>
          <CardDescription>Complete each step to finalize your car wash booking.</CardDescription>
          <div className="grid grid-cols-6 gap-1">
            {steps.map((label, index) => {
              const itemStep = index + 1;
              return (
                <button
                  key={label}
                  type="button"
                  className={cn(
                    "rounded-md border px-2 py-1 text-left text-xs transition",
                    itemStep === step && "border-primary bg-primary/10",
                    itemStep < step && "border-emerald-500 bg-emerald-50 text-emerald-700"
                  )}
                  onClick={() => {
                    if (itemStep <= step) setStep(itemStep);
                  }}
                >
                  <span className="line-clamp-2">{label}</span>
                </button>
              );
            })}
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit(submitBooking)}>
        <Card>
          <CardContent className="space-y-4 pt-6">
            {step === 1 ? (
              <section className="space-y-3">
                <h3 className="font-semibold">Step 1: Select branch</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {branches.map((branch) => {
                    const selected = values.branchId === branch.id;
                    return (
                      <button
                        key={branch.id}
                        type="button"
                        onClick={() => setValue("branchId", branch.id, { shouldValidate: true })}
                        className={cn(
                          "rounded-lg border p-3 text-left",
                          selected && "border-primary bg-primary/10"
                        )}
                      >
                        <p className="font-medium">{branch.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{branch.address}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Capacity: {branch.capacity} lanes - Step: {branch.slotStep}m
                        </p>
                      </button>
                    );
                  })}
                </div>
                {errors.branchId ? <p className="text-sm text-red-600">{errors.branchId.message}</p> : null}
              </section>
            ) : null}

            {step === 2 ? (
              <section className="space-y-3">
                <h3 className="font-semibold">Step 2: Select service</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.map((service) => {
                    const selected = values.serviceId === service.id;
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => setValue("serviceId", service.id, { shouldValidate: true })}
                        className={cn(
                          "rounded-lg border p-3 text-left",
                          selected && "border-primary bg-primary/10"
                        )}
                      >
                        <p className="font-medium">{service.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{service.description ?? "No description"}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {service.durationMinutes} min - {money(service.price)}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {errors.serviceId ? <p className="text-sm text-red-600">{errors.serviceId.message}</p> : null}
              </section>
            ) : null}

            {step === 3 ? (
              <section className="space-y-3">
                <h3 className="font-semibold">Step 3: Select date</h3>
                <div className="max-w-xs space-y-2">
                  <Label htmlFor="date">Booking date</Label>
                  <Input id="date" type="date" min={todayIso()} {...register("date")} />
                </div>
                {errors.date ? <p className="text-sm text-red-600">{errors.date.message}</p> : null}
              </section>
            ) : null}

            {step === 4 ? (
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">Step 4: Available time slots</h3>
                  <Button type="button" variant="outline" size="sm" onClick={loadSlots} disabled={isLoadingSlots}>
                    {isLoadingSlots ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading
                      </span>
                    ) : (
                      "Refresh slots"
                    )}
                  </Button>
                </div>

                {slotError ? <p className="text-sm text-red-600">{slotError}</p> : null}

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {slots.map((slot) => {
                    const selected = values.time === slot.time;
                    const disabled = slot.remaining <= 0;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={disabled}
                        onClick={() => setValue("time", slot.time, { shouldValidate: true })}
                        className={cn(
                          "rounded-md border px-3 py-2 text-left text-sm",
                          selected && "border-primary bg-primary/10",
                          disabled && "cursor-not-allowed opacity-40"
                        )}
                      >
                        <p className="font-medium">{slot.time}</p>
                        <p className="text-xs text-muted-foreground">{slot.remaining} remaining</p>
                      </button>
                    );
                  })}
                </div>

                {slots.length === 0 && !slotError ? <p className="text-sm text-muted-foreground">No slots found.</p> : null}
                {errors.time ? <p className="text-sm text-red-600">{errors.time.message}</p> : null}
              </section>
            ) : null}

            {step === 5 ? (
              <section className="space-y-3">
                <h3 className="font-semibold">Step 5: Customer info</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer name</Label>
                    <Input id="customerName" placeholder="John Doe" {...register("customerName")} />
                    {errors.customerName ? <p className="text-sm text-red-600">{errors.customerName.message}</p> : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="+84..." {...register("phone")} />
                    {errors.phone ? <p className="text-sm text-red-600">{errors.phone.message}</p> : null}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle type</Label>
                  <Input id="vehicleType" placeholder="Sedan / SUV / Hatchback..." {...register("vehicleType")} />
                  {errors.vehicleType ? <p className="text-sm text-red-600">{errors.vehicleType.message}</p> : null}
                </div>
              </section>
            ) : null}

            {step === 6 ? (
              <section className="space-y-3">
                <h3 className="font-semibold">Step 6: Confirm booking</h3>
                <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                  <p>
                    <span className="text-muted-foreground">Branch:</span> {selectedBranch?.name ?? "-"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Service:</span> {selectedService?.name ?? "-"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Date & time:</span> {values.date} {values.time}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Customer:</span> {values.customerName}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Phone:</span> {values.phone}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Vehicle:</span> {values.vehicleType}
                  </p>
                </div>

                {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

                {bookingSuccess ? (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                    <p className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="h-4 w-4" /> Booking created successfully
                    </p>
                    <p className="mt-2">Code: {bookingSuccess.bookingCode}</p>
                    <p>Lane: #{bookingSuccess.laneNumber}</p>
                    <p>Start: {new Date(bookingSuccess.startTime).toLocaleString()}</p>
                  </div>
                ) : null}
              </section>
            ) : null}
          </CardContent>
        </Card>

        <div className="sticky bottom-3 mt-4 rounded-xl border bg-background/95 p-3 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            <Button type="button" variant="outline" onClick={onBack} disabled={step === 1 || isSubmitting}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>

            {step < 6 ? (
              <Button type="button" onClick={onNext}>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Confirming
                  </span>
                ) : (
                  "Confirm booking"
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

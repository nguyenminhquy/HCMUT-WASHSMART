"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Search } from "lucide-react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bookingLookupSchema, type BookingLookupInput } from "@/lib/validators/booking-lookup";

type BookingLookup = {
  bookingCode: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "DONE" | "NO_SHOW";
  time: {
    start: string;
    end: string;
  };
  branch: {
    name: string;
    address: string;
  };
  service: {
    name: string;
    durationMinutes: number;
    price: number;
  };
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function LookupForm() {
  const [result, setResult] = useState<BookingLookup | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<BookingLookupInput>({
    resolver: zodResolver(bookingLookupSchema),
    defaultValues: {
      phone: "",
      bookingCode: ""
    }
  });

  const onLookup = handleSubmit((values) => {
    setError("");
    setResult(null);

    startTransition(async () => {
      try {
        const query = new URLSearchParams({
          phone: values.phone.trim(),
          bookingCode: values.bookingCode.trim().toUpperCase()
        });

        const response = await fetch(`/api/bookings/lookup?${query.toString()}`, { method: "GET" });
        const data = (await response.json()) as { booking?: BookingLookup; error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? "Lookup failed.");
        }

        if (!data.booking) {
          setError("Booking not found.");
          return;
        }

        setResult(data.booking);
      } catch (lookupError) {
        setError(lookupError instanceof Error ? lookupError.message : "Lookup failed.");
      }
    });
  });

  const onBookingCodeChange = (raw: string) => {
    setValue("bookingCode", raw.toUpperCase(), { shouldValidate: true });
  };

  const statusVariant: Record<BookingLookup["status"], "secondary" | "default" | "destructive"> = {
    PENDING: "secondary",
    CONFIRMED: "default",
    CANCELLED: "destructive",
    DONE: "default",
    NO_SHOW: "destructive"
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Lookup booking</CardTitle>
          <CardDescription>Enter your phone and booking code to check booking details instantly.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-[1fr,1fr,auto]" onSubmit={onLookup} noValidate>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+84 9..." {...register("phone")} />
              {errors.phone ? <p className="text-sm text-red-600">{errors.phone.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookingCode">Booking code</Label>
              <Input
                id="bookingCode"
                maxLength={12}
                {...register("bookingCode")}
                onChange={(event) => onBookingCodeChange(event.target.value)}
              />
              {errors.bookingCode ? <p className="text-sm text-red-600">{errors.bookingCode.message}</p> : null}
            </div>

            <div className="self-end md:w-auto">
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Searching
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Search className="h-4 w-4" /> Lookup
                  </span>
                )}
              </Button>
            </div>
          </form>

          {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}

          {result ? (
            <div className="mt-6 rounded-lg border bg-muted/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">Booking detail</h3>
                <Badge variant={statusVariant[result.status]}>{result.status}</Badge>
              </div>
              <div className="grid gap-2 text-sm md:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">Booking code:</span> {result.bookingCode}
                </p>
                <p>
                  <span className="text-muted-foreground">Branch:</span> {result.branch.name}
                </p>
                <p>
                  <span className="text-muted-foreground">Service:</span> {result.service.name}
                </p>
                <p>
                  <span className="text-muted-foreground">Time:</span> {new Date(result.time.start).toLocaleString()}
                </p>
                <p>
                  <span className="text-muted-foreground">Duration:</span> {result.service.durationMinutes} min
                </p>
                <p>
                  <span className="text-muted-foreground">Price:</span> {money(result.service.price)}
                </p>
              </div>
              <p className="mt-2 text-sm">
                <span className="text-muted-foreground">Address:</span> {result.branch.address}
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Estimated end:</span>{" "}
                {new Date(result.time.end).toLocaleString()}
              </p>
              <div className="mt-3">
                <Badge variant={statusVariant[result.status]}>{result.status}</Badge>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

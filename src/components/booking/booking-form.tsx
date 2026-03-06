"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { SlotPicker, type SlotItem } from "@/components/booking/slot-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type BranchOption = {
  id: string;
  name: string;
  timezone: string;
};

type OfferingOption = {
  id: string;
  branchId: string;
  serviceId: string;
  serviceName: string;
  price: number;
  durationMin: number;
};

type BookingFormProps = {
  branches: BranchOption[];
  offerings: OfferingOption[];
};

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

export function BookingForm({ branches, offerings }: BookingFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [carPlate, setCarPlate] = useState("");
  const [carModel, setCarModel] = useState("");
  const [notes, setNotes] = useState("");

  const [branchId, setBranchId] = useState(branches[0]?.id ?? "");
  const [date, setDate] = useState(todayIso());
  const [branchServiceId, setBranchServiceId] = useState("");
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isLoadingSlots, startLoadingSlots] = useTransition();
  const [isSubmitting, startSubmitting] = useTransition();

  const filteredOfferings = useMemo(
    () => offerings.filter((item) => item.branchId === branchId),
    [branchId, offerings]
  );

  const selectedOffering = filteredOfferings.find((item) => item.id === branchServiceId) ?? null;

  useEffect(() => {
    if (!filteredOfferings.find((item) => item.id === branchServiceId)) {
      setBranchServiceId(filteredOfferings[0]?.id ?? "");
      setSlots([]);
      setSelectedSlot("");
    }
  }, [branchServiceId, filteredOfferings]);

  const loadSlots = () => {
    if (!branchId || !branchServiceId || !date) return;
    setError("");
    setSuccess("");

    startLoadingSlots(async () => {
      try {
        const query = new URLSearchParams({
          branchId,
          branchServiceId,
          date
        });
        const response = await fetch(`/api/public/slots?${query.toString()}`);
        const data = (await response.json()) as { slots?: SlotItem[]; error?: string };
        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load available slots.");
        }
        setSlots(data.slots ?? []);
        setSelectedSlot("");
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Unable to load available slots.");
      }
    });
  };

  const submitBooking = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedSlot) {
      setError("Please select an available time slot.");
      return;
    }

    startSubmitting(async () => {
      try {
        const response = await fetch("/api/public/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName,
            phone,
            carPlate,
            carModel,
            notes,
            branchId,
            branchServiceId,
            startAt: selectedSlot
          })
        });
        const data = (await response.json()) as { booking?: { code: string }; error?: string };
        if (!response.ok || !data.booking) {
          throw new Error(data.error ?? "Booking failed.");
        }

        setSuccess(`Booking created successfully. Your lookup code is ${data.booking.code}.`);
        setSlots([]);
        setSelectedSlot("");
        setCarPlate("");
        setCarModel("");
        setNotes("");
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Booking failed.");
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Book a car wash appointment</CardTitle>
          <CardDescription>Choose branch, service, slot, then submit your customer details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submitBooking}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer name</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} required />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="branchId">Branch</Label>
                <select
                  id="branchId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={branchId}
                  onChange={(event) => setBranchId(event.target.value)}
                  required
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branchServiceId">Service</Label>
                <select
                  id="branchServiceId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={branchServiceId}
                  onChange={(event) => setBranchServiceId(event.target.value)}
                  required
                >
                  {filteredOfferings.map((offering) => (
                    <option key={offering.id} value={offering.id}>
                      {offering.serviceName} ({money(offering.price)}, {offering.durationMin} min)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr,auto]">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} min={todayIso()} onChange={(event) => setDate(event.target.value)} />
              </div>
              <div className="self-end">
                <Button type="button" onClick={loadSlots} disabled={isLoadingSlots}>
                  {isLoadingSlots ? "Loading..." : "Load slots"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Available slots</Label>
              <SlotPicker slots={slots} selectedStartAt={selectedSlot} onSelect={setSelectedSlot} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="carPlate">Car plate</Label>
                <Input id="carPlate" value={carPlate} onChange={(event) => setCarPlate(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carModel">Car model</Label>
                <Input id="carModel" value={carModel} onChange={(event) => setCarModel(event.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
            </div>

            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            {success ? <p className="text-sm font-medium text-emerald-600">{success}</p> : null}

            <Button type="submit" disabled={isSubmitting || !selectedSlot}>
              {isSubmitting ? "Submitting..." : "Confirm booking"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Selection summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Branch:</span> {branches.find((item) => item.id === branchId)?.name ?? "-"}
          </p>
          <p>
            <span className="text-muted-foreground">Service:</span> {selectedOffering?.serviceName ?? "-"}
          </p>
          <p>
            <span className="text-muted-foreground">Price:</span> {selectedOffering ? money(selectedOffering.price) : "-"}
          </p>
          <p>
            <span className="text-muted-foreground">Duration:</span> {selectedOffering?.durationMin ?? "-"} min
          </p>
          <p>
            <span className="text-muted-foreground">Slot:</span>{" "}
            {slots.find((slot) => slot.startAt === selectedSlot)?.label ?? "Not selected"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

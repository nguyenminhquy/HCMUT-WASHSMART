"use client";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type SlotItem = {
  startAt: string;
  endAt: string;
  label: string;
  remainingCapacity: number;
  available: boolean;
};

type SlotPickerProps = {
  slots: SlotItem[];
  selectedStartAt: string;
  onSelect: (startAt: string) => void;
};

export function SlotPicker({ slots, selectedStartAt, onSelect }: SlotPickerProps) {
  if (slots.length === 0) {
    return <p className="text-sm text-muted-foreground">No slots found for selected filters.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {slots.map((slot) => {
        const selected = selectedStartAt === slot.startAt;
        return (
          <button
            type="button"
            key={slot.startAt}
            disabled={!slot.available}
            className={cn(
              buttonVariants({ variant: selected ? "default" : "outline", size: "sm" }),
              "h-auto justify-between gap-2 px-3 py-2 text-left",
              !slot.available && "cursor-not-allowed opacity-40"
            )}
            onClick={() => onSelect(slot.startAt)}
          >
            <span>{slot.label}</span>
            <span className="text-xs opacity-80">{slot.remainingCapacity} left</span>
          </button>
        );
      })}
    </div>
  );
}

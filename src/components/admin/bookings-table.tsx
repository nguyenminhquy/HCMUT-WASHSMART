import { BookingStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type BookingTableRow = {
  id: string;
  bookingCode: string;
  customerName: string;
  phone: string;
  vehicleType: string;
  status: BookingStatus;
  startTime: Date;
  endTime: Date;
  laneNumber: number;
  branch: { name: string };
  service: { name: string; price: number };
};

const statusList: BookingStatus[] = ["PENDING", "CONFIRMED", "CANCELLED", "DONE", "NO_SHOW"];

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function statusVariant(status: BookingStatus): "default" | "secondary" | "destructive" {
  if (status === "CONFIRMED" || status === "DONE") return "default";
  if (status === "CANCELLED" || status === "NO_SHOW") return "destructive";
  return "secondary";
}

export function BookingsTable({
  bookings,
  updateStatusAction
}: {
  bookings: BookingTableRow[];
  updateStatusAction: (formData: FormData) => Promise<void>;
}) {
  if (bookings.length === 0) {
    return <p className="text-sm text-muted-foreground">No bookings found with current filters.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Booking</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Branch / Service</TableHead>
          <TableHead>Schedule</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell className="align-top">
              <p className="font-medium">{booking.bookingCode}</p>
              <p className="text-xs text-muted-foreground">{money(booking.service.price)}</p>
            </TableCell>
            <TableCell className="align-top">
              <p>{booking.customerName}</p>
              <p className="text-xs text-muted-foreground">{booking.phone}</p>
              <p className="text-xs text-muted-foreground">{booking.vehicleType}</p>
            </TableCell>
            <TableCell className="align-top">
              <p>{booking.branch.name}</p>
              <p className="text-xs text-muted-foreground">{booking.service.name}</p>
            </TableCell>
            <TableCell className="align-top">
              <p>{booking.startTime.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">End: {booking.endTime.toLocaleTimeString()}</p>
              <p className="text-xs text-muted-foreground">Lane #{booking.laneNumber}</p>
            </TableCell>
            <TableCell className="align-top">
              <Badge variant={statusVariant(booking.status)}>{booking.status}</Badge>
            </TableCell>
            <TableCell className="align-top">
              <form action={updateStatusAction} className="flex items-center gap-2">
                <input type="hidden" name="bookingId" value={booking.id} />
                <select
                  name="status"
                  defaultValue={booking.status}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                >
                  {statusList.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <Button type="submit" variant="outline" size="sm">
                  Save
                </Button>
              </form>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

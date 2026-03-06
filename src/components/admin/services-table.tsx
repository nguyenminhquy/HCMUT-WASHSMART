import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ServiceRow = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  durationMin: number;
  isActive: boolean;
};

type OfferingRow = {
  id: string;
  price: number;
  durationMin: number;
  isActive: boolean;
  branch: { name: string };
  service: { name: string };
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function ServicesTable({
  services,
  offerings,
  toggleServiceAction,
  toggleOfferingAction
}: {
  services: ServiceRow[];
  offerings: OfferingRow[];
  toggleServiceAction: (formData: FormData) => Promise<void>;
  toggleOfferingAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 font-semibold">Services</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Base price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  <div className="font-medium">{service.name}</div>
                  <div className="text-xs text-muted-foreground">{service.slug}</div>
                </TableCell>
                <TableCell>{money(service.basePrice)}</TableCell>
                <TableCell>{service.durationMin} min</TableCell>
                <TableCell>
                  <Badge variant={service.isActive ? "default" : "secondary"}>
                    {service.isActive ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <form action={toggleServiceAction}>
                    <input type="hidden" name="id" value={service.id} />
                    <input type="hidden" name="current" value={service.isActive ? "1" : "0"} />
                    <Button size="sm" variant="outline" type="submit">
                      Toggle
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="mb-2 font-semibold">Branch service offerings</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Branch</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offerings.map((offering) => (
              <TableRow key={offering.id}>
                <TableCell>{offering.branch.name}</TableCell>
                <TableCell>{offering.service.name}</TableCell>
                <TableCell>{money(offering.price)}</TableCell>
                <TableCell>{offering.durationMin} min</TableCell>
                <TableCell>
                  <Badge variant={offering.isActive ? "default" : "secondary"}>
                    {offering.isActive ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <form action={toggleOfferingAction}>
                    <input type="hidden" name="id" value={offering.id} />
                    <input type="hidden" name="current" value={offering.isActive ? "1" : "0"} />
                    <Button size="sm" variant="outline" type="submit">
                      Toggle
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

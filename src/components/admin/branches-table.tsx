import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type BranchTableRow = {
  id: string;
  name: string;
  address: string;
  openTime: Date;
  closeTime: Date;
  slotStep: number;
  capacity: number;
};

function formatTime(value: Date) {
  const hour = String(value.getUTCHours()).padStart(2, "0");
  const minute = String(value.getUTCMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

export function BranchesTable({
  branches,
  updateAction
}: {
  branches: BranchTableRow[];
  updateAction: (formData: FormData) => Promise<void>;
}) {
  if (branches.length === 0) {
    return <p className="text-sm text-muted-foreground">No branches yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Open</TableHead>
          <TableHead>Close</TableHead>
          <TableHead>Step (min)</TableHead>
          <TableHead>Capacity</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {branches.map((branch) => {
          const formId = `branch-form-${branch.id}`;
          return (
            <TableRow key={branch.id}>
              <TableCell>
                <input
                  form={formId}
                  name="name"
                  defaultValue={branch.name}
                  className="h-9 w-44 rounded-md border border-input bg-background px-2 text-sm"
                />
              </TableCell>
              <TableCell>
                <input
                  form={formId}
                  name="address"
                  defaultValue={branch.address}
                  className="h-9 w-72 rounded-md border border-input bg-background px-2 text-sm"
                />
              </TableCell>
              <TableCell>
                <input
                  form={formId}
                  type="time"
                  name="openTime"
                  defaultValue={formatTime(branch.openTime)}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                />
              </TableCell>
              <TableCell>
                <input
                  form={formId}
                  type="time"
                  name="closeTime"
                  defaultValue={formatTime(branch.closeTime)}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                />
              </TableCell>
              <TableCell>
                <input
                  form={formId}
                  type="number"
                  min={5}
                  max={120}
                  name="slotStep"
                  defaultValue={branch.slotStep}
                  className="h-9 w-24 rounded-md border border-input bg-background px-2 text-sm"
                />
              </TableCell>
              <TableCell>
                <input
                  form={formId}
                  type="number"
                  min={1}
                  max={30}
                  name="capacity"
                  defaultValue={branch.capacity}
                  className="h-9 w-24 rounded-md border border-input bg-background px-2 text-sm"
                />
              </TableCell>
              <TableCell>
                <form id={formId} action={updateAction}>
                  <input type="hidden" name="id" value={branch.id} />
                  <Button size="sm" variant="outline" type="submit">
                    Save
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { BranchesTable } from "@/components/admin/branches-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const branchSchema = z.object({
  name: z.string().trim().min(2).max(120),
  address: z.string().trim().min(6).max(255),
  openTime: z.string().regex(/^\d{2}:\d{2}$/),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotStep: z.number().int().min(5).max(120),
  capacity: z.number().int().min(1).max(30)
});

const updateBranchSchema = branchSchema.extend({
  id: z.string().cuid()
});

function parseTimeToDate(time: string) {
  return new Date(`1970-01-01T${time}:00.000Z`);
}

export default async function AdminBranchesPage() {
  const branches = await prisma.branch.findMany({
    orderBy: [{ name: "asc" }]
  });

  async function createBranchAction(formData: FormData) {
    "use server";
    const parsed = branchSchema.parse({
      name: String(formData.get("name") ?? ""),
      address: String(formData.get("address") ?? ""),
      openTime: String(formData.get("openTime") ?? ""),
      closeTime: String(formData.get("closeTime") ?? ""),
      slotStep: Number(formData.get("slotStep") ?? 30),
      capacity: Number(formData.get("capacity") ?? 2)
    });

    await prisma.branch.create({
      data: {
        name: parsed.name,
        address: parsed.address,
        openTime: parseTimeToDate(parsed.openTime),
        closeTime: parseTimeToDate(parsed.closeTime),
        slotStep: parsed.slotStep,
        capacity: parsed.capacity
      }
    });

    revalidatePath("/admin/branches");
    revalidatePath("/admin");
    revalidatePath("/book");
  }

  async function updateBranchAction(formData: FormData) {
    "use server";
    const parsed = updateBranchSchema.parse({
      id: String(formData.get("id") ?? ""),
      name: String(formData.get("name") ?? ""),
      address: String(formData.get("address") ?? ""),
      openTime: String(formData.get("openTime") ?? ""),
      closeTime: String(formData.get("closeTime") ?? ""),
      slotStep: Number(formData.get("slotStep") ?? 30),
      capacity: Number(formData.get("capacity") ?? 2)
    });

    await prisma.branch.update({
      where: { id: parsed.id },
      data: {
        name: parsed.name,
        address: parsed.address,
        openTime: parseTimeToDate(parsed.openTime),
        closeTime: parseTimeToDate(parsed.closeTime),
        slotStep: parsed.slotStep,
        capacity: parsed.capacity
      }
    });

    revalidatePath("/admin/branches");
    revalidatePath("/admin");
    revalidatePath("/book");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create branch</CardTitle>
          <CardDescription>Create a new car wash branch with opening hours and lane capacity.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createBranchAction} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="openTime">Open time</Label>
              <Input id="openTime" name="openTime" type="time" defaultValue="08:00" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closeTime">Close time</Label>
              <Input id="closeTime" name="closeTime" type="time" defaultValue="20:00" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slotStep">Slot step (minutes)</Label>
              <Input id="slotStep" name="slotStep" type="number" defaultValue={30} min={5} max={120} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Lane capacity</Label>
              <Input id="capacity" name="capacity" type="number" defaultValue={2} min={1} max={30} required />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Create branch</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit branches</CardTitle>
          <CardDescription>Update branch details directly in the data table.</CardDescription>
        </CardHeader>
        <CardContent>
          <BranchesTable branches={branches} updateAction={updateBranchAction} />
        </CardContent>
      </Card>
    </div>
  );
}

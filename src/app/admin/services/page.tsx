import { revalidatePath } from "next/cache";

import { ServicesTable } from "@/components/admin/services-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listAllBranches } from "@/server/branches";
import {
  createService,
  listAllServices,
  listBranchServices,
  toggleBranchServiceActive,
  toggleServiceActive,
  upsertBranchService
} from "@/server/services";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const [services, offerings, branches] = await Promise.all([listAllServices(), listBranchServices(), listAllBranches()]);

  async function createServiceAction(formData: FormData) {
    "use server";
    await createService({
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      description: String(formData.get("description") ?? ""),
      basePrice: Number(formData.get("basePrice") ?? 0),
      durationMin: Number(formData.get("durationMin") ?? 0)
    });
    revalidatePath("/admin/services");
    revalidatePath("/book");
  }

  async function mapServiceToBranchAction(formData: FormData) {
    "use server";
    await upsertBranchService({
      branchId: String(formData.get("branchId") ?? ""),
      serviceId: String(formData.get("serviceId") ?? ""),
      price: Number(formData.get("price") ?? 0),
      durationMin: Number(formData.get("durationMin") ?? 0)
    });
    revalidatePath("/admin/services");
    revalidatePath("/book");
  }

  async function toggleServiceAction(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    const current = String(formData.get("current") ?? "0") === "1";
    await toggleServiceActive(id, current);
    revalidatePath("/admin/services");
    revalidatePath("/book");
  }

  async function toggleOfferingAction(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    const current = String(formData.get("current") ?? "0") === "1";
    await toggleBranchServiceActive(id, current);
    revalidatePath("/admin/services");
    revalidatePath("/book");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create service</CardTitle>
          <CardDescription>Base service templates can then be mapped to one or more branches.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createServiceAction} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="basePrice">Base price</Label>
              <Input id="basePrice" name="basePrice" type="number" min={10000} defaultValue={120000} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationMin">Duration (minutes)</Label>
              <Input id="durationMin" name="durationMin" type="number" min={15} defaultValue={45} required />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Create service</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Map service to branch</CardTitle>
          <CardDescription>Override price and duration per branch.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={mapServiceToBranchAction} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="branchId">Branch</Label>
              <select
                id="branchId"
                name="branchId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                {branches.map((branch: { id: string; name: string }) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceId">Service</Label>
              <select
                id="serviceId"
                name="serviceId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                {services.map((service: { id: string; name: string }) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" type="number" min={10000} defaultValue={120000} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationMinMap">Duration (minutes)</Label>
              <Input id="durationMinMap" name="durationMin" type="number" min={15} defaultValue={45} required />
            </div>

            <div className="md:col-span-2">
              <Button type="submit">Save branch offering</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage services and offerings</CardTitle>
        </CardHeader>
        <CardContent>
          <ServicesTable
            services={services}
            offerings={offerings}
            toggleServiceAction={toggleServiceAction}
            toggleOfferingAction={toggleOfferingAction}
          />
        </CardContent>
      </Card>
    </div>
  );
}

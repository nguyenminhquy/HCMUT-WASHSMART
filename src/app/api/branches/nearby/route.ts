import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { VINCOM_BRANCHES } from "@/lib/vincom-branches";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  limit: z.coerce.number().min(1).max(20).optional()
});

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceKm(fromLat: number, fromLng: number, toLat: number, toLng: number) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    lat: url.searchParams.get("lat"),
    lng: url.searchParams.get("lng"),
    limit: url.searchParams.get("limit") ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid lat/lng query params." }, { status: 400 });
  }

  const limit = parsed.data.limit ?? 8;
  const dbBranches = await prisma.branch
    .findMany({
      where: { name: { in: VINCOM_BRANCHES.map((branch) => branch.name) } },
      select: { id: true, name: true, address: true }
    })
    .catch(() => []);

  const dbByName = new Map(dbBranches.map((branch) => [branch.name, branch]));

  const nearest = VINCOM_BRANCHES.map((branch) => {
    const linkedBranch = dbByName.get(branch.name);
    const distance = distanceKm(parsed.data.lat, parsed.data.lng, branch.latitude, branch.longitude);

    return {
      id: linkedBranch?.id ?? null,
      name: branch.name,
      address: linkedBranch?.address ?? `${branch.address} (${branch.city})`,
      city: branch.city,
      latitude: branch.latitude,
      longitude: branch.longitude,
      distanceKm: Number(distance.toFixed(2))
    };
  })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);

  return NextResponse.json({ branches: nearest });
}

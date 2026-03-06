"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LocateFixed, Loader2, MapPin, Navigation } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type NearbyBranch = {
  id: string | null;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
};

function googleMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function NearbyStationsVi() {
  const [branches, setBranches] = useState<NearbyBranch[]>([]);
  const [locationError, setLocationError] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const loadNearby = useCallback(async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        limit: "10"
      });
      const response = await fetch(`/api/branches/nearby?${query.toString()}`);
      const data = (await response.json()) as { branches?: NearbyBranch[]; error?: string };
      if (!response.ok || !Array.isArray(data.branches)) {
        throw new Error(data.error ?? "Không thể tải danh sách trạm gần bạn.");
      }
      setBranches(data.branches);
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : "Không thể tải danh sách trạm gần bạn.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Trình duyệt không hỗ trợ định vị.");
      return;
    }

    setIsLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCoords(nextCoords);
        setIsLocating(false);
        void loadNearby(nextCoords.lat, nextCoords.lng);
      },
      (error) => {
        setIsLocating(false);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Bạn đã từ chối quyền vị trí. Hãy bật vị trí để tìm trạm gần nhất."
            : "Không thể lấy vị trí hiện tại."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60_000
      }
    );
  }, [loadNearby]);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  const locationText = useMemo(() => {
    if (!coords) {
      return "Chưa lấy được vị trí.";
    }
    return `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
  }, [coords]);

  return (
    <div className="space-y-4">
      <Card className="glass-shell border-none">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 font-[var(--font-space-grotesk)] text-2xl">
            <Navigation className="h-5 w-5 text-primary" />
            Trạm rửa gần bạn
          </CardTitle>
          <CardDescription>
            Hệ thống tự động lấy vị trí hiện tại và tìm trạm HCMUT-WASHSMART gần nhất (giả định có trạm tại mọi Vincom trên toàn quốc).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3 text-sm">
          <p className="rounded-lg border bg-white px-3 py-2 text-slate-700">
            <span className="text-muted-foreground">Vị trí của bạn:</span> {locationText}
          </p>
          <button type="button" className={cn(buttonVariants({ variant: "outline" }), "h-10")} onClick={detectLocation} disabled={isLocating || isLoading}>
            {isLocating ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang lấy vị trí...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <LocateFixed className="h-4 w-4" />
                Lấy lại vị trí
              </span>
            )}
          </button>
        </CardContent>
      </Card>

      {locationError ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-red-600">{locationError}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card className="shine-border border-white/70 bg-white/92 shadow-lg">
        <CardHeader>
          <CardTitle>Danh sách trạm gần nhất</CardTitle>
          <CardDescription>Khoảng cách được tính theo đường chim bay từ vị trí hiện tại của bạn.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tìm trạm gần bạn...
            </p>
          ) : branches.length === 0 ? (
            <p className="text-sm text-muted-foreground">Không có dữ liệu trạm. Vui lòng thử lại.</p>
          ) : (
            <div className="grid gap-3">
              {branches.map((branch, index) => {
                const bookingHref = branch.id ? `/dang-ky-rua-xe?branchId=${branch.id}` : "/dang-ky-rua-xe";
                return (
                  <div key={`${branch.name}-${branch.city}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="inline-flex items-center gap-2 text-sm">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {index + 1}
                          </span>
                          <span className="font-semibold">{branch.name}</span>
                        </p>
                        <p className="text-sm text-slate-600">{branch.address}</p>
                        <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {branch.city} - {branch.distanceKm.toFixed(2)} km
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link href={bookingHref} className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
                          Đặt lịch tại đây
                        </Link>
                        <a
                          href={googleMapsUrl(branch.latitude, branch.longitude)}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Chỉ đường
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

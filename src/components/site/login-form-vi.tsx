"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Lock, ShieldCheck, Sparkles, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const benefits = ["Theo dõi lịch hẹn theo thời gian thực", "Nhắc lịch định kỳ tự động", "Lưu lịch sử dịch vụ và hóa đơn"];

export function LoginFormVi() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await signIn("credentials", {
        username: identifier.trim(),
        password,
        callbackUrl: "/",
        redirect: false
      });

      if (!result || result.error) {
        setError("Sai thông tin đăng nhập hoặc tài khoản chưa tồn tại.");
        return;
      }

      router.push(result.url ?? "/");
      router.refresh();
    });
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[1.05fr,0.95fr]">
      <Card className="glass-shell hero-spotlight border-none p-0">
        <CardHeader className="pb-3">
          <span className="neon-pill w-fit">
            <Sparkles className="h-3.5 w-3.5" />
            Cổng khách hàng
          </span>
          <CardTitle className="pt-2 font-[var(--font-space-grotesk)] text-2xl leading-tight md:text-3xl">
            Đăng nhập để quản lý lịch rửa xe nhanh hơn.
          </CardTitle>
          <CardDescription className="text-sm">
            Một tài khoản cho toàn bộ nhu cầu: đặt lịch, thanh toán, theo dõi trạng thái và tra cứu lịch sử dịch vụ.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          {benefits.map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-lg border border-white/80 bg-white/82 px-3 py-2.5 text-slate-700">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{item}</span>
            </div>
          ))}

          <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3 text-cyan-800">
            <p className="font-medium">Mẹo:</p>
            <p className="mt-1 text-sm">Phiên đăng nhập sẽ tự hết hạn sau 5 phút để tăng bảo mật.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shine-border border-white/60 bg-white/92 shadow-xl">
        <CardHeader>
          <CardTitle>Đăng nhập</CardTitle>
          <CardDescription>Nhập email hoặc số điện thoại đã đăng ký.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="emailOrPhone">Tên đăng nhập / email / số điện thoại</Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="emailOrPhone"
                  type="text"
                  className="h-11 pl-9"
                  placeholder="admin hoặc user@email.com"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="h-11 pl-9 pr-10"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-2 rounded p-1 text-muted-foreground transition hover:bg-muted"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">Đăng nhập bằng session bảo mật ngắn hạn.</p>
              <Link href="/lookup" className="font-medium text-primary hover:underline">
                Tra cứu lịch hẹn
              </Link>
            </div>

            <Button type="submit" className="h-11 w-full" disabled={isPending}>
              {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
              <Link href="/dang-ky" className="text-primary hover:underline">
                Chưa có tài khoản? Đăng ký
              </Link>
              <Link href="/admin/login" className="text-muted-foreground hover:underline">
                Vào trang quản trị
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

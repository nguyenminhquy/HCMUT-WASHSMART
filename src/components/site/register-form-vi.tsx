"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { CheckCircle2, ShieldCheck, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const reasons = ["Tự động lưu lịch sử đặt lịch", "Nhận ưu đãi thành viên theo tháng", "Đặt nhiều xe trong một tài khoản"];

export function RegisterFormVi() {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setDone(false);

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fullName,
            phone,
            email,
            password,
            address
          })
        });

        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(data.error ?? "Không thể đăng ký tài khoản.");
        }

        setDone(true);

        const identifier = email.trim() || phone.trim();
        const loginResult = await signIn("credentials", {
          username: identifier,
          password,
          callbackUrl: "/",
          redirect: false
        });

        if (loginResult && !loginResult.error) {
          router.push(loginResult.url ?? "/");
          router.refresh();
          return;
        }
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Không thể đăng ký tài khoản.");
      }
    });
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[1fr,1fr]">
      <Card className="glass-shell hero-spotlight border-none">
        <CardHeader>
          <span className="neon-pill w-fit">
            <Star className="h-3.5 w-3.5" />
            Thành viên HCMUT-WASHSMART
          </span>
          <CardTitle className="pt-2 font-[var(--font-space-grotesk)] text-2xl md:text-3xl">Tạo tài khoản để đặt lịch trong vài chạm</CardTitle>
          <CardDescription className="text-sm">Đăng ký một lần, dùng lâu dài cho mọi nhu cầu rửa xe và chăm sóc nội thất.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          {reasons.map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-lg border border-white/80 bg-white/82 px-3 py-2.5">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
              <span>{item}</span>
            </div>
          ))}

          <p className="rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2.5 text-amber-800">
            Mẹo: sau khi đăng ký, bạn nên thêm biển số để hệ thống gợi ý gói dịch vụ phù hợp hơn.
          </p>
        </CardContent>
      </Card>

      <Card className="shine-border border-white/70 bg-white/92 shadow-xl">
        <CardHeader>
          <CardTitle>Đăng ký tài khoản</CardTitle>
          <CardDescription>Hoàn tất thông tin để bắt đầu sử dụng dịch vụ.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input id="fullName" className="h-11" placeholder="Nguyễn Văn A" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" className="h-11" placeholder="09xxxxxxxx" value={phone} onChange={(event) => setPhone(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" className="h-11" type="email" placeholder="you@email.com" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" className="h-11" type="password" placeholder="Tối thiểu 8 ký tự" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Địa chỉ (tuỳ chọn)</Label>
              <Input id="address" className="h-11" placeholder="Quận/Huyện - Tỉnh/Thành" value={address} onChange={(event) => setAddress(event.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="h-11 w-full sm:w-auto" disabled={isPending}>
                {isPending ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </Button>
            </div>
          </form>

          {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}

          {done ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              <p className="inline-flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4" /> Đăng ký thành công.
              </p>
              <p className="mt-1">
                Nếu chưa tự động đăng nhập, vui lòng <Link href="/dang-nhap" className="underline">đăng nhập</Link> để bắt đầu đặt lịch.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

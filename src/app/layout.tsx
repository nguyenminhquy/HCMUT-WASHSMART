import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Be_Vietnam_Pro, Space_Grotesk } from "next/font/google";
import { LayoutDashboard, LogOut, UserRound } from "lucide-react";

import { auth, signOut } from "@/auth";

import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam",
  weight: ["400", "500", "600", "700", "800"]
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "700"]
});

export const metadata: Metadata = {
  title: "HCMUT-WASHSMART | Đặt lịch rửa xe thông minh",
  description: "Nền tảng đặt lịch rửa xe, thanh toán và quản lý lịch hẹn hiện đại của HCMUT-WASHSMART.",
  icons: {
    icon: "/hcmut-logo.svg",
    shortcut: "/hcmut-logo.svg",
    apple: "/hcmut-logo.svg"
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user;
  const userLabel = user?.name ?? user?.email ?? "Người dùng";
  const isAdmin = Boolean(user?.isAdmin);

  const links = [
    { href: "/tram-rua-gan-ban", label: "Trạm gần bạn" },
    { href: "/lich-hen-cua-toi", label: "Lịch hẹn của tôi" },
    { href: "/dang-ky-rua-xe", label: "Đăng ký rửa xe" },
    { href: "/thanh-toan", label: "Thanh toán" },
    { href: "/dang-ky", label: "Đăng ký" },
    { href: "/admin", label: "Admin" }
  ];

  return (
    <html lang="vi">
      <body className={`${beVietnam.variable} ${spaceGrotesk.variable} flex min-h-screen flex-col font-[var(--font-be-vietnam)]`}>
        <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-2xl">
          <div className="container py-3">
            <div className="flex items-center justify-between gap-3">
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
                  <Image src="/hcmut-logo.svg" alt="Logo HCMUT" width={26} height={26} priority />
                </span>
                <span>
                  <span className="block font-[var(--font-space-grotesk)] text-lg font-bold tracking-tight">HCMUT-WASHSMART</span>
                  <span className="type-small block">Đặt lịch rửa xe thông minh</span>
                </span>
              </Link>

              <div className="hidden items-center gap-6 lg:flex">
                <nav className="flex items-center gap-4 text-sm">
                  {links.map((item) => (
                    <Link key={item.href} href={item.href} className="font-medium text-slate-700 transition hover:text-primary">
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {user ? (
                  <div className="flex items-center gap-2">
                    <div className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
                      <UserRound className="h-4 w-4 text-primary" />
                      <span className="max-w-[180px] truncate font-medium" title={userLabel}>
                        {userLabel}
                      </span>
                    </div>

                    {isAdmin ? (
                      <Link href="/admin" className="btn-secondary-ui btn-sm-ui">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    ) : null}

                    <form
                      action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/" });
                      }}
                    >
                      <button type="submit" className="btn-secondary-ui btn-sm-ui">
                        <LogOut className="h-4 w-4" />
                        Đăng xuất
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/dang-nhap" className="btn-secondary-ui btn-sm-ui">
                      Đăng nhập
                    </Link>
                    <Link href="/dang-ky-rua-xe" className="btn-primary-ui btn-sm-ui">
                      Đặt lịch
                    </Link>
                  </div>
                )}
              </div>

              {user ? (
                <div className="flex items-center gap-2 lg:hidden">
                  {isAdmin ? (
                    <Link href="/admin" className="btn-secondary-ui btn-sm-ui">
                      <LayoutDashboard className="h-4 w-4" />
                    </Link>
                  ) : null}
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/" });
                    }}
                  >
                    <button type="submit" className="btn-secondary-ui btn-sm-ui">
                      <LogOut className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center gap-2 lg:hidden">
                  <Link href="/dang-nhap" className="btn-secondary-ui btn-sm-ui">
                    Đăng nhập
                  </Link>
                  <Link href="/dang-ky-rua-xe" className="btn-primary-ui btn-sm-ui">
                    Đặt lịch
                  </Link>
                </div>
              )}
            </div>

            {user ? (
              <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/85 px-3 py-1.5 text-xs text-slate-700 lg:hidden">
                <UserRound className="h-3.5 w-3.5 text-primary" />
                <span className="max-w-[240px] truncate" title={userLabel}>
                  {userLabel}
                </span>
              </div>
            ) : null}

            <nav className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-sm lg:hidden">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="shrink-0 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-slate-700 transition hover:border-primary/50 hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="container flex-1 py-8 md:py-10">{children}</main>

        <footer className="border-t border-slate-200/80 bg-white/70">
          <div className="container grid gap-4 py-6 text-sm md:grid-cols-2">
            <div>
              <p className="font-[var(--font-space-grotesk)] text-base font-bold text-slate-900">HCMUT-WASHSMART</p>
              <p className="mt-1 text-slate-600">Nền tảng đặt lịch và quản lý dịch vụ rửa xe thông minh.</p>
            </div>
            <div className="space-y-1 text-slate-600 md:text-right">
              <p>Đơn vị vận hành: HCMUT-WASHSMART Co.</p>
              <p>Địa chỉ: 268 Lý Thường Kiệt, P.14, Q.10, TP.HCM</p>
              <p>Email: support@hcmut-washsmart.vn | Hotline: 1900 1234</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

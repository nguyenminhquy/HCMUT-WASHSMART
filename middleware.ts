import { NextResponse } from "next/server";

import { auth } from "@/auth";

export default auth((req) => {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const isAdmin = Boolean((req.auth?.user as { isAdmin?: boolean } | undefined)?.isAdmin);
    if (!isAdmin) {
      const loginUrl = new URL("/admin/login", req.nextUrl);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"]
};

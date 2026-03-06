import Link from "next/link";

import { auth, signOut } from "@/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const adminUser = session?.user;
  const isAdmin = Boolean(adminUser?.isAdmin);

  // Allow /admin/login to render without redirect loop.
  // Route protection is handled by middleware for /admin/* except /admin/login.
  if (!isAdmin || !adminUser) {
    return <>{children}</>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px,1fr]">
      <aside className="h-fit rounded-lg border bg-card p-4">
        <h2 className="mb-3 text-lg font-semibold">Admin</h2>
        <nav className="space-y-1 text-sm">
          <Link href="/admin" className="block rounded px-2 py-1 hover:bg-muted">
            Dashboard
          </Link>
          <Link href="/admin/bookings" className="block rounded px-2 py-1 hover:bg-muted">
            Bookings
          </Link>
          <Link href="/admin/branches" className="block rounded px-2 py-1 hover:bg-muted">
            Branches
          </Link>
          <Link href="/admin/services" className="block rounded px-2 py-1 hover:bg-muted">
            Services
          </Link>
        </nav>

        <div className="mt-4 border-t pt-3 text-xs text-muted-foreground">
          <p>{adminUser.email}</p>
          <p>ADMIN</p>
        </div>

        <form
          className="mt-3"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
        >
          <button type="submit" className="text-sm text-primary hover:underline">
            Sign out
          </button>
        </form>
      </aside>

      <section>{children}</section>
    </div>
  );
}

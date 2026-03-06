import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/admin/login-form";

type AdminLoginPageProps = {
  searchParams?: {
    callbackUrl?: string;
  };
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const session = await auth();
  if (session?.user?.isAdmin) {
    redirect(searchParams?.callbackUrl ?? "/admin");
  }

  return <LoginForm callbackUrl={searchParams?.callbackUrl} />;
}

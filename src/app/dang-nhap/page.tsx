import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginFormVi } from "@/components/site/login-form-vi";

export default async function DangNhapPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return <LoginFormVi />;
}

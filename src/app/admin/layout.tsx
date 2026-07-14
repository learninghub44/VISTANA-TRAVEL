import { redirect } from "next/navigation";
import { db } from "@/services/db";
import { getSession } from "@/services/auth/session";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/portal/login");
  }

  const profile = await db.getProfileById(session.sub);

  if (!profile || profile.role !== "admin") {
    // Defense in depth: re-check against the DB in case the account's role changed
    // or the account was deleted after the session token was issued.
    redirect("/portal/login");
  }

  return <AdminShell>{children}</AdminShell>;
}

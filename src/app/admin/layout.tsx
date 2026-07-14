import { redirect } from "next/navigation";
import { db } from "@/services/db";
import { getSession } from "@/services/auth/session";
import AdminShell, { type AdminMenuItem } from "@/components/admin/AdminShell";
import {
  LayoutDashboard,
  ClipboardList,
  Map,
  Compass,
  Hotel,
  Car,
  Users,
  UserCheck,
  Star,
  FileText,
  Quote,
  Handshake,
  HelpCircle,
  Images,
  Camera,
  Settings,
} from "lucide-react";

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

  const menuItems: AdminMenuItem[] = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Bookings", href: "/admin/bookings", icon: ClipboardList },
    { name: "Tours", href: "/admin/tours", icon: Compass },
    { name: "Destinations", href: "/admin/destinations", icon: Map },
    { name: "Hotels", href: "/admin/hotels", icon: Hotel },
    { name: "Vehicles", href: "/admin/vehicles", icon: Car },
    { name: "Guides", href: "/admin/guides", icon: UserCheck },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Blog Posts", href: "/admin/blog", icon: FileText },
    { name: "Testimonials", href: "/admin/testimonials", icon: Quote },
    { name: "Partners", href: "/admin/partners", icon: Handshake },
    { name: "FAQs", href: "/admin/faqs", icon: HelpCircle },
    { name: "Gallery", href: "/admin/gallery", icon: Images },
    { name: "Social Feed", href: "/admin/social", icon: Camera },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return <AdminShell menuItems={menuItems}>{children}</AdminShell>;
}

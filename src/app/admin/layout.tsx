import { redirect } from "next/navigation";
import { db } from "@/services/db";
import { getSession } from "@/services/auth/session";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  ClipboardList,
  MapPin,
  Map,
  Compass,
  Hotel,
  Car,
  Users,
  UserCheck,
  Star,
  FileText,
  Eye,
  LogOut,
  Quote,
  Handshake,
  HelpCircle,
  Images,
  Camera,
  Settings
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

  const menuItems = [
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

  return (
    <div
      style={{ colorScheme: "light" }}
      className="flex h-screen bg-slate-100 text-slate-800 transition-colors duration-200 overflow-hidden font-sans"
    >
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200/60 flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-slate-150 flex items-center justify-between shrink-0">
          <Link href="/admin" className="flex items-center space-x-2">
            <Compass className="h-6 w-6 text-gold-600" />
            <span className="font-serif text-lg font-bold tracking-wider text-slate-900">
              Vistana Admin
            </span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-grow p-4 overflow-y-auto space-y-1 custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-650 hover:bg-slate-50 hover:text-gold-600 transition-colors"
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-150 space-y-2 shrink-0">
          <Link
            href="/"
            className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-650 hover:bg-slate-50 transition-colors"
          >
            <Eye className="h-4.5 w-4.5 shrink-0 text-slate-450" />
            <span>View Public Site</span>
          </Link>
          <Link
            href="/portal"
            className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            <span>Exit Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden bg-slate-50">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/60 px-8 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Vistana Tours & Travel Operations Control
          </span>
          <div className="flex items-center space-x-3.5 text-xs text-slate-600">
            <span className="font-bold bg-gold-500/10 text-gold-700 px-3 py-1 rounded-full">
              Super Admin Active
            </span>
          </div>
        </header>

        {/* Content Children */}
        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}

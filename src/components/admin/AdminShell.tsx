"use client";

import { useState } from "react";
import Link from "next/link";
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
  Eye,
  LogOut,
  Menu,
  X,
} from "lucide-react";

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

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="p-6 border-b border-slate-150 flex items-center justify-between shrink-0">
        <Link
          href="/admin"
          className="flex items-center space-x-2"
          onClick={() => setMobileOpen(false)}
        >
          <Compass className="h-6 w-6 text-gold-600" />
          <span className="font-serif text-lg font-bold tracking-wider text-slate-900">
            Vistana Admin
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1 text-slate-500 hover:text-slate-800"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-grow p-4 overflow-y-auto space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
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
    </>
  );

  return (
    <div
      style={{ colorScheme: "light" }}
      className="flex h-screen bg-slate-100 text-slate-800 transition-colors duration-200 overflow-hidden font-sans"
    >
      {/* Desktop sidebar — always visible at md+ */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200/60 flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile drawer — off-canvas, toggled by hamburger button */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[80vw] bg-white border-r border-slate-200/60 flex flex-col shrink-0 h-full overflow-y-auto">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden bg-slate-50 min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/60 px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 shrink-0"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest truncate">
              Vistana Tours &amp; Travel Operations Control
            </span>
          </div>
          <div className="flex items-center space-x-3.5 text-xs text-slate-600 shrink-0">
            <span className="font-bold bg-gold-500/10 text-gold-700 px-3 py-1 rounded-full whitespace-nowrap">
              Super Admin Active
            </span>
          </div>
        </header>

        {/* Content Children */}
        <div className="flex-grow overflow-y-auto overflow-x-hidden p-4 md:p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}

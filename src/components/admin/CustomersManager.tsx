"use client";

import { useState } from "react";
import { Search, Mail, Phone, ShieldCheck, ShieldAlert, ClipboardList } from "lucide-react";
import { Profile, Booking } from "@/services/db/types";

interface CustomersManagerProps {
  customers: Profile[];
  bookings: Booking[];
}

export default function CustomersManager({ customers, bookings }: CustomersManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const bookingCount = (customerId: string) => bookings.filter((b) => b.customer_id === customerId).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-855 shadow-sm">
        <div className="relative flex items-center w-full sm:max-w-xs">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers by name or email..."
            className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 pl-9 pr-4 text-xs outline-none text-slate-850 dark:text-slate-200"
          />
        </div>
        <span className="text-xs font-bold text-slate-450 dark:text-slate-500 shrink-0">
          {filtered.length} customer{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-850 rounded-2xl p-10 text-center text-xs text-slate-450 dark:text-slate-500">
          No customer accounts yet.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-955/20 text-left text-slate-450 dark:text-slate-500 uppercase text-[10px] font-bold">
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-5">Contact</th>
                <th className="py-3 px-5">Verified</th>
                <th className="py-3 px-5">Bookings</th>
                <th className="py-3 px-5">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-955/10 transition-colors">
                  <td className="py-3 px-5 font-bold text-slate-800 dark:text-slate-200">{c.name}</td>
                  <td className="py-3 px-5">
                    <div className="flex flex-col space-y-1 text-slate-500 dark:text-slate-400">
                      <span className="flex items-center space-x-1.5">
                        <Mail className="h-3 w-3" />
                        <span>{c.email}</span>
                      </span>
                      {c.phone && (
                        <span className="flex items-center space-x-1.5">
                          <Phone className="h-3 w-3" />
                          <span>{c.phone}</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-5">
                    {c.email_verified ? (
                      <span className="flex items-center space-x-1 text-emerald-700 dark:text-emerald-400 font-bold">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-amber-700 dark:text-amber-500 font-bold">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>Unverified</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-5">
                    <span className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300 font-bold">
                      <ClipboardList className="h-3.5 w-3.5" />
                      <span>{bookingCount(c.id)}</span>
                    </span>
                  </td>
                  <td className="py-3 px-5 text-slate-450">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

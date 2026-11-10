import Link from "next/link";
import { Target, CalendarCheck, Inbox, ClipboardList, Star, CheckCircle2 } from "lucide-react";

export interface AttentionCounts {
  newLeads: number;
  requestedMeetings: number;
  newInquiries: number;
  pendingBookings: number;
  pendingReviews: number;
}

/** "What needs me today?" — one glance, one click to each queue. */
export default function AttentionPanel({ counts }: { counts: AttentionCounts }) {
  const items = [
    { label: "New leads", n: counts.newLeads, href: "/admin/leads", icon: Target },
    { label: "Booking requests", n: counts.pendingBookings, href: "/admin/bookings", icon: ClipboardList },
    { label: "Meeting requests", n: counts.requestedMeetings, href: "/admin/meetings", icon: CalendarCheck },
    { label: "New inquiries", n: counts.newInquiries, href: "/admin/inquiries", icon: Inbox },
    { label: "Reviews to approve", n: counts.pendingReviews, href: "/admin/reviews", icon: Star },
  ];
  const total = items.reduce((s, i) => s + i.n, 0);

  return (
    <section aria-label="Needs attention" className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/40 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-lg font-bold text-slate-900">Needs your attention</h2>
        {total === 0 && <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> All caught up</span>}
      </div>
      <ul className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {items.map(({ label, n, href, icon: Icon }) => (
          <li key={label}>
            <Link href={href} className={`block rounded-2xl p-4 border transition-colors ${n > 0 ? "border-gold/40 bg-gold/5 hover:bg-gold/10" : "border-slate-100 bg-slate-50 hover:bg-slate-100"}`}>
              <Icon className={`h-4 w-4 mb-2 ${n > 0 ? "text-gold-700" : "text-slate-400"}`} />
              <p className={`text-2xl font-extrabold ${n > 0 ? "text-slate-900" : "text-slate-400"}`}>{n}</p>
              <p className="text-[11px] font-semibold text-slate-500">{label}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

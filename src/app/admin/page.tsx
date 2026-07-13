import { db } from "@/services/db";
import Link from "next/link";
import { ClipboardList, Compass, Users, DollarSign, Calendar, TrendingUp, Wallet } from "lucide-react";
import {
  RevenueTrendChart,
  BookingStatusChart,
  DestinationsBarChart,
  BookingsVolumeChart,
} from "@/components/admin/DashboardCharts";

export default async function AdminDashboardPage() {
  const bookings = await db.getBookings();
  const tours = await db.getTours();
  const destinations = await db.getDestinations();
  const profiles = await db.getProfiles();

  // Metrics
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "Pending").length;
  const confirmedBookings = bookings.filter((b) => b.status === "Confirmed").length;
  const customerCount = profiles.filter((p) => p.role === "customer").length;

  // Calculate revenue
  const totalRevenue = bookings
    .filter((b) => b.status === "Paid" || b.status === "Completed")
    .reduce((sum, b) => sum + b.total_price, 0);

  const projectedRevenue = bookings
    .filter((b) => b.status !== "Cancelled" && b.status !== "Refunded")
    .reduce((sum, b) => sum + b.total_price, 0);

  const avgBookingValue = totalBookings > 0
    ? Math.round(bookings.reduce((sum, b) => sum + b.total_price, 0) / totalBookings)
    : 0;

  // Count bookings by destination to create a popularity list
  const destPopularityMap: Record<string, number> = {};
  bookings.forEach((b) => {
    const tour = tours.find((t) => t.id === b.tour_id);
    if (tour) {
      const dest = destinations.find((d) => d.id === tour.destination_id);
      if (dest) {
        destPopularityMap[dest.name] = (destPopularityMap[dest.name] || 0) + 1;
      }
    }
  });

  const destPopularityList = Object.entries(destPopularityMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Booking status breakdown for the donut chart
  const statusOrder: string[] = ["Pending", "Awaiting Payment", "Confirmed", "Paid", "Completed", "Cancelled", "Refunded"];
  const statusCounts: Record<string, number> = {};
  bookings.forEach((b) => {
    statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
  });
  const statusChartData = statusOrder
    .filter((s) => statusCounts[s] > 0)
    .map((s) => ({ name: s, value: statusCounts[s] }));

  // Last 6 months of revenue + booking volume
  const now = new Date();
  const monthlyBuckets: { key: string; label: string; revenue: number; bookings: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyBuckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString("en-US", { month: "short" }),
      revenue: 0,
      bookings: 0,
    });
  }
  bookings.forEach((b) => {
    const d = new Date(b.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = monthlyBuckets.find((m) => m.key === key);
    if (bucket) {
      bucket.bookings += 1;
      if (b.status === "Paid" || b.status === "Completed") {
        bucket.revenue += b.total_price;
      }
    }
  });
  const revenueTrendData = monthlyBuckets.map((m) => ({ month: m.label, revenue: m.revenue, bookings: m.bookings }));
  const bookingsVolumeData = monthlyBuckets.map((m) => ({ month: m.label, bookings: m.bookings }));

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/20",
      Confirmed: "text-blue-650 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400 border-blue-205/20",
      "Awaiting Payment": "text-purple-650 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400 border-purple-205/20",
      Paid: "text-emerald-650 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-205/20",
      Completed: "text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-350 border-slate-700/20",
      Cancelled: "text-red-650 bg-red-50 dark:bg-red-950/20 dark:text-red-400 border-red-205/20",
    };
    return colors[status] || "text-slate-500 bg-slate-50 border-slate-200/20";
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">
          Real-time metrics, booking trends, and East African operations.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bookings */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-850 shadow-sm flex items-center justify-between">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-emerald-500/5" />
          <div className="space-y-1 relative">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Bookings</span>
            <span className="block font-serif text-2xl font-bold text-slate-900 dark:text-white">{totalBookings}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 relative">
            <ClipboardList className="h-6 w-6" />
          </div>
        </div>

        {/* Pending Action */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-850 shadow-sm flex items-center justify-between">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-amber-500/5" />
          <div className="space-y-1 relative">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Awaiting Confirmation</span>
            <span className="block font-serif text-2xl font-bold text-amber-600 dark:text-amber-500">{pendingBookings}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 relative">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        {/* Confirmed Trips */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-850 shadow-sm flex items-center justify-between">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-blue-500/5" />
          <div className="space-y-1 relative">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Confirmed Safaris</span>
            <span className="block font-serif text-2xl font-bold text-blue-600 dark:text-blue-500">{confirmedBookings}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 relative">
            <Compass className="h-6 w-6" />
          </div>
        </div>

        {/* Revenue */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-850 shadow-sm flex items-center justify-between">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-emerald-500/5" />
          <div className="space-y-1 relative">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Realized Revenue</span>
            <span className="block font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-450">${totalRevenue.toLocaleString()}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 relative">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Secondary Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-black p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pipeline Value</span>
            <span className="block font-serif text-xl font-bold text-white">${projectedRevenue.toLocaleString()}</span>
          </div>
          <TrendingUp className="h-8 w-8 text-emerald-400" />
        </div>
        <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-850 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Avg. Booking Value</span>
            <span className="block font-serif text-xl font-bold text-purple-600 dark:text-purple-400">${avgBookingValue.toLocaleString()}</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Wallet className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-850 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Registered Customers</span>
            <span className="block font-serif text-xl font-bold text-pink-600 dark:text-pink-400">{customerCount}</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RevenueTrendChart data={revenueTrendData} />
        </div>
        <BookingStatusChart data={statusChartData} />
        <DestinationsBarChart data={destPopularityList} />
        <div className="lg:col-span-2">
          <BookingsVolumeChart data={bookingsVolumeData} />
        </div>
      </div>

      {/* Recent Activity Bookings list */}
      <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-850 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850">
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">Recent Booking Requests</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Manage and check pending passenger entries.</p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold py-1.5 px-4 rounded-full transition-all dark:text-emerald-450 dark:bg-emerald-950/20"
          >
            Manage Bookings
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="pb-3.5 pl-2 font-bold uppercase tracking-wider">Booking ID</th>
                <th className="pb-3.5 font-bold uppercase tracking-wider">Customer</th>
                <th className="pb-3.5 font-bold uppercase tracking-wider">Tour</th>
                <th className="pb-3.5 font-bold uppercase tracking-wider">Total Price</th>
                <th className="pb-3.5 font-bold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map((booking) => {
                const tour = tours.find((t) => t.id === booking.tour_id);
                const cust = profiles.find((p) => p.id === booking.customer_id);
                return (
                  <tr
                    key={booking.id}
                    className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-850/20"
                  >
                    <td className="py-3.5 pl-2 font-mono font-bold">{booking.id}</td>
                    <td className="py-3.5 font-medium text-slate-700 dark:text-slate-300">
                      {cust ? cust.name : "Guest Explorer"}
                    </td>
                    <td className="py-3.5 max-w-[150px] truncate text-slate-700 dark:text-slate-300" title={tour?.title}>
                      {tour ? tour.title : "Unknown Tour"}
                    </td>
                    <td className="py-3.5 font-bold text-amber-700 dark:text-amber-500">
                      ${booking.total_price.toLocaleString()}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 italic">
                    No booking records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

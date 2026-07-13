import { redirect } from "next/navigation";
import { db } from "@/services/db";
import { getSession } from "@/services/auth/session";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookingsList from "@/components/portal/BookingsList";
import { User, Mail, Phone, Compass, MapPin, ClipboardList } from "lucide-react";

export default async function CustomerPortalPage() {
  const session = await getSession();

  if (!session) {
    redirect("/portal/login");
  }

  const profile = await db.getProfileById(session.sub);

  if (!profile) {
    redirect("/portal/login");
  }

  // Fetch lists
  const bookings = await db.getBookingsByCustomer(profile.id);
  const tours = await db.getTours();
  const guides = await db.getGuides();
  const vehicles = await db.getVehicles();

  // Metrics
  const activeCount = bookings.filter((b) => b.status === "Confirmed" || b.status === "Paid" || b.status === "Pending").length;
  const totalSpend = bookings
    .filter((b) => b.status === "Paid" || b.status === "Completed")
    .reduce((sum, b) => sum + b.total_price, 0);

  return (
    <>
      <Navbar />

      {/* Header Profile Dashboard */}
      <section className="bg-slate-900 text-white pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-emerald-950/15" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 text-center md:text-left">
            {/* Avatar Mock */}
            <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-3xl font-serif font-bold text-white shadow-lg mb-4 md:mb-0 shrink-0 select-none">
              {profile.name[0]}
            </div>

            <div className="space-y-2 flex-grow">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Customer Account</span>
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold">{profile.name}</h1>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-y-2 gap-x-6 text-xs text-slate-300">
                <span className="flex items-center space-x-1.5">
                  <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{profile.email}</span>
                </span>
                {profile.phone && (
                  <span className="flex items-center space-x-1.5">
                    <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{profile.phone}</span>
                  </span>
                )}
                <span className="flex items-center space-x-1.5">
                  <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>East Africa Explorer</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bookings & History Section */}
      <section className="py-16 bg-slate-50 dark:bg-[#070a12] min-h-[60vh] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Left Metrics Cards */}
            <aside className="space-y-6">
              {/* Account Quick Stats */}
              <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-slate-800 dark:text-slate-205 flex items-center space-x-1.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <ClipboardList className="h-5 w-5 text-emerald-500" />
                  <span>Trip Statistics</span>
                </h3>
                
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Total Bookings</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{bookings.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Active / Pending</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{activeCount}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800/50">
                    <span className="text-slate-400 font-medium">Total Invested</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">${totalSpend.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Support Panel */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 text-center border border-slate-850">
                <Compass className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
                <h4 className="font-bold text-xs text-slate-100">Need Assistance?</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                  Have questions about travel requirements, visas, vaccinations, or want to make customized changes to your safari itinerary?
                </p>
                <a
                  href="/contact"
                  className="mt-4 block text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition-all uppercase tracking-wider"
                >
                  Contact Concierge
                </a>
              </div>
            </aside>

            {/* Main Bookings Grid */}
            <main className="lg:col-span-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6">Your Safari Bookings</h2>
              <BookingsList
                bookings={bookings}
                tours={tours}
                guides={guides}
                vehicles={vehicles}
              />
            </main>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}

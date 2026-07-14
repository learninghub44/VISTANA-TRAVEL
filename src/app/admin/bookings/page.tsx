import { db } from "@/services/db";
import BookingsManager from "@/components/admin/BookingsManager";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await db.getBookings();
  const tours = await db.getTours();
  const guides = await db.getGuides();
  const vehicles = await db.getVehicles();
  const profiles = await db.getProfiles();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">Booking Management</h1>
        <p className="text-xs text-slate-450 mt-1">
          Allocate guides, assign vehicles, print confirmations, and update booking states.
        </p>
      </div>
      <BookingsManager
        bookings={bookings}
        tours={tours}
        guides={guides}
        vehicles={vehicles}
        profiles={profiles}
      />
    </div>
  );
}

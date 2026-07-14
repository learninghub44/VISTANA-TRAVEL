import { db } from "@/services/db";
import CustomersManager from "@/components/admin/CustomersManager";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const allProfiles = await db.getProfiles();
  const customers = allProfiles.filter((p) => p.role === "customer");
  const bookings = await db.getBookings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">Customer Directory</h1>
        <p className="text-xs text-slate-450 mt-1">
          View registered customer accounts and their booking activity.
        </p>
      </div>
      <CustomersManager customers={customers} bookings={bookings} />
    </div>
  );
}

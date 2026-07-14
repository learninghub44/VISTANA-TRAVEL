import { db } from "@/services/db";
import HotelsManager from "@/components/admin/HotelsManager";

export const dynamic = "force-dynamic";

export default async function AdminHotelsPage() {
  const hotels = await db.getHotels();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Hotel Management</h1>
        <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">
          Manage partner hotels, room types, pricing, and amenities.
        </p>
      </div>
      <HotelsManager hotels={hotels} />
    </div>
  );
}

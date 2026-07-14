import { db } from "@/services/db";
import ToursManager from "@/components/admin/ToursManager";

export const dynamic = "force-dynamic";

export default async function AdminToursPage() {
  const tours = await db.getTours();
  const destinations = await db.getDestinations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">Tour Management</h1>
        <p className="text-xs text-slate-450 mt-1">
          Create, edit, delete, and structure luxury tour packages and prices.
        </p>
      </div>
      <ToursManager tours={tours} destinations={destinations} />
    </div>
  );
}

import { db } from "@/services/db";
import DestinationsManager from "@/components/admin/DestinationsManager";

export const dynamic = "force-dynamic";

export default async function AdminDestinationsPage() {
  const destinations = await db.getDestinations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">Destination Management</h1>
        <p className="text-xs text-slate-450 mt-1">
          Add, edit, delete, and manage attractions, climate weather, and guidelines.
        </p>
      </div>
      <DestinationsManager destinations={destinations} />
    </div>
  );
}

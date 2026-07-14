import { db } from "@/services/db";
import VehiclesManager from "@/components/admin/VehiclesManager";

export const dynamic = "force-dynamic";

export default async function AdminVehiclesPage() {
  const vehicles = await db.getVehicles();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">Vehicle Management</h1>
        <p className="text-xs text-slate-450 mt-1">
          Manage the fleet used for tour transport and driver assignments.
        </p>
      </div>
      <VehiclesManager vehicles={vehicles} />
    </div>
  );
}

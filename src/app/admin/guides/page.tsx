import { db } from "@/services/db";
import GuidesManager from "@/components/admin/GuidesManager";

export default async function AdminGuidesPage() {
  const guides = await db.getGuides();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Guide Management</h1>
        <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">
          Manage resident guides and naturalists available for bookings.
        </p>
      </div>
      <GuidesManager guides={guides} />
    </div>
  );
}

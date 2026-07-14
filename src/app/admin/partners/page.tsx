import { db } from "@/services/db";
import PartnersManager from "@/components/admin/PartnersManager";

export const dynamic = "force-dynamic";

export default async function AdminPartnersPage() {
  const partners = await db.getPartners();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Partner Management</h1>
        <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">
          Add, edit, and delete partner and compliance logos shown on the homepage.
        </p>
      </div>
      <PartnersManager partners={partners} />
    </div>
  );
}

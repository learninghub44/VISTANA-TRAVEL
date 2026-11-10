import { db } from "@/services/db";
import LeadsManager from "@/components/admin/LeadsManager";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await db.getLeads();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">Leads</h1>
        <p className="text-xs text-slate-450 mt-1">
          Everyone who got in touch — contact form, newsletter, meeting and quote requests — in one place, one row per person.
        </p>
      </div>
      <LeadsManager leads={leads} />
    </div>
  );
}

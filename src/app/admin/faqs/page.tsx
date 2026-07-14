import { db } from "@/services/db";
import FaqManager from "@/components/admin/FaqManager";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  const faqs = await db.getFaqs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">FAQ Management</h1>
        <p className="text-xs text-slate-450 mt-1">
          Add, edit, and delete frequently asked questions shown on the homepage.
        </p>
      </div>
      <FaqManager faqs={faqs} />
    </div>
  );
}

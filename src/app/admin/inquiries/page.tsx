import { db } from "@/services/db";
import InquiriesManager from "@/components/admin/InquiriesManager";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const inquiries = await db.getInquiries();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">Customer Inquiries</h1>
        <p className="text-xs text-slate-450 mt-1">
          Messages sent through the website contact form. Reply by email, then mark them as replied.
        </p>
      </div>
      <InquiriesManager inquiries={inquiries} />
    </div>
  );
}

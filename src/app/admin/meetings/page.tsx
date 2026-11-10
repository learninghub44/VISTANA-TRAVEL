import { db } from "@/services/db";
import MeetingsManager from "@/components/admin/MeetingsManager";

export const dynamic = "force-dynamic";

export default async function AdminMeetingsPage() {
  const meetings = await db.getMeetings();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">Meeting Requests</h1>
        <p className="text-xs text-slate-450 mt-1">Calls and visits requested through the AI planner. Times are East Africa Time. Email the customer, then confirm.</p>
      </div>
      <MeetingsManager meetings={meetings} />
    </div>
  );
}

import { db } from "@/services/db";
import { getVerifiedSession } from "@/services/auth/session";
import TeamManager from "@/components/admin/TeamManager";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const [profiles, verified] = await Promise.all([db.getProfiles(), getVerifiedSession()]);
  const admins = profiles
    .filter((p) => p.role === "admin")
    .map((p) => ({ id: p.id, name: p.name, email: p.email, created_at: p.created_at }));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">Team &amp; Admin Access</h1>
        <p className="text-xs text-slate-450 mt-1">Admins can manage everything on this site. Only people who already have a verified account can be added.</p>
      </div>
      <TeamManager admins={admins} currentUserId={verified?.profile.id ?? ""} />
    </div>
  );
}

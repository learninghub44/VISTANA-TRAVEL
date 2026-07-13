import { db } from "@/services/db";
import SettingsManager from "@/components/admin/SettingsManager";

export default async function AdminSettingsPage() {
  const settings = await db.getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">
          Manage site-wide configuration, including social media links.
        </p>
      </div>
      <SettingsManager settings={settings} />
    </div>
  );
}

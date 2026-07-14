"use client";

import { useState } from "react";
import { saveSiteSettingsAction } from "@/app/actions";
import { SiteSettings } from "@/services/db/types";
import { Globe, Camera, AtSign, Music2, Play, Briefcase, MessageCircle, Save, CheckCircle2 } from "lucide-react";

interface SettingsManagerProps {
  settings: SiteSettings;
}

const FIELDS: {
  key: keyof Pick<
    SiteSettings,
    "facebook_url" | "instagram_url" | "twitter_url" | "tiktok_url" | "youtube_url" | "linkedin_url" | "whatsapp_number"
  >;
  label: string;
  placeholder: string;
  icon: React.ElementType;
}[] = [
  { key: "facebook_url", label: "Facebook", placeholder: "https://facebook.com/vistanatravel", icon: Globe },
  { key: "instagram_url", label: "Instagram", placeholder: "https://instagram.com/vistanatravel", icon: Camera },
  { key: "twitter_url", label: "Twitter / X", placeholder: "https://x.com/vistanatravel", icon: AtSign },
  { key: "tiktok_url", label: "TikTok", placeholder: "https://tiktok.com/@vistanatravel", icon: Music2 },
  { key: "youtube_url", label: "YouTube", placeholder: "https://youtube.com/@vistanatravel", icon: Play },
  { key: "linkedin_url", label: "LinkedIn", placeholder: "https://linkedin.com/company/vistanatravel", icon: Briefcase },
  { key: "whatsapp_number", label: "WhatsApp Number", placeholder: "+254700000000", icon: MessageCircle },
];

export default function SettingsManager({ settings }: SettingsManagerProps) {
  const [form, setForm] = useState<SiteSettings>(settings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleChange = (key: keyof SiteSettings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    const res = await saveSiteSettingsAction({
      facebook_url: form.facebook_url || undefined,
      instagram_url: form.instagram_url || undefined,
      twitter_url: form.twitter_url || undefined,
      tiktok_url: form.tiktok_url || undefined,
      youtube_url: form.youtube_url || undefined,
      linkedin_url: form.linkedin_url || undefined,
      whatsapp_number: form.whatsapp_number || undefined,
    });

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to save settings.");
    } else {
      setSaved(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-850 shadow-sm space-y-6 max-w-2xl">
      <div>
        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">Social Media Links</h3>
        <p className="text-[10px] text-slate-400 mt-0.5">
          These links power the icons in the site footer. Leave a field blank to hide that icon.
        </p>
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 border border-red-200/40 dark:border-red-900/40 rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {FIELDS.map(({ key, label, placeholder, icon: Icon }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 text-gold-600 dark:text-gold-400" />
              {label}
            </label>
            <input
              type="text"
              value={(form[key] as string) || ""}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={placeholder}
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-gold-600 hover:bg-gold-700 disabled:opacity-60 text-white text-xs font-bold py-2.5 px-6 rounded-full transition-all"
        >
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : "Save Settings"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </form>
  );
}

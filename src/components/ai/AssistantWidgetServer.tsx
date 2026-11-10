import { cachedDb } from "@/services/db/cached";
import AssistantLauncher from "@/components/ai/AssistantLauncher";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/whatsapp";

// Same fallback number the Contact page already uses when none is saved in settings.
const FALLBACK_WHATSAPP = "254701059192";

// Rendered in the ROOT layout, so it runs on every page. It must never throw:
// if settings can't be loaded we fall back to the default number.
export default async function AssistantWidgetServer() {
  const settings = await cachedDb.getSiteSettings().catch(() => null);
  const number = normalizeWhatsAppNumber(settings?.whatsapp_number) ?? FALLBACK_WHATSAPP;

  return (
    <>
      <WhatsAppFloat number={number} />
      <AssistantLauncher whatsappHref={buildWhatsAppUrl(number)} />
    </>
  );
}

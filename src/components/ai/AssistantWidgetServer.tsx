import { cachedDb } from "@/services/db/cached";
import AssistantWidget from "@/components/ai/AssistantWidget";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/whatsapp";

// Rendered in the ROOT layout, so it runs on every page. It must never throw:
// if settings can't be loaded the widgets simply omit the WhatsApp shortcuts.
export default async function AssistantWidgetServer() {
  const settings = await cachedDb.getSiteSettings().catch(() => null);
  const number = normalizeWhatsAppNumber(settings?.whatsapp_number);

  return (
    <>
      <WhatsAppFloat number={number} />
      <AssistantWidget whatsappHref={buildWhatsAppUrl(number)} />
    </>
  );
}

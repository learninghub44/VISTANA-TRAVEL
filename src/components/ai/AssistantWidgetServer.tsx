import { cachedDb } from "@/services/db/cached";
import AssistantWidget from "@/components/ai/AssistantWidget";

// Rendered in the ROOT layout, so it runs on every page. It must never throw:
// if settings can't be loaded the widget simply omits the WhatsApp shortcut.
export default async function AssistantWidgetServer() {
  const settings = await cachedDb.getSiteSettings().catch(() => null);
  const whatsappHref = settings?.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, "")}`
    : null;

  return <AssistantWidget whatsappHref={whatsappHref} />;
}

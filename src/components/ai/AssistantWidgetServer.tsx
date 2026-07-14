import { db } from "@/services/db";
import AssistantWidget from "@/components/ai/AssistantWidget";

export default async function AssistantWidgetServer() {
  const settings = await db.getSiteSettings();
  const whatsappHref = settings.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, "")}`
    : null;

  return <AssistantWidget whatsappHref={whatsappHref} />;
}

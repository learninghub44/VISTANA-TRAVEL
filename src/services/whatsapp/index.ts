export interface WhatsAppMessageOptions {
  phone: string;
  templateName: string;
  parameters: Record<string, string>;
}

class WhatsAppNotificationService {
  private isEnabled: boolean = false; // Disabled by default as requested

  async sendNotification(options: WhatsAppMessageOptions): Promise<boolean> {
    const logPrefix = `[Vistana WhatsApp Service ${this.isEnabled ? "ACTIVE" : "DISABLED"}]`;
    console.log(`${logPrefix} Preparing message to ${options.phone} using template '${options.templateName}'`);
    console.log(`${logPrefix} Template Parameters:`, options.parameters);
    
    if (!this.isEnabled) {
      console.log(`${logPrefix} Message logged to console. To enable, configure Twilio or WhatsApp Business API credentials.`);
      return true;
    }
    
    // Future integration steps with Twilio / WhatsApp Business API:
    // try {
    //   const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    //   await client.messages.create({
    //     from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    //     to: `whatsapp:${options.phone}`,
    //     body: this.formatTemplate(options.templateName, options.parameters)
    //   });
    //   return true;
    // } catch(e) {
    //   console.error("WhatsApp Send Failed", e);
    //   return false;
    // }
    return true;
  }

  // High-level triggers
  async notifyBookingRequest(booking: any, tour: any, customerPhone: string, customerName: string) {
    return this.sendNotification({
      phone: customerPhone,
      templateName: "booking_request_received",
      parameters: {
        customer_name: customerName,
        booking_id: booking.id,
        tour_title: tour.title,
        amount: `$${booking.total_price.toLocaleString()}`,
        start_date: booking.start_date
      }
    });
  }

  async notifyBookingStatusChanged(booking: any, tour: any, customerPhone: string, customerName: string) {
    return this.sendNotification({
      phone: customerPhone,
      templateName: "booking_status_update",
      parameters: {
        customer_name: customerName,
        booking_id: booking.id,
        tour_title: tour.title,
        status: booking.status,
        date: booking.start_date
      }
    });
  }
}

export const whatsapp = new WhatsAppNotificationService();
export type { WhatsAppNotificationService };

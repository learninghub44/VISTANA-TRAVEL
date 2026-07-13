export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface EmailProvider {
  sendEmail(options: EmailOptions): Promise<boolean>;
}

class ConsoleEmailProvider implements EmailProvider {
  async sendEmail(options: EmailOptions): Promise<boolean> {
    console.log("=========================================");
    console.log(`[Vistana Email Dev Mode] Sending Email:`);
    console.log(`TO:      ${options.to}`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log(`BODY:`);
    console.log(options.html.replace(/<[^>]*>/g, " ").trim()); // strip tags for clean console display
    console.log("=========================================");
    return true;
  }
}

class ResendEmailProvider implements EmailProvider {
  async sendEmail(options: EmailOptions): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[Vistana Email] RESEND_API_KEY not set. Falling back to Console Logger.");
      return new ConsoleEmailProvider().sendEmail(options);
    }
    
    try {
      // Dynamically fetch to avoid node-fetch or Resend import issues
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: "Vistana Tours <noreply@vistanatours.com>",
          to: [options.to],
          subject: options.subject,
          html: options.html,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("[Vistana Email] Resend API Error:", errorData);
        return false;
      }
      
      return true;
    } catch (e) {
      console.error("[Vistana Email] Failed to send email via Resend:", e);
      return false;
    }
  }
}

export const email: EmailProvider = process.env.RESEND_API_KEY ? new ResendEmailProvider() : new ConsoleEmailProvider();

// High level email sending functions
export async function sendBookingConfirmationEmail(booking: any, tour: any, customerEmail: string, customerName: string) {
  const subject = `Booking Confirmation - Vistana Tours & Travel (${booking.id})`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #064e3b; margin-top: 0;">Vistana Tours & Travel</h2>
      <p>Dear <strong>${customerName}</strong>,</p>
      <p>Thank you for booking with Vistana. Your booking request for <strong>${tour.title}</strong> has been received!</p>
      
      <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #166534;">Booking Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; color: #666;">Booking ID:</td>
            <td style="padding: 4px 0; font-weight: bold;">${booking.id}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #666;">Tour:</td>
            <td style="padding: 4px 0;">${tour.title}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #666;">Travel Date:</td>
            <td style="padding: 4px 0;">${booking.start_date} to ${booking.end_date}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #666;">Travelers:</td>
            <td style="padding: 4px 0;">${booking.adults} Adults, ${booking.children} Children</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #666;">Total Price:</td>
            <td style="padding: 4px 0; color: #b45309; font-weight: bold;">$${booking.total_price.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #666;">Status:</td>
            <td style="padding: 4px 0; font-weight: bold; color: #d97706;">Pending Confirmation</td>
          </tr>
        </table>
      </div>
      
      <p>An administrator is currently reviewing your booking and checking resource availability (guide and safari vehicle). You will receive another notification once confirmed.</p>
      <p>If you have any questions, you can reply directly to this email or contact us via WhatsApp.</p>
      <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Vistana Tours & Travel. All rights reserved.</p>
    </div>
  `;
  
  return email.sendEmail({ to: customerEmail, subject, html });
}

export async function sendBookingStatusUpdateEmail(booking: any, tour: any, customerEmail: string, customerName: string) {
  const subject = `Booking Update - Vistana Tours & Travel (${booking.id})`;
  const statusColors: Record<string, string> = {
    Confirmed: "#166534",
    Cancelled: "#991b1b",
    Paid: "#166534",
    Completed: "#1e3a8a",
  };
  const color = statusColors[booking.status] || "#d97706";
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #064e3b; margin-top: 0;">Vistana Tours & Travel</h2>
      <p>Dear <strong>${customerName}</strong>,</p>
      <p>Your booking for <strong>${tour.title}</strong> has been updated.</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${color};">
        <p style="margin: 0; font-size: 16px;">New Status: <strong style="color: ${color};">${booking.status}</strong></p>
        <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Booking ID: ${booking.id}</p>
      </div>

      ${booking.status === "Confirmed" ? `
        <p>Your adventure is officially locked in! We have assigned your professional tour guide and vehicle details. You can view full details in your customer portal.</p>
      ` : ""}
      
      <p>Log in to your customer portal to view the full itinerary, download your booking confirmation PDF, or manage your travel details.</p>
      <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Vistana Tours & Travel. All rights reserved.</p>
    </div>
  `;
  
  return email.sendEmail({ to: customerEmail, subject, html });
}

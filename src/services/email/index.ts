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

// Resolved lazily (per call) rather than once at module load — same
// Workers/OpenNext env-timing concern as src/services/db/supabaseDb.ts.
// ResendEmailProvider also re-checks the key at call time and falls back to
// ConsoleEmailProvider itself, so this was never a hard failure like the DB
// case, but a stale top-level read could still silently downgrade real
// emails to console logging in production.
export const email: EmailProvider = {
  sendEmail: (options) =>
    (process.env.RESEND_API_KEY ? new ResendEmailProvider() : new ConsoleEmailProvider()).sendEmail(options),
};

// User-controlled strings (names, tour titles, messages) are interpolated into
// HTML emails below. Without escaping, a customer registering with a name like
// `<a href="https://evil">Click to confirm</a>` gets that markup injected into
// mail sent from OUR domain — a ready-made phishing vector.
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// High level email sending functions
export async function sendBookingConfirmationEmail(booking: any, tour: any, customerEmail: string, customerName: string) {
  const subject = `Booking Confirmation - Vistana Tours & Travel (${booking.id})`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #064e3b; margin-top: 0;">Vistana Tours & Travel</h2>
      <p>Dear <strong>${escapeHtml(customerName)}</strong>,</p>
      <p>Thank you for booking with Vistana. Your booking request for <strong>${escapeHtml(tour.title)}</strong> has been received!</p>
      
      <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #166534;">Booking Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; color: #666;">Booking ID:</td>
            <td style="padding: 4px 0; font-weight: bold;">${escapeHtml(booking.id)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #666;">Tour:</td>
            <td style="padding: 4px 0;">${escapeHtml(tour.title)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #666;">Travel Date:</td>
            <td style="padding: 4px 0;">${escapeHtml(booking.start_date)} to ${escapeHtml(booking.end_date)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #666;">Travelers:</td>
            <td style="padding: 4px 0;">${escapeHtml(booking.adults)} Adults, ${escapeHtml(booking.children)} Children</td>
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

export async function sendVerificationEmail(customerEmail: string, customerName: string, token: string) {
  const verifyUrl = `${(process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "")}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  const subject = "Verify your email - Vistana Tours & Travel";
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #064e3b; margin-top: 0;">Vistana Tours & Travel</h2>
      <p>Dear <strong>${escapeHtml(customerName)}</strong>,</p>
      <p>Thanks for creating an account with Vistana. Please confirm your email address to activate your account.</p>
      <p style="margin: 24px 0;">
        <a href="${verifyUrl}" style="background-color: #064e3b; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Verify Email Address</a>
      </p>
      <p style="font-size: 12px; color: #999;">If the button doesn't work, copy this link into your browser: ${verifyUrl}</p>
      <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Vistana Tours & Travel. All rights reserved.</p>
    </div>
  `;
  return email.sendEmail({ to: customerEmail, subject, html });
}

export async function sendPasswordResetEmail(customerEmail: string, customerName: string, token: string) {
  const resetUrl = `${(process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "")}/portal/reset-password?token=${encodeURIComponent(token)}`;
  const subject = "Reset your password - Vistana Tours & Travel";
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #064e3b; margin-top: 0;">Vistana Tours & Travel</h2>
      <p>Dear <strong>${escapeHtml(customerName)}</strong>,</p>
      <p>We received a request to reset your password. This link expires in 1 hour.</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="background-color: #064e3b; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Reset Password</a>
      </p>
      <p style="font-size: 12px; color: #999;">If you didn't request this, you can safely ignore this email. If the button doesn't work, copy this link into your browser: ${resetUrl}</p>
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
      <p>Dear <strong>${escapeHtml(customerName)}</strong>,</p>
      <p>Your booking for <strong>${escapeHtml(tour.title)}</strong> has been updated.</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${color};">
        <p style="margin: 0; font-size: 16px;">New Status: <strong style="color: ${color};">${escapeHtml(booking.status)}</strong></p>
        <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Booking ID: ${escapeHtml(booking.id)}</p>
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


export async function sendInquiryNotificationEmail(
  officeEmail: string,
  inquiry: { name: string; email: string; phone?: string; subject: string; message: string }
) {
  // Strip CR/LF so a crafted subject can never inject extra mail headers.
  const cleanSubject = inquiry.subject.replace(/[\r\n]+/g, " ").slice(0, 150);
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #064e3b; margin-top: 0;">New website inquiry</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #666;">Name:</td><td style="padding: 4px 0; font-weight: bold;">${escapeHtml(inquiry.name)}</td></tr>
        <tr><td style="padding: 4px 0; color: #666;">Email:</td><td style="padding: 4px 0;">${escapeHtml(inquiry.email)}</td></tr>
        <tr><td style="padding: 4px 0; color: #666;">Phone:</td><td style="padding: 4px 0;">${escapeHtml(inquiry.phone || "—")}</td></tr>
        <tr><td style="padding: 4px 0; color: #666;">Subject:</td><td style="padding: 4px 0;">${escapeHtml(cleanSubject)}</td></tr>
      </table>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; white-space: pre-wrap;">${escapeHtml(inquiry.message)}</div>
      <p style="font-size: 12px; color: #999;">Reply directly to the customer at the address above, and mark it Replied in the admin inbox.</p>
    </div>
  `;
  return email.sendEmail({ to: officeEmail, subject: `New inquiry: ${cleanSubject}`, html });
}


export async function sendMeetingEmails(
  officeEmail: string | undefined,
  m: { name: string; email: string; phone?: string; topic: string; channel: string; preferred_date: string; preferred_time: string; notes?: string }
) {
  const when = `${escapeHtml(m.preferred_date)} at ${escapeHtml(m.preferred_time)} (East Africa Time)`;
  const row = (k: string, v: string) =>
    `<tr><td style="padding:4px 0;color:#666;">${k}</td><td style="padding:4px 0;font-weight:bold;">${v}</td></tr>`;

  if (officeEmail) {
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px;">
        <h2 style="color:#064e3b;margin-top:0;">New meeting request</h2>
        <table style="width:100%;border-collapse:collapse;">
          ${row("Name", escapeHtml(m.name))}${row("Email", escapeHtml(m.email))}${row("Phone", escapeHtml(m.phone || "—"))}
          ${row("Preferred time", when)}${row("Format", escapeHtml(m.channel))}${row("Topic", escapeHtml(m.topic))}
        </table>
        ${m.notes ? `<div style="background:#f8fafc;padding:15px;border-radius:6px;margin:16px 0;white-space:pre-wrap;">${escapeHtml(m.notes)}</div>` : ""}
        <p style="font-size:12px;color:#999;">Confirm or reschedule from Admin → Meetings.</p>
      </div>`;
    await email.sendEmail({ to: officeEmail, subject: `New meeting request: ${m.topic.replace(/[\r\n]+/g, " ").slice(0, 100)}`, html });
  }

  const customerHtml = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px;">
      <h2 style="color:#064e3b;margin-top:0;">We've received your meeting request</h2>
      <p>Hi ${escapeHtml(m.name)}, thank you — our team will confirm your request shortly.</p>
      <table style="width:100%;border-collapse:collapse;">
        ${row("Requested time", when)}${row("Format", escapeHtml(m.channel))}${row("Topic", escapeHtml(m.topic))}
      </table>
      <p style="font-size:12px;color:#999;margin-top:20px;">This is a request, not a confirmed slot. We'll email you to confirm or suggest another time.</p>
    </div>`;
  return email.sendEmail({ to: m.email, subject: "We've received your meeting request - Vistana Tours & Travel", html: customerHtml });
}

import LegalPageLayout from "@/components/legal/LegalPageLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Vistana Tours & Travel collects, uses, and protects your personal data.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" effectiveDate="14 July 2026" currentHref="/privacy-policy">
      <section>
        <p>
          This Privacy Policy explains how <strong>Vistana Tours &amp; Travel</strong>
          (&quot;Vistana,&quot; &quot;we,&quot; &quot;us&quot;), headquartered in Arusha, United
          Republic of Tanzania, collects, uses, discloses, and safeguards personal data when you
          visit our website, book a tour, use the customer portal, or contact us. We process
          personal data in accordance with the Tanzania Personal Data Protection Act, 2022 and its
          regulations, and, where applicable to travelers or data originating from Kenya, the
          Kenya Data Protection Act, 2019.
        </p>
      </section>

      <section>
        <h2>1. Data We Collect</h2>
        <h3>Provided directly by you</h3>
        <ul>
          <li>Identity and contact details: name, email, phone/WhatsApp number, nationality.</li>
          <li>Booking details: travel dates, tour/destination selections, number of travelers, dietary or accessibility requirements.</li>
          <li>Travel documents you choose to upload for a booking (e.g. passport photo page, visa, travel insurance certificate, vaccination proof).</li>
          <li>Account credentials for the customer portal.</li>
          <li>Payment-related information at the point a live payment method is enabled (we do not store full card or mobile money PINs &mdash; see Section 4).</li>
          <li>Content you submit voluntarily: contact form messages, reviews, testimonials, newsletter sign-up.</li>
        </ul>
        <h3>Collected automatically</h3>
        <ul>
          <li>Technical data: IP address, browser type, device identifiers, pages visited, referring site.</li>
          <li>Cookies and similar technologies used for session management, security (e.g. rate-limiting abusive requests), and, where you consent, analytics.</li>
        </ul>
      </section>

      <section>
        <h2>2. How We Use Personal Data</h2>
        <ul>
          <li>To create and manage bookings, process payments, and communicate booking status.</li>
          <li>To operate your customer portal account, including saved favorite tours.</li>
          <li>To verify identity and travel documents required by parks, lodges, airlines, or immigration authorities.</li>
          <li>To respond to enquiries submitted via the contact form or WhatsApp.</li>
          <li>To send booking-related transactional emails, and, only with your consent, marketing newsletters (you may unsubscribe at any time).</li>
          <li>To maintain security logs and audit trails of account and admin activity, and to detect fraud or abuse of public-facing forms.</li>
          <li>To comply with legal, tax, and immigration record-keeping obligations in Tanzania and Kenya.</li>
        </ul>
      </section>

      <section>
        <h2>3. Legal Bases for Processing</h2>
        <p>
          We process personal data on the following bases: performance of a booking contract with
          you; our legitimate interests in operating and securing the Platform and preventing
          fraud; compliance with legal obligations (e.g. immigration, tax); and, for marketing
          communications and non-essential cookies, your consent, which you may withdraw at any
          time.
        </p>
      </section>

      <section>
        <h2>4. Sharing of Personal Data</h2>
        <p>We share personal data only where necessary, with:</p>
        <ul>
          <li><strong>Suppliers</strong> (hotels, vehicle operators, guides) required to fulfil your booking &mdash; limited to what they need (e.g. guest names, dates, dietary needs).</li>
          <li><strong>Service providers</strong> who process data on our behalf under contract, including our database host (Supabase), transactional email provider (Resend), and file storage provider (Cloudflare R2). Where a live payment gateway is enabled in future, the relevant payment processor (e.g. M-Pesa, Stripe) will process payment data directly under its own security standards; we do not store full payment card numbers or mobile money PINs.</li>
          <li><strong>Government and immigration authorities</strong> where required for park entry, visas, or by law.</li>
          <li><strong>Professional advisers and authorities</strong> where necessary to establish, exercise, or defend legal claims, or where required by a valid legal or regulatory request.</li>
        </ul>
        <p>We do not sell personal data to third parties.</p>
      </section>

      <section>
        <h2>5. International Transfers</h2>
        <p>
          Because our Suppliers, cloud infrastructure, and offices span Tanzania, Kenya, and
          providers hosted outside East Africa, personal data may be transferred across borders.
          Where data leaves Tanzania or Kenya, we rely on contractual safeguards with our
          processors (see our <a href="/dpa" className="text-emerald-600 dark:text-emerald-400 underline">Data Processing Agreement</a>)
          and select providers that maintain appropriate technical and organizational security
          measures.
        </p>
      </section>

      <section>
        <h2>6. Data Retention</h2>
        <p>
          Booking and financial records are retained for the period required by Tanzanian and
          Kenyan tax and immigration law (generally up to 7 years). Portal account data is retained
          while your account is active and for a reasonable period after closure to resolve
          disputes. Uploaded travel documents are retained only as long as needed for the
          associated booking and any statutory retention period, after which they are deleted or
          anonymized.
        </p>
      </section>

      <section>
        <h2>7. Your Rights</h2>
        <p>Subject to applicable law, you may have the right to:</p>
        <ul>
          <li>Access a copy of the personal data we hold about you.</li>
          <li>Request correction of inaccurate or incomplete data.</li>
          <li>Request deletion of data no longer needed for the purposes above.</li>
          <li>Object to or restrict certain processing, including direct marketing.</li>
          <li>Withdraw consent at any time where processing is based on consent.</li>
          <li>Lodge a complaint with the Tanzania Personal Data Protection Commission or, for Kenyan residents, the Office of the Data Protection Commissioner.</li>
        </ul>
        <p>To exercise these rights, contact us using the details in Section 10.</p>
      </section>

      <section>
        <h2>8. Security</h2>
        <p>
          Passwords are hashed (bcrypt) and never stored in plain text; portal sessions use signed,
          time-limited tokens. Uploaded documents are size- and type-restricted and access-gated to
          authenticated customers and admins. Admin actions are recorded in an audit log. Public
          write endpoints (login, contact form, newsletter) are rate-limited to reduce abuse. No
          system is perfectly secure, and we encourage you to use a strong, unique password for
          your portal account.
        </p>
      </section>

      <section>
        <h2>9. Cookies</h2>
        <p>
          We use strictly necessary cookies (e.g. session authentication) at all times, and
          optional analytics/marketing cookies only where permitted by your cookie preferences.
          You can control cookies through your browser settings; disabling strictly necessary
          cookies may prevent portal login from functioning.
        </p>
      </section>

      <section>
        <h2>10. Contact and Complaints</h2>
        <p>
          For any privacy question or to exercise your rights, contact us at{" "}
          <strong>info@vistanatours.com</strong>, or by post to Serengeti House, Safari Way,
          Arusha, Tanzania. We aim to respond to verified requests within 30 days.
        </p>
      </section>

      <section>
        <h2>11. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy periodically. Material changes will be reflected in an
          updated Effective Date at the top of this page.
        </p>
      </section>
    </LegalPageLayout>
  );
}

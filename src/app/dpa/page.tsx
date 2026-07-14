import LegalPageLayout from "@/components/legal/LegalPageLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Processing Agreement",
  description: "Data Processing Agreement between Vistana Tours & Travel and its corporate customers and sub-processors.",
  alternates: { canonical: "/dpa" },
};

export default function DPAPage() {
  return (
    <LegalPageLayout title="Data Processing Agreement" effectiveDate="14 July 2026" currentHref="/dpa">
      <section>
        <p>
          This Data Processing Agreement (&quot;DPA&quot;) supplements the Terms of Service and/or
          Master Service Agreement between <strong>Vistana Tours &amp; Travel</strong>
          (&quot;Processor&quot; or, where Vistana determines purposes for its own guest data,
          &quot;Controller&quot;) and the corporate customer, travel agency partner, or
          destination management partner identified in the applicable order form (&quot;Customer&quot;
          or &quot;Controller&quot;). It applies where either party processes personal data of
          travelers, staff, or other data subjects on behalf of the other in connection with
          booking, group-travel management, or platform-integration services.
        </p>
      </section>

      <section>
        <h2>1. Definitions</h2>
        <p>
          &quot;Personal Data,&quot; &quot;Processing,&quot; &quot;Controller,&quot;
          &quot;Processor,&quot; and &quot;Data Subject&quot; have the meanings given in the
          Tanzania Personal Data Protection Act, 2022, and, to the extent applicable, the Kenya
          Data Protection Act, 2019. &quot;Sub-processor&quot; means any third party engaged by a
          party to process Personal Data in the course of providing the services (e.g. our
          database, email, or storage providers).
        </p>
      </section>

      <section>
        <h2>2. Roles and Scope</h2>
        <ul>
          <li>Where Vistana processes traveler Personal Data submitted through a Customer&apos;s branded booking flow or API integration on the Customer&apos;s instructions, Vistana acts as Processor and the Customer as Controller.</li>
          <li>Where Vistana determines the purposes and means of processing its own direct guests&apos; data (e.g. bookings made directly on vistanatours.com), Vistana acts as Controller in its own right, and this DPA does not limit Vistana&apos;s obligations as set out in the Privacy Policy.</li>
          <li>The categories of Personal Data, categories of Data Subjects, and duration of processing are as set out in the applicable order form or Master Service Agreement, and generally comprise: traveler name, contact details, passport/ID and visa information, dietary/accessibility needs, and booking/payment metadata.</li>
        </ul>
      </section>

      <section>
        <h2>3. Processor Obligations</h2>
        <p>Where acting as Processor, Vistana shall:</p>
        <ul>
          <li>Process Personal Data only on the Controller&apos;s documented instructions, unless required otherwise by law (in which case Vistana will inform the Controller unless prohibited from doing so).</li>
          <li>Ensure personnel authorized to process the Personal Data are bound by confidentiality obligations.</li>
          <li>Implement appropriate technical and organizational measures against unauthorized or unlawful processing and against accidental loss, destruction, or damage, including the measures described in Section 6.</li>
          <li>Not engage a new Sub-processor without giving the Controller reasonable prior notice and an opportunity to object.</li>
          <li>Assist the Controller, at the Controller&apos;s reasonable cost, in responding to Data Subject rights requests and in meeting its data protection impact assessment and regulator-notification obligations.</li>
          <li>Notify the Controller without undue delay after becoming aware of a Personal Data Breach affecting the Controller&apos;s data, and provide reasonably requested information to assist the Controller with any notification obligations.</li>
          <li>At the Controller&apos;s choice, delete or return all Personal Data at the end of the engagement, save to the extent retention is required by law.</li>
          <li>Make available information reasonably necessary to demonstrate compliance with this DPA and allow for audits by the Controller or its appointed auditor on reasonable notice, no more than once per year absent a security incident.</li>
        </ul>
      </section>

      <section>
        <h2>4. Controller Obligations</h2>
        <p>
          The Controller warrants that it has a valid legal basis for the Personal Data it submits
          or instructs Vistana to collect, and that its instructions to Vistana comply with
          applicable data protection law.
        </p>
      </section>

      <section>
        <h2>5. Sub-processors</h2>
        <p>
          Vistana currently engages the following categories of Sub-processor: cloud database
          hosting (Supabase), transactional email delivery (Resend), and file/object storage
          (Cloudflare R2), and, where a live payment integration is enabled, the applicable
          payment processor (e.g. M-Pesa aggregator, Stripe). An up-to-date list of named
          Sub-processors is available on request to info@vistanatours.com.
        </p>
      </section>

      <section>
        <h2>6. Security Measures</h2>
        <ul>
          <li>Password hashing (bcrypt, 12 salt rounds) and signed, time-limited session tokens rather than raw session identifiers.</li>
          <li>Role-based access control separating admin, staff, and customer portal access.</li>
          <li>Row Level Security enabled at the database layer with default-deny policies for anonymous and authenticated roles.</li>
          <li>Rate-limiting on public-facing write endpoints (authentication, contact form, newsletter) to reduce automated abuse.</li>
          <li>Audit logging of admin create/update/delete actions.</li>
          <li>Restricted file types and size caps on customer document uploads, with access gated to authenticated sessions.</li>
          <li>Scheduled encrypted backups with a tested restore process.</li>
        </ul>
      </section>

      <section>
        <h2>7. International Transfers</h2>
        <p>
          Where Personal Data is transferred outside Tanzania or Kenya to a Sub-processor, Vistana
          will ensure the transfer is made under an appropriate safeguard, such as standard
          contractual clauses with the Sub-processor or another lawful transfer mechanism
          recognized under applicable data protection law.
        </p>
      </section>

      <section>
        <h2>8. Data Subject Rights</h2>
        <p>
          If Vistana receives a request directly from a Data Subject relating to data it processes
          as Processor, it will, unless legally required to respond directly, promptly forward the
          request to the relevant Controller and provide reasonable assistance in responding.
        </p>
      </section>

      <section>
        <h2>9. Liability and Term</h2>
        <p>
          Liability under this DPA is subject to the limitation of liability provisions of the
          underlying Terms of Service or Master Service Agreement. This DPA remains in effect for
          as long as Vistana processes Personal Data on the Customer&apos;s behalf under the
          underlying agreement.
        </p>
      </section>

      <section>
        <h2>10. Governing Law</h2>
        <p>
          This DPA is governed by the laws of the United Republic of Tanzania, consistent with the
          governing law clause of the underlying Terms of Service or Master Service Agreement.
        </p>
      </section>

      <section>
        <h2>11. Contact</h2>
        <p>
          Data protection queries relating to this DPA: <strong>info@vistanatours.com</strong>,
          Serengeti House, Safari Way, Arusha, Tanzania.
        </p>
      </section>
    </LegalPageLayout>
  );
}

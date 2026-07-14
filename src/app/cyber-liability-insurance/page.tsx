import LegalPageLayout from "@/components/legal/LegalPageLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cyber Liability Insurance Statement",
  description: "Vistana Tours & Travel's cyber liability insurance coverage and incident response commitments.",
  alternates: { canonical: "/cyber-liability-insurance" },
};

export default function CyberLiabilityInsurancePage() {
  return (
    <LegalPageLayout
      title="Cyber Liability Insurance Statement"
      effectiveDate="14 July 2026"
      currentHref="/cyber-liability-insurance"
    >
      <section className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4 text-xs text-amber-800 dark:text-amber-300">
        <strong>Note for Vistana management:</strong> the bracketed fields below (insurer name,
        policy number, coverage limits, policy period) must be completed with the details of your
        actual placed policy before this page is relied upon in a corporate Client due-diligence
        pack. Until a policy is bound, this page should be labelled a &quot;draft&quot; internally.
      </section>

      <section>
        <p>
          <strong>Vistana Tours &amp; Travel</strong> recognizes that customers and corporate
          partners entrust us with personal data, including booking details and, where uploaded,
          travel documents. This statement describes our cyber liability insurance coverage and
          our related incident response commitments.
        </p>
      </section>

      <section>
        <h2>1. Coverage Summary</h2>
        <ul>
          <li><strong>Insurer:</strong> [Insurer name to be inserted]</li>
          <li><strong>Policy number:</strong> [Policy number to be inserted]</li>
          <li><strong>Policy period:</strong> [Start date] to [renewal date]</li>
          <li><strong>Aggregate coverage limit:</strong> [Amount, currency] per policy period</li>
          <li><strong>Territorial scope:</strong> Tanzania, Kenya, and East Africa operations, extendable per policy terms</li>
        </ul>
        <p>
          Coverage is intended to respond to first-party costs (forensic investigation, customer
          notification, credit/identity monitoring where applicable, business interruption from a
          network security incident) and third-party liability (claims by customers or partners
          arising from a data breach or network security failure), subject to the full terms,
          conditions, and exclusions of the bound policy, which take precedence over this summary.
        </p>
      </section>

      <section>
        <h2>2. Scope of Data Covered</h2>
        <p>
          The policy is intended to cover incidents affecting personal data processed via the
          Platform, including customer account credentials, booking and traveler details, uploaded
          travel documents, and admin/operational data held in our Supabase database and Cloudflare
          R2 storage.
        </p>
      </section>

      <section>
        <h2>3. Underlying Security Controls</h2>
        <p>Insurance is a financial backstop, not a substitute for security. The following controls are in place and relevant to underwriting this coverage:</p>
        <ul>
          <li>bcrypt password hashing (12 salt rounds); no plaintext password storage.</li>
          <li>Signed, time-limited JWT session tokens rather than raw session identifiers.</li>
          <li>Database Row Level Security with default-deny policies for anonymous and authenticated roles; a service-role key is used server-side only and never exposed to the client.</li>
          <li>Rate-limiting on authentication, contact form, and newsletter endpoints.</li>
          <li>Zod input validation on all API routes.</li>
          <li>Audit logging of admin create/update/delete actions across all admin modules.</li>
          <li>Restricted file type/size on customer document uploads (PDF/JPG/PNG/WEBP, 8MB cap), gated to authenticated sessions.</li>
          <li>Scheduled, tested database backups with a documented restore procedure.</li>
        </ul>
      </section>

      <section>
        <h2>4. Incident Response Commitment</h2>
        <ol>
          <li><strong>Detection and containment:</strong> upon discovering a suspected security incident, affected systems are isolated and access credentials rotated as a first step.</li>
          <li><strong>Assessment:</strong> we determine the scope of data affected and the individuals impacted, engaging external forensic support where warranted under the policy.</li>
          <li><strong>Notification:</strong> affected customers, corporate partners (under the applicable Data Processing Agreement), and, where legally required, the Tanzania Personal Data Protection Commission and/or Kenya Office of the Data Protection Commissioner, are notified without undue delay.</li>
          <li><strong>Remediation:</strong> root cause is addressed and, where relevant, disclosed in summary form to affected corporate partners.</li>
        </ol>
      </section>

      <section>
        <h2>5. Certificates and Due Diligence</h2>
        <p>
          Corporate Clients and travel-trade partners with an active Master Service Agreement may
          request a current certificate of insurance and a summary security questionnaire response
          by writing to info@vistanatours.com.
        </p>
      </section>

      <section>
        <h2>6. Limitations</h2>
        <p>
          This page is a plain-language summary for transparency purposes and is not itself an
          insurance certificate and does not modify, expand, or guarantee coverage. The bound
          policy documents, including any exclusions and sub-limits, govern in the event of any
          discrepancy. Nothing on this page creates a right for any third party to make a direct
          claim against the insurer.
        </p>
      </section>

      <section>
        <h2>7. Contact</h2>
        <p>
          Questions about this statement: <strong>info@vistanatours.com</strong>, Serengeti House,
          Safari Way, Arusha, Tanzania.
        </p>
      </section>
    </LegalPageLayout>
  );
}

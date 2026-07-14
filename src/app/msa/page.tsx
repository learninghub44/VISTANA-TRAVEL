import LegalPageLayout from "@/components/legal/LegalPageLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Master Service Agreement",
  description: "Master Service Agreement for corporate, travel-trade, and destination management partners of Vistana Tours & Travel.",
  alternates: { canonical: "/msa" },
};

export default function MSAPage() {
  return (
    <LegalPageLayout title="Master Service Agreement" effectiveDate="14 July 2026" currentHref="/msa">
      <section>
        <p>
          This Master Service Agreement (&quot;MSA&quot;) sets out the general terms under which{" "}
          <strong>Vistana Tours &amp; Travel</strong>, a tour operator headquartered at Serengeti
          House, Safari Way, Arusha, United Republic of Tanzania (&quot;Vistana&quot;), provides
          tour operating, ground handling, and platform-integration services to corporate clients,
          travel agencies, tour wholesalers, and destination management partners
          (&quot;Client&quot;). Specific engagements, pricing, and service levels are set out in
          individual Order Forms or Statements of Work (each an &quot;Order&quot;) that reference
          and are governed by this MSA. In the event of conflict between an Order and this MSA,
          the Order controls only for the subject matter it expressly addresses.
        </p>
      </section>

      <section>
        <h2>1. Services</h2>
        <p>
          Vistana will provide the tour operating, ground transport, guiding, accommodation
          booking, group-travel coordination, and/or API/booking-platform integration services
          described in the applicable Order (&quot;Services&quot;). Vistana may perform Services
          itself or through Suppliers and subcontractors, and remains responsible to the Client for
          Services performed on its behalf under an Order.
        </p>
      </section>

      <section>
        <h2>2. Orders and Changes</h2>
        <ul>
          <li>Each Order becomes binding once signed or accepted in writing (including by email) by both parties.</li>
          <li>Changes to group size, itinerary, or dates after an Order is accepted must be requested in writing and are subject to availability and price adjustment.</li>
          <li>Vistana will use reasonable efforts to accommodate change requests but does not guarantee availability of Suppliers on short notice.</li>
        </ul>
      </section>

      <section>
        <h2>3. Fees, Invoicing, and Payment</h2>
        <ul>
          <li>Fees for each Order are as stated in that Order, exclusive of applicable taxes and government levies unless stated otherwise.</li>
          <li>Unless a different schedule is agreed in the Order, invoices are payable within 30 days of the invoice date.</li>
          <li>Overdue amounts may accrue interest at the maximum rate permitted by Tanzanian law, and Vistana may suspend Services under any Order while payment is overdue by more than 15 days after written notice.</li>
          <li>Client is responsible for its own withholding tax obligations, if any, under Tanzanian or Kenyan law in respect of payments made to Vistana.</li>
        </ul>
      </section>

      <section>
        <h2>4. Client Obligations</h2>
        <p>
          Client will provide accurate traveler information, timely approvals, and any content or
          branding assets needed for a co-branded booking flow. Client is responsible for ensuring
          its own end travelers are informed of and agree to applicable travel conditions,
          including health, visa, and insurance requirements.
        </p>
      </section>

      <section>
        <h2>5. Data Protection</h2>
        <p>
          To the extent either party processes personal data of travelers on the other&apos;s
          behalf under an Order, the parties&apos; obligations are governed by the{" "}
          <a href="/dpa" className="text-emerald-600 dark:text-emerald-400 underline">Data Processing Agreement</a>,
          which is incorporated into this MSA by reference.
        </p>
      </section>

      <section>
        <h2>6. Intellectual Property</h2>
        <p>
          Each party retains ownership of its own pre-existing intellectual property. Content,
          itineraries, and materials created specifically for an Order are owned as specified in
          that Order; absent such a specification, Vistana retains ownership of itinerary designs
          and grants Client a non-exclusive license to use them for the purpose of the engagement.
        </p>
      </section>

      <section>
        <h2>7. Confidentiality</h2>
        <p>
          Each party will keep confidential any non-public business, pricing, or traveler
          information disclosed by the other party in connection with an Order, using at least the
          same degree of care it uses for its own confidential information, and will use such
          information only to perform its obligations under this MSA.
        </p>
      </section>

      <section>
        <h2>8. Insurance</h2>
        <p>
          Vistana maintains public liability insurance appropriate to its tour operations and, as
          described in our{" "}
          <a href="/cyber-liability-insurance" className="text-emerald-600 dark:text-emerald-400 underline">Cyber Liability Insurance Statement</a>,
          cyber liability coverage appropriate to the personal data it processes through the
          Platform. Certificates of insurance are available to corporate Clients on request.
        </p>
      </section>

      <section>
        <h2>9. Limitation of Liability</h2>
        <p>
          Except for liability arising from death or personal injury caused by negligence, fraud,
          or a breach of the confidentiality or data protection obligations above, each party&apos;s
          aggregate liability under this MSA and any Order is limited to the fees paid or payable
          under the relevant Order in the 12 months preceding the claim. Neither party is liable
          for indirect, special, or consequential losses, including loss of profit or business
          opportunity.
        </p>
      </section>

      <section>
        <h2>10. Force Majeure</h2>
        <p>
          Neither party is liable for delay or failure to perform caused by events beyond its
          reasonable control, including natural disaster, government action, border closures,
          epidemic-related restriction, civil unrest, or failure of third-party transport or
          utility providers, provided the affected party gives prompt notice and uses reasonable
          efforts to mitigate the impact.
        </p>
      </section>

      <section>
        <h2>11. Term and Termination</h2>
        <ul>
          <li>This MSA remains in effect while at least one Order under it is active, and either party may terminate it on 60 days&apos; written notice provided all active Orders have been completed or separately terminated.</li>
          <li>Either party may terminate an Order or this MSA immediately on written notice for the other party&apos;s uncured material breach (15 days&apos; cure period after notice) or insolvency.</li>
          <li>Confidentiality, data protection, payment, and limitation-of-liability obligations survive termination.</li>
        </ul>
      </section>

      <section>
        <h2>12. Governing Law and Disputes</h2>
        <p>
          This MSA and any Order issued under it are governed by the laws of the United Republic
          of Tanzania. The parties will first attempt to resolve any dispute through good-faith
          negotiation between senior representatives, escalating to mediation, and, failing
          settlement within 60 days, to the exclusive jurisdiction of the courts of Tanzania, or to
          arbitration seated in Arusha or Dar es Salaam if the parties agree in the applicable
          Order.
        </p>
      </section>

      <section>
        <h2>13. General</h2>
        <p>
          This MSA, together with any Orders, is the entire agreement between the parties on its
          subject matter and supersedes prior discussions on the same subject. Neither party may
          assign this MSA without the other&apos;s prior written consent, except to a successor of
          substantially all its business. If any provision is held unenforceable, the remainder of
          the MSA continues in effect.
        </p>
      </section>

      <section>
        <h2>14. Contact</h2>
        <p>
          Corporate and travel-trade enquiries: <strong>info@vistanatours.com</strong>, Serengeti
          House, Safari Way, Arusha, Tanzania.
        </p>
      </section>
    </LegalPageLayout>
  );
}

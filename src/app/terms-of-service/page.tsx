import LegalPageLayout from "@/components/legal/LegalPageLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service governing use of the Vistana Tours & Travel website and booking platform.",
  alternates: { canonical: "/terms-of-service" },
};

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service" effectiveDate="14 July 2026" currentHref="/terms-of-service">
      <section>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern access to and use of the website,
          booking portal, and related services (together, the &quot;Platform&quot;) operated by
          <strong> Vistana Tours &amp; Travel</strong> (&quot;Vistana,&quot; &quot;we,&quot;
          &quot;us,&quot; or &quot;our&quot;), a tour operator with its principal place of
          business in the United Republic of Tanzania and a liaison office in Nairobi, Kenya.
          By creating an account, submitting a booking enquiry, or otherwise using the
          Platform, you (&quot;Customer,&quot; &quot;you&quot;) agree to be bound by these Terms.
          If you do not agree, do not use the Platform.
        </p>
      </section>

      <section>
        <h2>1. Who We Are</h2>
        <p>
          Vistana Tours &amp; Travel arranges safaris, tours, accommodation, transport, and
          guiding services across Tanzania, Kenya, Zanzibar, and wider East Africa, acting
          either as principal tour operator or as agent for third-party hotels, vehicle
          operators, guides, and other suppliers (&quot;Suppliers&quot;). Where we act as agent,
          your contract for the underlying service (e.g. a hotel stay) may also be directly
          with the relevant Supplier, and that Supplier&apos;s own terms may apply in addition to
          these Terms.
        </p>
      </section>

      <section>
        <h2>2. Bookings and Confirmation</h2>
        <ul>
          <li>A booking request submitted through the Platform is an offer to purchase, which we may accept, decline, or amend based on availability.</li>
          <li>A booking is only confirmed once you receive written confirmation (email or portal status change) and any required deposit or payment has been received.</li>
          <li>You are responsible for ensuring all traveler names, passport details, dates, and special requirements submitted are accurate; we are not liable for losses caused by inaccurate information you provide.</li>
          <li>Certain bookings may require supporting documents (e.g. passport copies, travel insurance proof) to be uploaded via the portal before travel; failure to provide these may result in denied entry to parks, lodges, or transport with no liability to us.</li>
        </ul>
      </section>

      <section>
        <h2>3. Prices and Payment</h2>
        <ul>
          <li>Prices are quoted in the currency shown at checkout or in your confirmation and may include or exclude park fees, government levies, and taxes as stated on each tour listing.</li>
          <li>We accept payment methods made available on the Platform from time to time (which may include mobile money, bank transfer, or card payment); availability of a given method does not guarantee it is enabled for every booking.</li>
          <li>Prices may change before a booking is confirmed due to currency fluctuation, fuel surcharges, park fee increases, or Supplier price changes; you will be notified before any change is applied to a confirmed booking.</li>
          <li>Full payment must be received by the deadline stated in your confirmation; late payment may result in automatic cancellation under our Refund Policy.</li>
        </ul>
      </section>

      <section>
        <h2>4. Cancellations, Amendments, and Refunds</h2>
        <p>
          Cancellations, date changes, and refund eligibility are governed by our{" "}
          <a href="/refund-policy" className="text-emerald-600 dark:text-emerald-400 underline">Refund Policy</a>,
          which forms part of these Terms. Some Suppliers (e.g. certain lodges during peak season) apply their own
          non-refundable or restricted-change conditions, which will be disclosed at the time of booking.
        </p>
      </section>

      <section>
        <h2>5. Traveler Conduct, Health, and Safety</h2>
        <ul>
          <li>You are responsible for holding valid travel documents, visas, and any vaccinations or health certificates required for your itinerary.</li>
          <li>We strongly recommend comprehensive travel insurance covering medical evacuation, trip cancellation, and personal belongings for all bookings.</li>
          <li>Guides and operators may refuse to carry or continue a tour with a traveler whose conduct endangers themselves, other travelers, staff, or wildlife, without refund.</li>
          <li>Activities such as game drives, hiking, and water-based excursions carry inherent risk; you participate at your own risk and must follow all safety instructions given by guides and Suppliers.</li>
        </ul>
      </section>

      <section>
        <h2>6. Customer Portal Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your login credentials and
          for all activity under your account. Notify us immediately at the contact details below
          if you suspect unauthorized access. We may suspend or terminate an account that violates
          these Terms, provides fraudulent information, or is used for abusive conduct toward staff
          or Suppliers.
        </p>
      </section>

      <section>
        <h2>7. Intellectual Property</h2>
        <p>
          All content on the Platform &mdash; including text, photography, itineraries, logos, and
          the &quot;Vistana Tours &amp; Travel&quot; brand &mdash; is owned by or licensed to us and
          may not be copied, scraped, or reused commercially without our prior written consent.
        </p>
      </section>

      <section>
        <h2>8. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by the laws of the United Republic of Tanzania, our
          liability for any claim arising from a booking is limited to the amount you paid for
          the affected booking. We are not liable for indirect or consequential loss, for acts or
          omissions of independent third-party Suppliers, or for events beyond our reasonable
          control (see Force Majeure below). Nothing in these Terms excludes liability that cannot
          lawfully be excluded, including for death or personal injury caused by our negligence.
        </p>
      </section>

      <section>
        <h2>9. Force Majeure</h2>
        <p>
          We are not liable for failure to perform any obligation caused by events beyond our
          reasonable control, including natural disasters, extreme weather, government action,
          border closures, epidemic or pandemic-related restrictions, civil unrest, strikes, or
          failure of third-party transport or utility providers. Where a booking is affected, we
          will work with you in good faith on rescheduling or crediting amounts paid, subject to
          what we can recover from affected Suppliers.
        </p>
      </section>

      <section>
        <h2>10. Governing Law and Disputes</h2>
        <p>
          These Terms are governed by the laws of the United Republic of Tanzania. Any dispute
          that cannot be resolved informally within 30 days shall be submitted first to mediation
          and, failing settlement, to the exclusive jurisdiction of the courts of Tanzania. Nothing
          in this clause prevents a Kenyan-resident traveler from raising a consumer complaint with
          the relevant Kenyan consumer protection body for informal resolution before formal
          proceedings.
        </p>
      </section>

      <section>
        <h2>11. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time to reflect changes in our services or
          applicable law. The &quot;Effective Date&quot; above will be updated accordingly, and
          material changes will be highlighted on this page. Continued use of the Platform after
          an update constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section>
        <h2>12. Contact</h2>
        <p>
          Questions about these Terms can be directed to <strong>info@vistanatours.com</strong> or
          our offices at Serengeti House, Safari Way, Arusha, Tanzania, or Vistana Plaza, Ngong
          Road, Nairobi, Kenya.
        </p>
      </section>
    </LegalPageLayout>
  );
}

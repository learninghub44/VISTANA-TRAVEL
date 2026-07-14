import LegalPageLayout from "@/components/legal/LegalPageLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Cancellation, amendment, and refund terms for Vistana Tours & Travel bookings.",
  alternates: { canonical: "/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout title="Refund Policy" effectiveDate="14 July 2026" currentHref="/refund-policy">
      <section>
        <p>
          This Refund Policy explains how cancellations, date changes, and refunds are handled for
          bookings made with <strong>Vistana Tours &amp; Travel</strong>. It forms part of our{" "}
          <a href="/terms-of-service" className="text-emerald-600 dark:text-emerald-400 underline">Terms of Service</a>.
          Where a specific tour, hotel, or Supplier has different published conditions (for example
          a non-refundable peak-season rate), those conditions will be shown at checkout and take
          precedence over the general schedule below.
        </p>
      </section>

      <section>
        <h2>1. Standard Cancellation Schedule</h2>
        <p>Unless a stricter Supplier condition applies, cancellations made by the customer are refunded as follows, calculated from the confirmed tour start date:</p>
        <ul>
          <li><strong>30+ days before departure:</strong> full refund of amounts paid, less any non-refundable third-party deposits already committed on your behalf (e.g. park permits, flying-safari seats).</li>
          <li><strong>15&ndash;29 days before departure:</strong> 50% refund of amounts paid.</li>
          <li><strong>7&ndash;14 days before departure:</strong> 25% refund of amounts paid.</li>
          <li><strong>Less than 7 days before departure, or no-show:</strong> no refund.</li>
        </ul>
      </section>

      <section>
        <h2>2. How to Request a Cancellation or Refund</h2>
        <p>
          Cancellation requests must be submitted in writing via the customer portal booking page,
          or by email to info@vistanatours.com from the email address used to book. The
          cancellation date is the date we receive the written request, not the date you intend to
          travel from.
        </p>
      </section>

      <section>
        <h2>3. Date Changes and Amendments</h2>
        <ul>
          <li>Requests to move travel dates are treated as an amendment, not a cancellation, and are subject to availability.</li>
          <li>One free date change is permitted where requested more than 30 days before departure, subject to Supplier availability and any price difference for the new dates.</li>
          <li>Date changes requested within 30 days of departure are treated under the cancellation schedule in Section 1 unless the affected Supplier agrees otherwise.</li>
        </ul>
      </section>

      <section>
        <h2>4. Cancellations or Changes Initiated by Vistana</h2>
        <p>
          If we cancel a confirmed booking for reasons within our control (for example, an
          operational issue on our side rather than Supplier unavailability or force majeure), you
          will receive a full refund or, if you prefer, a credit toward a future booking of equal
          value. If we must substantially change a confirmed itinerary (e.g. a different lodge of
          materially lower standard), we will offer a suitable alternative, a partial refund
          reflecting the difference, or a full refund if no suitable alternative is available.
        </p>
      </section>

      <section>
        <h2>5. Force Majeure</h2>
        <p>
          Where a booking cannot proceed due to force majeure (natural disaster, government
          travel restriction, pandemic-related closure, civil unrest, or similar event beyond
          either party&apos;s control), we will work in good faith to offer rescheduling or a
          credit note. A cash refund in force majeure circumstances is limited to amounts we are
          able to recover from the affected Suppliers, since many park fees, flying-safari seats,
          and peak-season lodge deposits are non-refundable to us once paid.
        </p>
      </section>

      <section>
        <h2>6. Refund Method and Timing</h2>
        <p>
          Approved refunds are issued to the original payment method used at booking (mobile
          money, bank transfer, or card, as applicable) and are typically processed within 14
          business days of approval. Your bank or mobile money provider&apos;s own processing time
          may add further delay outside our control.
        </p>
      </section>

      <section>
        <h2>7. Non-Refundable Items</h2>
        <ul>
          <li>Travel insurance premiums paid to a third-party insurer.</li>
          <li>Visa or immigration fees already paid to a government authority.</li>
          <li>Flying-safari and scheduled charter flight seats once ticketed, unless the operating airline&apos;s own policy allows a refund.</li>
          <li>Any amount expressly marked &quot;non-refundable&quot; on the tour listing at the time of booking.</li>
        </ul>
      </section>

      <section>
        <h2>8. Complaints About Refund Decisions</h2>
        <p>
          If you disagree with a refund decision, you may request a review by emailing
          info@vistanatours.com with your booking reference. Unresolved disputes are handled under
          the dispute resolution and governing law clause of our Terms of Service.
        </p>
      </section>

      <section>
        <h2>9. Contact</h2>
        <p>
          Refund and cancellation queries: <strong>info@vistanatours.com</strong>, Serengeti
          House, Safari Way, Arusha, Tanzania.
        </p>
      </section>
    </LegalPageLayout>
  );
}

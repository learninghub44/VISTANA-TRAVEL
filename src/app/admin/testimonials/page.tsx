import { db } from "@/services/db";
import TestimonialsManager from "@/components/admin/TestimonialsManager";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const testimonials = await db.getTestimonials();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">Testimonial Management</h1>
        <p className="text-xs text-slate-450 mt-1">
          Add, edit, and delete guest testimonials shown on the homepage.
        </p>
      </div>
      <TestimonialsManager testimonials={testimonials} />
    </div>
  );
}

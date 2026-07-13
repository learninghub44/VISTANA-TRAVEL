import { db } from "@/services/db";
import GalleryManager from "@/components/admin/GalleryManager";

export default async function AdminGalleryPage() {
  const images = await db.getGalleryImages();
  const destinations = await db.getDestinations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Gallery Management</h1>
        <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">
          Add and remove photos shown in the homepage gallery.
        </p>
      </div>
      <GalleryManager images={images} destinations={destinations} />
    </div>
  );
}

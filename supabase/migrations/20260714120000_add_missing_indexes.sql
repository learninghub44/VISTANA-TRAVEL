-- Missing indexes on foreign keys / frequently-filtered columns that the
-- baseline schema left out. Without these, every one of the following goes
-- through a full table scan as the tables grow:
--
--   - getToursByDestination()          -> tours.destination_id
--   - saveGalleryImage / gallery pages -> gallery_images.destination_id
--   - getReviews(tourId, approvedOnly) -> reviews.status (tour_id already indexed)
--   - getTestimonials(featuredOnly)    -> testimonials.featured
--   - bookings admin filters/status    -> bookings.status
--   - tours category filter (tours page/UI) -> tours.category
--
-- Safe to run multiple times (all guarded with IF NOT EXISTS).

create index if not exists tours_destination_id_idx on tours(destination_id);
create index if not exists tours_category_idx on tours(category);

create index if not exists gallery_images_destination_id_idx on gallery_images(destination_id);

create index if not exists reviews_status_idx on reviews(status);
-- Composite index for the common "approved reviews for this tour" query.
create index if not exists reviews_tour_id_status_idx on reviews(tour_id, status);

create index if not exists testimonials_featured_idx on testimonials(featured) where featured = true;

create index if not exists bookings_status_idx on bookings(status);

import { useLocation, useParams } from "react-router-dom";
import { useEventById } from "@/hooks/useEvents";
import Layout from "@/components/layout/Layout";
import Gallery from "./Gallery";
import ServiceDescription from "./ServiceDescription";
import TestimonialsSection from "../home/TestimonialSection";
import EventsCollection from "../featured-collection/EventsCollection";
import FeaturedEventSection from "@/components/featured-collection/FeaturedEventSection";
import ContactCTA from "@/components/home/ContactCTA";

const IndividualEventPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { id } = location.state as { id: string };

  const { data: eventData, isLoading, error } = useEventById(id);

  if (isLoading) {
    return (
      <div className="pt-40 flex flex-col items-center justify-center text-white text-lg animate-fadeIn">
        <div className="w-12 h-12 border-4 border-[#6c1466] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-black">Loading event details...</p>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="pt-40 px-4 text-center text-lg text-red-500">
        Failed to load the event.
      </div>
    );
  }

  return (
    <Layout>
      {/* Gallery Section */}
      <div className="pt-40 pb-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-6">
          {eventData.title}
        </h1>
        <Gallery images={eventData.additional_images ?? []} />
      </div>

      {/* Description Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <ServiceDescription
          title={eventData.title ?? ""}
          description={eventData.description ?? ""}
          bulletPoints={eventData.bullet_points ?? []}
        />
      </div>

      {/* Testimonials */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <TestimonialsSection />
      </div>

      {/* Related Event Services */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <EventsCollection />
      </div>

      {/* Featured Events */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <FeaturedEventSection />
      </div>

      {/* CTA */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ContactCTA />
      </div>
    </Layout>
  );
};

export default IndividualEventPage;

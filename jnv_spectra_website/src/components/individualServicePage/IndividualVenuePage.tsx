import { useLocation, useParams } from "react-router-dom";

import Layout from "@/components/layout/Layout";
import Gallery from "./Gallery";
import ServiceDescription from "./ServiceDescription";
import TestimonialsSection from "../home/TestimonialSection";
import EventsCollection from "../featured-collection/EventsCollection";
import FeaturedEventSection from "@/components/featured-collection/FeaturedEventSection";
import ContactCTA from "@/components/home/ContactCTA";
import { useVenueById } from "@/hooks/useVenues";

const galleryImages = [
  
  "https://cdn.builder.io/api/v1/image/assets/TEMP/239fd35e90ca711891986659537b40688a6f05c5",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/7cfc2dd70fbd7aa62d1f05a098aaa39f4261eee2",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/7a903c5adc9dee409ace3b39db461039fd02dc7a",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/d09ade87bc965a519ae73d36f0c2707b378f5d03",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/239fd35e90ca711891986659537b40688a6f05c5",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/7cfc2dd70fbd7aa62d1f05a098aaa39f4261eee2",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/239fd35e90ca711891986659537b40688a6f05c5",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/7cfc2dd70fbd7aa62d1f05a098aaa39f4261eee2",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/7a903c5adc9dee409ace3b39db461039fd02dc7a",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/d09ade87bc965a519ae73d36f0c2707b378f5d03",
  // "https://cdn.builder.io/api/v1/image/assets/TEMP/239fd35e90ca711891986659537b40688a6f05c5",
  // "https://cdn.builder.io/api/v1/image/assets/TEMP/7cfc2dd70fbd7aa62d1f05a098aaa39f4261eee2",

]
const IndividualVenuePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { id } = location.state as { id: string };
  // console.log(id);

  const { data: venueData, isLoading, error } = useVenueById(id);

  if (isLoading) {
    return(<div className="pt-40 flex flex-col items-center justify-center text-white text-lg animate-fadeIn">
    <div className="w-12 h-12 border-4 border-[#6c1466] border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-black">Loading venue details...</p>
  </div>);
  }

  if (error || !venueData) {
    return <div className="pt-40 text-center">Failed to load venue details.</div>;
  }

  return (
    <Layout>
      {/* Gallery Section */}
      <div className="flex flex-col px-4 sm:px-6 lg:px-8 py-8 pt-40 max-w-7xl mx-auto w-full">
        <div>
          <p className="text-2xl sm:text-3xl font-medium text-gray-900 mb-4">
            {venueData.title}
          </p>
        </div>
        {/* Pass venue images or a fallback */}
        <Gallery images={venueData.additional_images ?? []} />
      </div>

      {/* Description Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <ServiceDescription
         title={venueData.title??""}
  description={venueData.description ?? ""}
  bulletPoints={venueData.bullet_points ?? []}
/>

      </div>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Related Services */}
      <div className="px-4 sm:px-6 lg:px-8">
        <EventsCollection />
      </div>

      {/* Featured Events */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <FeaturedEventSection />
      </div>

      {/* Contact CTA */}
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto">
        <ContactCTA />
      </div>
    </Layout>
  );
};

export default IndividualVenuePage;
